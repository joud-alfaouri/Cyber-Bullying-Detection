document.addEventListener('DOMContentLoaded', function () {
    var activateButton = document.getElementById('activateButton');
    var tweetDisplay = document.getElementById('tweetDisplay');
    var predictionDisplay = document.getElementById('predictionDisplay');
    var nextTweetButton = document.getElementById('nextTweetButton');
    var classifyButton = document.getElementById('classifyButton');
    var tweetsData = [];
    var index = 0;
    var classificationDone = false;

    activateButton.addEventListener('click', function(event) {
        event.preventDefault();
        var userLink = document.getElementById('userLink').value;
        fetchTweets(userLink);
    });

    nextTweetButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (!classificationDone) {
            showNextTweet();
        } else {
            showNextTweetWithPrediction();
        }
    });

    classifyButton.addEventListener('click', function(event) {
        event.preventDefault();
        classificationDone = true;
        index = 0;  // Reset index to start showing from the first tweet again
        showNextTweetWithPrediction();
        classifyButton.style.display = 'none'; // Hide classify button after starting classification
    });

    function fetchTweets(username) {
        fetch('http://127.0.0.1:5000/fetch_tweets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'username=' + encodeURIComponent(username) + '&email=' + encodeURIComponent('recipient_email@gmail.com') // Add recipient email here
        })
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.length > 0) {
                tweetsData = data.data;
                index = 0;
                displayTweet();
                nextTweetButton.style.display = 'inline';
                classifyButton.style.display = 'inline'; // Show classify button
            } else {
                alert('No tweets available or data is invalid.');
                nextTweetButton.style.display = 'none';
                classifyButton.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching tweets:', error);
            alert('Failed to fetch tweets: ' + error.message);
        });
    }

    function displayTweet() {
        if (index < tweetsData.length) {
            tweetDisplay.innerHTML = tweetsData[index].text;
            predictionDisplay.innerHTML = ''; // Clear previous predictions
        } else {
            tweetDisplay.innerHTML = 'No more tweets to display.';
            predictionDisplay.innerHTML = '';
            nextTweetButton.style.display = 'none'; // Hide next button when done
            if (!classificationDone) {
                classifyButton.style.display = 'inline'; // Show classify button if not classified yet
            }
        }
    }

    function showNextTweet() {
        index++;
        if (index < tweetsData.length) {
            displayTweet();
        } else {
            tweetDisplay.innerHTML = 'End of initial tweets. You can classify them.';
            predictionDisplay.innerHTML = '';
            nextTweetButton.style.display = 'none'; // Hide next button until classify is clicked
            classifyButton.style.display = 'inline'; // Show classify button
        }
    }

    function showNextTweetWithPrediction() {
        if (index < tweetsData.length) {
            tweetDisplay.innerHTML = tweetsData[index].text;
            var predictionText = (tweetsData[index].prediction === 1) ? 'Cyberbullying' : 'Not Cyberbullying';
            predictionDisplay.innerHTML = `Prediction -> ${predictionText}`;
            // Change prediction display color based on the prediction
            predictionDisplay.style.color = (tweetsData[index].prediction === 1) ? 'red' : 'green';
            index++;
            nextTweetButton.style.display = 'inline'; // Ensure next button shows for predictions
        } else {
            tweetDisplay.innerHTML = 'End of tweets with predictions.';
            predictionDisplay.innerHTML = '';
            nextTweetButton.style.display = 'none'; // Hide next button when done
        }
    }
});
