// Data Setup
let books = [];

fetch('./data.json')
  .then(response => response.json())
  .then(data => {
    books = data;
    console.log("Books loaded:", books);
    populateBooksSelection(); // Call this function once books are loaded
  })
  .catch(err => console.error("Error loading books:", err));

const participants = [
  { name: "Vihaan", booksRead: [], quizQuestions: [], score: 0 },
  { name: "Michael", booksRead: [], quizQuestions: [], score: 0 },
  { name: "Srinidhi", booksRead: [], quizQuestions: [], score: 0 },
  { name: "Kausthab", booksRead: [], quizQuestions: [], score: 0 }
];

// DOM Elements
const setupPage = document.getElementById("setupPage");
const quizPage = document.getElementById("quizPage");
const booksSelection = document.getElementById("booksSelection");
const quizContainer = document.getElementById("quizContainer");
const nextQuestionButton = document.getElementById("nextQuestion");
const scoreContainer = document.getElementById("scoreContainer");

// Track Total Questions
let currentParticipantIndex = 0;
let totalQuestionsAsked = 0;
let maxQuestions = 0; // Total questions allowed in the quiz
let activeParticipants = []; // Active participants dynamically updated

// Populate Book Selection
function populateBooksSelection() {
  booksSelection.innerHTML = ""; // Clear existing content
  books.forEach((book) => {
    const bookDiv = document.createElement("div");
    bookDiv.innerHTML = `
      <h3>${book.name}</h3>
      ${participants
        .map(
          (participant, index) =>
            `<label>
              <input type="checkbox" data-book="${book.name}" data-participant="${index}"> ${participant.name}
            </label>`
        )
        .join("")}
    `;
    booksSelection.appendChild(bookDiv);
  });
}

// Handle Quiz Setup
document.getElementById("setupForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // Assign books to participants
  const checkboxes = document.querySelectorAll("input[type='checkbox']:checked");
  checkboxes.forEach((checkbox) => {
    const bookName = checkbox.dataset.book;
    const participantIndex = checkbox.dataset.participant;
    participants[participantIndex].booksRead.push(
      books.find((book) => book.name === bookName)
    );
  });

  // Generate quiz questions for each participant
  participants.forEach((participant) => {
    const availableQuestions = participant.booksRead.flatMap((book) => book.questions);
    participant.quizQuestions = availableQuestions.sort(() => 0.5 - Math.random()).slice(0, 20); // Limit to 3 questions for testing
  });

  // Initialize active participants and max questions
  initializeQuiz();

  // Switch to quiz page
  setupPage.style.display = "none";
  quizPage.style.display = "block";
  showQuestion();
});

// Function to initialize active participants and max questions
function initializeQuiz() {
  activeParticipants = participants.filter((participant) => participant.quizQuestions.length > 0);
  maxQuestions = activeParticipants.length * 20; // 3 questions per active participant for testing
}

// Function to check if the quiz is complete
function isQuizComplete() {
  return totalQuestionsAsked >= maxQuestions;
}

// Show Question
function showQuestion() {
  if (isQuizComplete()) {
    alert("Quiz complete! No more questions available.");
    quizPage.style.display = "none";
    showScoreBreakup();
    return;
  }

  // Ensure we have an active participant with questions
  let participant = activeParticipants[currentParticipantIndex];
  while (participant.quizQuestions.length === 0) {
    currentParticipantIndex = (currentParticipantIndex + 1) % activeParticipants.length;
    participant = activeParticipants[currentParticipantIndex];
  }

  // Get the next question for the current participant
  const question = participant.quizQuestions.shift(); // Remove and fetch the next question
  totalQuestionsAsked++;

  quizContainer.innerHTML = `
    <p><strong>${participant.name}</strong>, here is your question:</p>
    <p>${question.question}</p>
    <p><strong>Correct Answer:</strong> ${question.answer}</p>
    <label>
      <input type="radio" name="answer" value="correct"> Correct
    </label>
    <label>
      <input type="radio" name="answer" value="incorrect"> Incorrect
    </label>
  `;

  nextQuestionButton.style.display = "block";
}

// Handle Next Question
nextQuestionButton.addEventListener("click", () => {
  const participant = activeParticipants[currentParticipantIndex];
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');

  if (!selectedAnswer) {
    alert("Please select if the answer is correct or incorrect.");
    return;
  }

  // Mark the answer based on the organizer's choice
  if (selectedAnswer.value === "correct") {
    participant.score += 1; // Award 1 point for correct answer
  }

  // Move to the next participant
  currentParticipantIndex = (currentParticipantIndex + 1) % activeParticipants.length;

  showQuestion(); // Display the next question
});

// Show Score Breakdown at the End of the Quiz
function showScoreBreakup() {
  scoreContainer.style.display = "block"; // Make sure score container is visible
  scoreContainer.innerHTML = "<h3>Score Breakdown:</h3>";

  participants.forEach((participant) => {
    const scoreElement = document.createElement("p");
    scoreElement.textContent = `${participant.name}: ${participant.score} points`;
    scoreContainer.appendChild(scoreElement);
  });
}