// Sidebar toggle
const sidebar = document.getElementById("sidebar");
document.getElementById("hamburger").addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

// Check for saved theme preference
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "☀️ Light Mode";
}

// Section switching
const sections = document.querySelectorAll(".section");
const menuItems = document.querySelectorAll(".menu li");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    const target = item.dataset.section;
    sections.forEach(sec => sec.classList.remove("active-section"));
    document.getElementById(target).classList.add("active-section");
    if (target === "history") {
      loadHistory();
    }
  });
});

// Global variables
let quizAnswers = {};
const loadingSpinner = document.getElementById("loading-spinner");

function renderMarkdown(markdownText) {
  let html = markdownText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/```python([\s\S]*?)```/g, '<pre><code class="python">$1</code></pre>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  html = html.replace(/### (.*?)<br>/g, '<h3>$1</h3>');
  html = html.replace(/## (.*?)<br>/g, '<h2>$1</h2>');
  return html;
}

async function handleApiRequest(endpoint, data, outputElement) {
  loadingSpinner.classList.remove("spinner-hidden");
  try {
    const res = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
    const responseData = await res.json();
    loadingSpinner.classList.add("spinner-hidden");
    return responseData;
  } catch (err) {
    loadingSpinner.classList.add("spinner-hidden");
    outputElement.textContent = "Error: " + err.message;
    throw err;
  }
}

// General AI
document.getElementById("general-ask").addEventListener("click", async () => {
  const question = document.getElementById("general-question").value;
  if (!question) return;
  const answerBox = document.getElementById("general-answer");
  answerBox.textContent = "Loading...";
  const data = await handleApiRequest("ask", { question }, answerBox);
  if (data && data.answer) {
    answerBox.innerHTML = renderMarkdown(data.answer);
  }
});

// Flashcards
document.getElementById("flashcards-generate").addEventListener("click", async () => {
  const text = document.getElementById("flashcards-input").value;
  if (!text) return;
  const outputBox = document.getElementById("flashcards-output");
  outputBox.textContent = "Generating flashcards...";
  const data = await handleApiRequest("flashcards", { text }, outputBox);
  if (data && data.flashcards) {
    outputBox.innerHTML = data.flashcards.map(card => `
      <div class="flashcard-item">
        <div class="flashcard-inner">
          <div class="flashcard-front"><h3>Question:</h3><p>${card.question}</p></div>
          <div class="flashcard-back"><h3>Answer:</h3><p>${card.answer}</p></div>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.flashcard-item').forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('flipped'));
    });
  }
});


// Quiz
document.getElementById("quiz-generate").addEventListener("click", async () => {
  const text = document.getElementById("quiz-input").value;
  if (!text) return;
  const outputBox = document.getElementById("quiz-output");
  outputBox.textContent = "Generating quiz...";
  const data = await handleApiRequest("quiz", { text }, outputBox);
  if (data && data.quiz) {
    quizAnswers = {};
    const quizHtml = data.quiz.map(q => {
      quizAnswers[q.id] = q.answer;
      return `
        <div class="quiz-question" id="quiz-q-${q.id}">
          <p><strong>${q.question}</strong></p>
          <ul class="quiz-options">
            ${q.options.map(opt => `<li><label><input type="radio" name="q-${q.id}" value="${opt}"> ${opt}</label></li>`).join('')}
          </ul>
        </div>
      `;
    }).join('');
    outputBox.innerHTML = quizHtml + `<button id="check-quiz-btn">Check Answers</button>`;
    document.getElementById("check-quiz-btn").addEventListener("click", checkQuizAnswers);
  }
});

// Summarizer
document.getElementById("summarize-btn").addEventListener("click", async () => {
  const text = document.getElementById("summarizer-text").value;
  if (!text) return;
  const answerBox = document.getElementById("summarizer-answer");
  answerBox.textContent = "Summarizing...";
  const data = await handleApiRequest("summarize", { text }, answerBox);
  if (data && data.summary) {
    answerBox.innerHTML = renderMarkdown(data.summary);
  }
});

// Semester Planner
document.getElementById("generate-plan").addEventListener("click", async () => {
  const semesterStart = document.getElementById("semester-start").value;
  const examDates = document.getElementById("exam-dates").value;
  if (!semesterStart || !examDates) {
    alert("Please fill out both the start date and exam dates.");
    return;
  }
  const outputBox = document.getElementById("planner-output");
  outputBox.textContent = "Generating study plan...";
  const data = await handleApiRequest("plan", { "semester-start": semesterStart, "exam-dates": examDates }, outputBox);
  if (data && data.plan) {
    outputBox.innerHTML = renderMarkdown(data.plan);
  }
});

// Code Explainer
document.getElementById("explain-btn").addEventListener("click", async () => {
  const code = document.getElementById("explainer-code").value;
  if (!code) return;
  const answerBox = document.getElementById("explainer-answer");
  answerBox.textContent = "Explaining code...";
  const data = await handleApiRequest("explain-code", { code }, answerBox);
  if (data && data.explanation) {
    answerBox.innerHTML = renderMarkdown(data.explanation);
  }
});

function checkQuizAnswers() {
  let score = 0;
  let totalQuestions = Object.keys(quizAnswers).length;
  for (const id in quizAnswers) {
    const questionDiv = document.getElementById(`quiz-q-${id}`);
    const selectedOption = document.querySelector(`input[name="q-${id}"]:checked`);
    questionDiv.classList.remove('correct', 'incorrect');
    const prevFeedback = questionDiv.querySelector('.feedback-message');
    if (prevFeedback) prevFeedback.remove();
    if (selectedOption) {
      if (selectedOption.value === quizAnswers[id]) {
        score++;
        questionDiv.classList.add('correct');
        const feedback = document.createElement('p');
        feedback.textContent = 'Correct! ✅';
        feedback.className = 'feedback-message';
        questionDiv.appendChild(feedback);
      } else {
        questionDiv.classList.add('incorrect');
        const feedback = document.createElement('p');
        feedback.textContent = `Incorrect. The correct answer is: ${quizAnswers[id]} ❌`;
        feedback.className = 'feedback-message';
        questionDiv.appendChild(feedback);
      }
    } else {
      questionDiv.classList.add('incomplete');
      const feedback = document.createElement('p');
      feedback.textContent = `You didn't answer this question. The correct answer is: ${quizAnswers[id]} ⚠️`;
      feedback.className = 'feedback-message';
      questionDiv.appendChild(feedback);
    }
  }
  const scoreMessage = document.createElement('h3');
  scoreMessage.textContent = `Your Score: ${score} / ${totalQuestions}`;
  const quizOutput = document.getElementById('quiz-output');
  const existingScore = quizOutput.querySelector('h3');
  if (existingScore) existingScore.remove();
  quizOutput.appendChild(scoreMessage);
}

// Chat history
async function loadHistory() {
  try {
    const res = await fetch("http://127.0.0.1:5000/history");
    const data = await res.json();
    const historyDiv = document.getElementById("chat-history-list");
    historyDiv.innerHTML = "";
    data.forEach(item => {
      const div = document.createElement("div");
      const content = renderMarkdown(item.content);
      div.innerHTML = `<b>${item.role === "user" ? "You" : "AI"}:</b> ${content}`;
      historyDiv.appendChild(div);
    });
  } catch(err) {
    console.error(err);
  }
}

// Refresh chat history every 5 seconds
setInterval(loadHistory, 5000);