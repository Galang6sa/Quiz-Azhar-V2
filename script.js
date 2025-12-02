let currentQuestion = 0;
let userAnswers = [];
let questions = [];
let score = 0;
let selectedOption = null;
let timerInterval = null;
let timeLeft = 5;
let dragDropState = {};
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// DOM Elements
const quizScreen = document.getElementById("quizScreen");
const resultsScreen = document.getElementById("resultsScreen");
const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const finalScore = document.getElementById("finalScore");
const scoreText = document.getElementById("scoreText");
const feedback = document.getElementById("feedback");
const restartBtn = document.getElementById("restartBtn");
const resultIcon = document.getElementById("resultIcon");
const quizTitle = document.getElementById("quizTitle");
const timerContainer = document.getElementById("timerContainer");
const timerProgress = document.getElementById("timerProgress");
const timerText = document.getElementById("timerText");
const dragdropContainer = document.getElementById("dragdropContainer");
const dragdropOptions = document.getElementById("dragdropOptions");
const dragdropTargets = document.getElementById("dragdropTargets");
const dragdropStatus = document.getElementById("dragdropStatus");
const matchedCount = document.getElementById("matchedCount");
const totalPairs = document.getElementById("totalPairs");
const resetDragBtn = document.getElementById("resetDragBtn");
const fillContainer = document.getElementById("fillContainer");
const fillInput = document.getElementById("fillInput");

// -------------------------
// FINAL POPUP BARU
// -------------------------
const popup = document.createElement("div");
popup.classList.add("popup");
popup.innerHTML = `
  <div class="popup-content">
    <h3 id="popupTitle">Penjelasan</h3>
    <p id="popupExplanation"></p>
    <button id="popupCloseBtn" class="btn btn-primary">Lanjut</button>
  </div>
`;
document.body.appendChild(popup);

const popupTitle = document.getElementById("popupTitle");
const popupExplanation = document.getElementById("popupExplanation");
const popupCloseBtn = document.getElementById("popupCloseBtn");

// Fungsi popup universal
function showPopupMessage(title, message) {
  popupTitle.textContent = title;
  popupExplanation.textContent = message;

  popup.classList.add("show");
  popup.querySelector(".popup-content").classList.add("show");
}

function hidePopup() {
  popup.classList.remove("show");
  popup.querySelector(".popup-content").classList.remove("show");
  nextOrEnd();
}

// Tema warna random
const themes = [
  { primary: "#2563eb", background: "#f8fafc" },
  { primary: "#16a34a", background: "#f0fdf4" },
  { primary: "#7c3aed", background: "#f5f3ff" },
  { primary: "#f59e0b", background: "#fff7ed" },
];

function applyRandomTheme() {
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  document.documentElement.style.setProperty("--primary", randomTheme.primary);
  document.body.style.background = randomTheme.background;
}

// Load quiz
async function loadQuizData() {
  try {
    const res = await fetch("questions.json");
    return await res.json();
  } catch {
    return { title: "Kuis", questions: [] };
  }
}

// Inisialisasi kuis
async function initQuiz() {
  applyRandomTheme();
  const quizData = await loadQuizData();
  quizTitle.textContent = quizData.title;
  questions = shuffleArray(quizData.questions);
  userAnswers = new Array(questions.length).fill(null);
  showQuestion();
}

