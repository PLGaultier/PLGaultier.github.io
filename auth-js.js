let currentUser = null;

function login() {
    console.log('Login function called');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log('Username:', username, 'Password:', password);

    if (username && password) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        console.log('Login successful');
        updateUI();
    } else {
        console.log('Login failed: missing username or password');
        alert('Please enter both username and password');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUI();
}

function updateUI() {
    console.log('Updating UI');
    const loginSection = document.getElementById('login-section');
    const quizSection = document.getElementById('quiz-section');
    const userDisplay = document.getElementById('user-display');

    if (currentUser) {
        console.log('User is logged in');
        loginSection.style.display = 'none';
        quizSection.style.display = 'block';
        userDisplay.textContent = `Welcome, ${currentUser}!`;
    } else {
        console.log('User is not logged in');
        loginSection.style.display = 'block';
        quizSection.style.display = 'none';
        userDisplay.textContent = '';
    }
}

window.onload = function() {
    currentUser = localStorage.getItem('currentUser');
    updateUI();
}