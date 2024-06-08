from flask import Flask, request, jsonify, current_app, g
from flask_cors import CORS
import sqlite3
import bcrypt
import os
import pandas as pd
import torch
import logging
from transformers import BertTokenizer
from torch.utils.data import DataLoader
from model import BertClassifier, TextClassificationDataset, clean_text, load_model, get_tokenizer
from ntscraper import Nitter
import csv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import time
# Setting up logging
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24))

'''************************************************************************'
                            DATABASE
******************************************************************************'''

# Helper functions for DB connection and initialization
def get_db_connection():
    try:
        if 'db' not in g:
            g.db = sqlite3.connect('users.db')
            g.db.row_factory = sqlite3.Row
        return g.db
    except sqlite3.Error as e:
        current_app.logger.error(f"An error occurred: {e}")
        return None

def init_db():
    with app.app_context():
        db = get_db_connection()
        db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                receive_updates BOOLEAN NOT NULL
            );
        ''')
        db.commit()
        db.close()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password', '').encode('utf-8')
    receive_updates = data.get('receive_updates', False)

    if not (full_name and email and password):
        return jsonify({'message': 'All fields are required'}), 400

    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    try:
        with get_db_connection() as conn:
            conn.execute('''
                INSERT INTO users (full_name, email, password, receive_updates)
                VALUES (?, ?, ?, ?)
            ''', (full_name, email, hashed_password, receive_updates))
            conn.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Registration successful',
            'user': {
                'name': full_name,
                'email': email
            }
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already registered.'}), 409
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password').encode('utf-8')

    with get_db_connection() as conn:
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        if user and bcrypt.checkpw(password, user['password']):
            return jsonify({
            'status': 'success',
            'message': 'Logged in successfully.',
            'user': {
                'name': user['full_name'],  # Ensure this column name matches your database schema
                'email': user['email']
            }
        })
        else:
            return jsonify({'status': 'error', 'message': 'Invalid email or password.'}), 401

@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('password').encode('utf-8')

    hashed_password = bcrypt.hashpw(new_password, bcrypt.gensalt())

    with get_db_connection() as conn:
        result = conn.execute('UPDATE users SET password = ? WHERE email = ?', (hashed_password, email))
        conn.commit()
        
        if result.rowcount == 0:
            return jsonify({'status': 'error', 'message': 'Email not found.'}), 404

    return jsonify({'status': 'success', 'message': 'Password has been reset.'})

'''********************************************
DETECT
***********************************************'''

scraper = Nitter(0)
# Load tokenizer and model
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', do_lower_case=True)
checkpoint_path = 'backend/bert_classifier_fold_6.pth'
model = BertClassifier()
checkpoint = torch.load(checkpoint_path, map_location=torch.device('cpu'))
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

# CSV file setup
csv_file_path = 'text_with_predictions_test79.csv'
if not os.path.isfile(csv_file_path):
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['text', 'prediction'])

@app.route('/fetch_tweets', methods=['POST'])
def fetch_tweets():
    try:
        username = request.form['username']
        
        tweets = scraper.get_tweets(username, mode='user', number=15)
        if not tweets['tweets']:
            return jsonify({'message': 'No tweets found for this username', 'data': []}), 404

        data = [[x['link'], x['text'], x['date'], x['stats']['likes'], x['stats']['comments']] for x in tweets['tweets']]
        df = pd.DataFrame(data, columns=['twitter_link', 'text', 'date', 'likes', 'comments'])

        # Process and classify tweets
        df['processed_text'] = df['text'].apply(clean_text)
        dataset = TextClassificationDataset(df['processed_text'].tolist(), [0]*len(df), tokenizer, 128)
        dataloader = DataLoader(dataset, batch_size=64, shuffle=False)

        predictions = []
        for batch in dataloader:
            inputs = {'input_ids': batch['input_ids'].to('cpu'), 'attention_mask': batch['attention_mask'].to('cpu')}
            with torch.no_grad():
                outputs = model(**inputs)
            logits = outputs
            preds = torch.argmax(logits, dim=1).cpu().tolist()
            predictions.extend(preds)

        df['prediction'] = predictions
        result = df[['twitter_link', 'text', 'prediction']].to_dict(orient='records')

        # Write tweet and prediction to CSV
        df[['text', 'prediction']].to_csv(csv_file_path, mode='a', header=False, index=False, encoding='utf-8')

        '''# Send email notifications for cyberbullying tweets
        for index, row in df.iterrows():
            if row['prediction'] == 1:  # Assuming 1 indicates cyberbullying
                send_email_notification(gmail_user, gmail_password, email, row['text'])
                logging.info("Email sent")
                print(f"the email: {email}")'''

        return jsonify({'message': f"Tweets fetched and classified for {username}", 'data': result})
    except Exception as e:
        logging.error(f"Error fetching tweets: {e}")
        return jsonify({'error': str(e)}), 500

'''def send_email_notification(gmail_user, gmail_password, recipient_email, tweet):
    try:
        subject = "Cyberbullying Alert"
        mess = f"A tweet has been detected as cyberbullying:\n\n{tweet}"
        text = f"Subject:{subject}\n\n{mess}"

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, recipient_email, text)
        server.quit()
        logging.info("Email sent successfully")
    except Exception as e:
        logging.error(f"Failed to send email: {e}")'''
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get('text')

        # Process and classify input text
        processed_text = clean_text(text)
        dataset = TextClassificationDataset([processed_text], [0], tokenizer, 128)
        dataloader = DataLoader(dataset, batch_size=1, shuffle=False)

        for batch in dataloader:
            inputs = {'input_ids': batch['input_ids'].to('cpu'), 'attention_mask': batch['attention_mask'].to('cpu')}
            with torch.no_grad():
                outputs = model(**inputs)
            logits = outputs
            preds = torch.argmax(logits, dim=1).cpu().tolist()

        prediction = preds[0]
        return jsonify({'text': text, 'prediction': prediction})
    except Exception as e:
        logging.error(f"Error making prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)