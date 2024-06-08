# XShield: Cyberbullying Detection Website

![XShield Logo](link-to-your-logo)

## Overview

XShield is a cutting-edge web application designed to detect cyberbullying on Twitter in real-time. By utilizing fine-tuned BERT models, XShield provides a powerful tool for monitoring and analyzing online interactions to improve online safety and foster a healthier social media environment.

## Features

- **Real-Time Analysis:** Continuously monitors Twitter for potential cyberbullying incidents.
- **Advanced Machine Learning:** Utilizes fine-tuned BERT models for accurate detection.
- **User-Friendly Interface:** Easy-to-use interface for monitoring and intervention.
- **Detailed Reports:** Generates comprehensive reports on detected incidents.
- **Multi-Language Support:** Currently supports English language detection.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python
- **Machine Learning:** BERT, PyTorch
- **APIs:** Twitter API for real-time data fetching
- **Web Scraping:** Using `nitscrapper` for testing on other websites with comments

## Installation

### Prerequisites

- Python 3.x
- Pip
- Git
- Twitter Developer Account (for API access)

### Steps

1. **Clone the Repository:**
    ```sh
    git clone https://github.com/yourusername/xshield.git
    cd xshield
    ```

2. **Create a Virtual Environment:**
    ```sh
    python -m venv venv
    source venv/bin/activate   # On Windows use `venv\Scripts\activate`
    ```

3. **Install Dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

4. **Set Up Environment Variables:**
    Create a `.env` file in the root directory and add your Twitter API keys:
    ```env
    TWITTER_API_KEY=your_api_key
    TWITTER_API_SECRET_KEY=your_api_secret_key
    TWITTER_ACCESS_TOKEN=your_access_token
    TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
    ```

5. **Run the Application:**
    ```sh
    python app.py
    ```

## Usage

- Navigate to `http://localhost:5000` in your web browser.
- Enter a Twitter handle or hashtag to monitor.
- View real-time analysis and reports on potential cyberbullying incidents.

## Web Scraping

For now, we use `nitscrapper` for scraping comments from Twitter for testing purposes. Ensure you comply with the website's terms of service and legal guidelines when scraping data.

## Contributing

We welcome contributions to XShield! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request.



## Contact

For any inquiries or feedback, please contact:

- Joud Alfaouri
- Email: [joudalfaouri@gmail.com](mailto:joudalfaouri@gmail.com)
- LinkedIn: [joud alfaouri](https://www.linkedin.com/in/joudalfaouri)

---

Thank you for using XShield! Together, we can create a safer online community.
