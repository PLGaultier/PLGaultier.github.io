let quizData;
let currentQuestionIndex = 0;
let score = 20;
const selectedOptions = new Set();
let timerInterval;
let seconds = 0;
let minutes = 0;

function startQuiz(jsonFile) {
    localStorage.setItem('quizFile', jsonFile);
    window.location.href = 'quiz.html';
}

function loadQuizData() {
    const jsonFile = localStorage.getItem('quizFile');
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const firstField = Object.keys(data)[0];
            quizData = data[firstField];
            displayQuestion();
            startTimer();
        })
        .catch(error => {
            console.error('Error loading quiz data:', error);
            document.querySelector('.quiz-container').innerHTML = '<p>Error loading quiz. Please try again.</p>';
        });
}

function displayQuestion() {
    const question = quizData[currentQuestionIndex];
    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    const questionImage = document.getElementById('questionImage');
    const questionText = document.getElementById('questionText');
    
    if (question.type === 'multiple_choice') {
        questionImage.src = question.image_url;
        questionImage.style.display = 'block';
        questionText.style.display = 'none';
        
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.onclick = () => toggleOption(option.id);
            optionsContainer.appendChild(button);
        });
    } else if (question.type === 'direct_input') {
        questionImage.style.display = 'none';
        questionText.textContent = question.question_text;
        questionText.style.display = 'block';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'directInput';
        optionsContainer.appendChild(input);
    }
    document.querySelectorAll('#options button').forEach(btn => btn.classList.remove('selected'));
    selectedOptions.clear();
    document.getElementById('result').textContent = '';
    document.getElementById('submit').disabled = false;
    updateScore();
}

function toggleOption(option) {
    const button = event.target;
    if (selectedOptions.has(option)) {
        selectedOptions.delete(option);
        button.classList.remove('selected');
    } else {
        selectedOptions.add(option);
        button.classList.add('selected');
    }
}

function submitAnswer() {
    const question = quizData[currentQuestionIndex];
    let isCorrect = false;

    if (question.type === 'multiple_choice') {
        const correctAnswers = new Set(question.correct_answers);
        isCorrect = (selectedOptions.size === correctAnswers.size) &&
                    [...selectedOptions].every(option => correctAnswers.has(option));
    } else if (question.type === 'direct_input') {
        const userAnswer = document.getElementById('directInput').value.trim();
        isCorrect = userAnswer === question.correct_answer;
    }

    const resultElement = document.getElementById('result');
    if (isCorrect) {
        resultElement.textContent = "Correct!";
        resultElement.style.color = "green";
    } else {
        resultElement.textContent = "Incorrect. The correct answer was: " + 
            (question.type === 'multiple_choice' ? question.correct_answers.join(", ") : question.correct_answer);
        resultElement.style.color = "red";
        score = Math.max(0, score - 4);
    }

    updateScore();
    document.getElementById('submit').disabled = true;

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            displayQuestion();
        } else {
            endQuiz();
        }
    }, 1000);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}


function endQuiz() {
    clearInterval(timerInterval);
    const quizContainer = document.querySelector('.quiz-container');
    const formattedTime = `${padZero(minutes)}:${padZero(seconds)}`;
    
    // Store the quiz result
    const quizName = new URLSearchParams(window.location.search).get('quiz');
    localStorage.setItem(quizName, score);

    quizContainer.innerHTML = `
        <div class="quiz-end">
            <h2>Quiz Completed!</h2>
            <div class="score-display">
                <p>Your final score is: <span class="final-score">${score}</span></p>
                <p>Time taken: <span class="final-time">${formattedTime}</span></p>
            </div>
            <button onclick="window.location.href='index.html'" class="return-home">Return to Home</button>
        </div>
    `;

    // Add this style to your existing <style> tag in quiz.html
    const style = document.createElement('style');
    style.textContent = `
        .quiz-end {
            text-align: center;
            padding: 20px;
        }
        .quiz-end h2 {
            color: #007bff;
            font-size: 2em;
            margin-bottom: 20px;
        }
        .score-display {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .score-display p {
            font-size: 1.2em;
            color: #495057;
            margin-bottom: 10px;
        }
        .final-score {
            font-size: 3em;
            font-weight: bold;
            color: #28a745;
        }
        .return-home {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.1em;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .return-home:hover {
            background-color: #0056b3;
        }
    `;
    document.head.appendChild(style);
}

// Load quiz data when the quiz page loads
if (window.location.pathname.endsWith('quiz.html')) {
    window.onload = loadQuizData;
}


function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    const formattedTime = `${padZero(minutes)}:${padZero(seconds)}`;
    document.getElementById('timer').textContent = `Time: ${formattedTime}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}
