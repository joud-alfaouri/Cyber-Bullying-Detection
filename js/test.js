document.addEventListener('DOMContentLoaded', function () {
    var predictButton = document.querySelector('.form_container2 button');
    var inputField = document.querySelector('.message-box2');
    var outputField = document.querySelector('.message-box2[readonly]');

    predictButton.addEventListener('click', function (event) {
        event.preventDefault();
        var inputText = inputField.value;

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.prediction === 1) {
                outputField.value = 'Cyberbullying';
                outputField.style.color = 'red';
            } else {
                outputField.value = 'Not Cyberbullying';
                outputField.style.color = 'green';
            }
        })
        .catch(error => {
            console.error('Error making prediction:', error);
            alert('Failed to get prediction: ' + error.message);
        });
    });
});