// Fungsi acak array
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Tampilkan pertanyaan
function showQuestion() {
  optionsContainer.style.display = "none";
  dragdropContainer.style.display = "none";
  fillContainer.style.display = "none";
  timerContainer.style.display = "none";
  cancelBtn.style.display = "none";

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  dragDropState = {};

  const q = questions[currentQuestion];
  questionNumber.textContent = `Pertanyaan ${currentQuestion + 1}`;
  questionText.textContent = q.question;

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${currentQuestion + 1}/${questions.length}`;

  selectedOption = null;
  submitBtn.disabled = true;

  if (q.type === "choice") showChoiceQuestion(q);
  if (q.type === "dragdrop") showDragDropQuestion(q);
  if (q.type === "truefalse") showTrueFalseQuestion(q);
  if (q.type === "fill") showFillQuestion(q);
}

// ----------------------------
// PILIHAN GANDA
// ----------------------------
function showChoiceQuestion(q) {
  optionsContainer.style.display = "grid";
  optionsContainer.innerHTML = "";

  q.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.classList.add("option");
    div.textContent = opt;
    div.onclick = () => selectOption(i);
    optionsContainer.appendChild(div);
  });
}

// ----------------------------
// DRAG & DROP
// ----------------------------
function showDragDropQuestion(q) {
  dragdropContainer.style.display = "block";
  dragdropOptions.innerHTML = "";
  dragdropTargets.innerHTML = "";

  dragDropState.currentMatches = {};
  dragDropState.usedOptions = [];

  totalPairs.textContent = q.pairs.length;
  matchedCount.textContent = 0;

  const shuffledTerms = shuffleArray(q.pairs.map(p => p.term));
  const shuffledDefs = shuffleArray(q.pairs.map(p => p.definition));

  shuffledTerms.forEach(term => {
    const el = document.createElement("div");
    el.classList.add("dragdrop-option");
    el.textContent = term;
    el.dataset.term = term;

    el.draggable = true;

    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", term);
      el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
    });

    dragdropOptions.appendChild(el);
  });

  shuffledDefs.forEach(def => {
    const target = document.createElement("div");
    target.classList.add("dragdrop-target");
    target.dataset.definition = def;

    const defEl = document.createElement("div");
    defEl.classList.add("target-definition");
    defEl.textContent = def;

    const ansEl = document.createElement("div");
    ansEl.classList.add("target-answer");
    ansEl.innerHTML = `<div class="target-placeholder">Seret istilah ke sini</div>`;

    target.appendChild(defEl);
    target.appendChild(ansEl);

    target.addEventListener("dragover", (e) => {
      e.preventDefault();
      target.classList.add("highlight");
    });

    target.addEventListener("dragleave", () => {
      target.classList.remove("highlight");
    });

    target.addEventListener("drop", (e) => {
      e.preventDefault();
      handleDrop(target, e.dataTransfer.getData("text/plain"));
    });

    dragdropTargets.appendChild(target);
  });
}

function handleDrop(target, term) {
  if (target.classList.contains("filled")) return;
  if (dragDropState.usedOptions.includes(term)) return;

  dragDropState.usedOptions.push(term);
  dragDropState.currentMatches[target.dataset.definition] = term;

  const ansEl = target.querySelector(".target-answer");
  ansEl.textContent = term;

  target.classList.add("filled");

  const opt = document.querySelector(`.dragdrop-option[data-term="${term}"]`);
  opt.classList.add("used");
  opt.draggable = false;

  matchedCount.textContent = Object.keys(dragDropState.currentMatches).length;

  if (matchedCount.textContent == totalPairs.textContent) {
    submitBtn.disabled = false;
  }
}

// ----------------------------
// TRUE / FALSE + TIMER
// ----------------------------
function showTrueFalseQuestion(q) {
  optionsContainer.style.display = "grid";
  optionsContainer.innerHTML = "";

  cancelBtn.style.display = "block";

  const optTrue = document.createElement("div");
  optTrue.classList.add("option");
  optTrue.textContent = "Benar";

  const optFalse = document.createElement("div");
  optFalse.classList.add("option");
  optFalse.textContent = "Salah";

  optTrue.onclick = () => {
    selectOption(0);
    stopTimer();
  };
  optFalse.onclick = () => {
    selectOption(1);
    stopTimer();
  };

  optionsContainer.appendChild(optTrue);
  optionsContainer.appendChild(optFalse);

  startTimer();
}

function startTimer() {
  timerContainer.style.display = "block";
  timeLeft = 5;
  timerText.textContent = timeLeft;
  timerProgress.style.width = "100%";

  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    timerProgress.style.width = `${(timeLeft / 5) * 100}%`;

    if (timeLeft <= -1) {
      stopTimer();
      handleTimeUp();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function handleTimeUp() {
  userAnswers[currentQuestion] = null;

  showPopupMessage(
    "Waktu Habis ⏰",
    "Kamu kehabisan waktu. Jawaban dianggap salah."
  );
}

// ----------------------------
// FILL IN THE BLANK
// ----------------------------
function showFillQuestion(q) {
  fillContainer.style.display = "block";
  fillInput.value = "";
  fillInput.classList.remove("correct", "incorrect");

  fillInput.oninput = () => {
    submitBtn.disabled = fillInput.value.trim().length === 0;
  };
}

// ----------------------------
// PILIH OPSI
// ----------------------------
function selectOption(i) {
  document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
  document.querySelectorAll(".option")[i].classList.add("selected");
  selectedOption = i;
  submitBtn.disabled = false;
}

// ----------------------------
// SUBMIT JAWABAN
// ----------------------------
function submitAnswer() {
  const q = questions[currentQuestion];
  let isCorrect = false;

  stopTimer();

  if (q.type === "choice" || q.type === "truefalse") {
    if (selectedOption === null) {
      showPopupMessage("Belum Menjawab", "Kamu belum memilih jawaban.");
      return;
    }

    isCorrect = selectedOption === q.correct;
    userAnswers[currentQuestion] = selectedOption;
  }

  if (q.type === "dragdrop") {
    isCorrect = q.pairs.every(p =>
      dragDropState.currentMatches[p.definition] === p.term
    );
  }

  if (q.type === "fill") {
    const val = fillInput.value.trim();
    if (!val) {
      showPopupMessage("Belum Mengisi", "Kamu belum mengetik jawaban.");
      return;
    }

    isCorrect = val.toLowerCase() === q.correct.toLowerCase();
    userAnswers[currentQuestion] = val;
  }

  if (isCorrect) {
    score++;
    nextOrEnd();
  } else {
    let title = "";
    let message = q.explanation;

    if (q.type === "dragdrop") title = "Pasangan Salah";
    else title = "Jawaban Salah";

    showPopupMessage(title, message);
  }
}

// ----------------------------
// NAVIGASI
// ----------------------------
function nextOrEnd() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResults();
  }
}

// ----------------------------
// HASIL
// ----------------------------
function showResults() {
  quizScreen.style.display = "none";
  resultsScreen.style.display = "block";

  finalScore.textContent = `${score}/${questions.length}`;
  const percent = (score / questions.length) * 100;

  if (percent >= 90) scoreText.textContent = "Luar biasa! Skor sempurna!";
  else if (percent >= 70) scoreText.textContent = "Bagus sekali!";
  else if (percent >= 50) scoreText.textContent = "Cukup baik!";
  else scoreText.textContent = "Tetap semangat belajar!";

  resultIcon.textContent = percent >= 70 ? "✓" : "!";
  resultIcon.style.color = percent >= 70 ? "var(--success)" : "var(--error)";

  feedback.innerHTML = `
    <p><strong>Skor Akhir:</strong> ${score}</p>
    <p><strong>Persentase:</strong> ${percent.toFixed(1)}%</p>
  `;
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  resultsScreen.style.display = "none";
  quizScreen.style.display = "block";
  initQuiz();
}

// ----------------------------
// EVENT LISTENER
// ----------------------------
submitBtn.onclick = submitAnswer;
popupCloseBtn.onclick = hidePopup;
restartBtn.onclick = restartQuiz;
resetDragBtn.onclick = () => showQuestion();

// MULAI
initQuiz();
