const questions = [
    { vraag: "Wat is de hoofdstad van Nederland?", antwoord: "amsterdam" },
    { vraag: "Wat is de hoofdstad van België?", antwoord: "brussel" },
    { vraag: "Wat is de hoofdstad van Duitsland?", antwoord: "berlijn" },
    { vraag: "Wat is de hoofdstad van Frankrijk?", antwoord: "parijs" }
    // Voeg hier meer vragen toe
];

let currentQuestionIndex = 0;

const questionElement = document.getElementById('question');
const feedbackElement = document.getElementById('feedback');
const startListeningButton = document.getElementById('startListening');
const skipQuestionButton = document.getElementById('skipQuestion');

const recognition = new webkitSpeechRecognition();
recognition.lang = 'nl-NL';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const displayQuestion = () => {
    if (currentQuestionIndex < questions.length) {
        questionElement.textContent = questions[currentQuestionIndex].vraag;
        feedbackElement.textContent = '';
        startListeningButton.textContent = 'Start met luisteren';
    } else {
        completeQuiz();
    }
};

const checkAnswer = (spokenAnswer) => {
    feedbackElement.textContent = `Je antwoordde: "${spokenAnswer}". `;
    if (spokenAnswer.trim().toLowerCase() === questions[currentQuestionIndex].antwoord) {
        feedbackElement.textContent += 'Dat is juist!';
        if (currentQuestionIndex < questions.length - 1) {
            startListeningButton.textContent = 'Volgende vraag';
        } else {
            completeQuiz();
        }
    } else {
        feedbackElement.textContent += 'Helaas, dat is fout. Probeer het opnieuw.';
    }
};

const completeQuiz = () => {
    questionElement.textContent = 'Quiz voltooid!';
    feedbackElement.textContent = '';
    startListeningButton.disabled = true;
    skipQuestionButton.disabled = true;
};

document.addEventListener('DOMContentLoaded', function() {
    var speakButton = document.getElementById('speakButton');

    speakButton.addEventListener('click', function() {
        // Verkrijg de tekst die moet worden voorgelezen
        var textToSpeak = document.getElementById('question').innerText; // Pas dit aan aan het ID van uw vraagelement

        // Stel de spraaksynthese in
        var msg = new SpeechSynthesisUtterance();
        msg.text = textToSpeak;
        msg.lang = 'nl-NL'; // Zet de taal op Nederlands

        // Lees de tekst voor
        window.speechSynthesis.speak(msg);
    });
});


startListeningButton.addEventListener('click', () => {
    if (startListeningButton.textContent === 'Volgende vraag' && currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else if (currentQuestionIndex < questions.length) {
        startListeningButton.disabled = true;
        skipQuestionButton.disabled = true;
        recognition.start();
    }
});

skipQuestionButton.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        completeQuiz();
    }
});

recognition.onresult = (event) => {
    const spokenAnswer = event.results[0][0].transcript;
    checkAnswer(spokenAnswer);
    // Na het verwerken van een antwoord, controleer of de quiz is voltooid om knoppen correct te beheren
    if (currentQuestionIndex < questions.length - 1) {
        startListeningButton.disabled = false;
        skipQuestionButton.disabled = false;
    }
};

recognition.onend = () => {
    // Controleer of de quiz is voltooid voordat knoppen mogelijk opnieuw worden ingeschakeld
    if (currentQuestionIndex >= questions.length - 1) {
        completeQuiz();
    }
};

displayQuestion();
