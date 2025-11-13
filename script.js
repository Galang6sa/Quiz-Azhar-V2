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

// 🔹 Pop-up elemen
const popup = document.createElement("div");
popup.classList.add("popup");
popup.innerHTML = `
  <div class="popup-content">
    <h3>Waktu Habis! ⏰</h3>
    <p id="popupExplanation">Kamu tidak memilih jawaban. Jawaban dianggap salah.</p>
    <button id="popupCloseBtn" class="btn btn-primary">Lanjut</button>
  </div>
`;
document.body.appendChild(popup);
const popupExplanation = document.getElementById("popupExplanation");
const popupCloseBtn = document.getElementById("popupCloseBtn");

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
    const data = await res.json();
    return data;
  } catch {
    return {
      title: "Kuis Interaktif",
      questions: [
        {
          type: "choice",
          question: "Apa ibu kota Indonesia?",
          options: ["Jakarta", "Surabaya", "Bandung", "Medan"],
          correct: 0,
          explanation: "Jakarta adalah ibu kota Indonesia sejak tahun 1945."
        },
        {
          type: "dragdrop",
          question: "Pasangkan istilah pemrograman dengan definisinya:",
          pairs: [
            { term: "Variable", definition: "Tempat penyimpanan data yang diberi nama" },
            { term: "Function", definition: "Blok kode yang dapat dipanggil berulang kali" },
            { term: "Loop", definition: "Struktur kendali untuk mengulangi eksekusi kode" }
          ],
          explanation: "Variable untuk menyimpan data, Function untuk kode yang dapat dipanggil, Loop untuk pengulangan."
        },
        {
          type: "truefalse",
          question: "Python adalah bahasa pemrograman yang diketik secara statis.",
          correct: 1,
          explanation: "Python adalah bahasa yang diketik secara dinamis, bukan statis."
        },
        {
          type: "fill",
          question: "Lengkapi kalimat: Ibu kota Indonesia adalah _____.",
          correct: "jakarta",
          explanation: "Ibu kota Indonesia adalah Jakarta."
        }
      ],
    };
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
  // Reset semua container
  optionsContainer.style.display = "none";
  dragdropContainer.style.display = "none";
  fillContainer.style.display = "none";
  timerContainer.style.display = "none";
  cancelBtn.style.display = "none";
  
  // Hentikan timer jika ada
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Reset state drag & drop
  dragDropState = {};
  
  const q = questions[currentQuestion];
  questionNumber.textContent = `Pertanyaan ${currentQuestion + 1}`;
  questionText.textContent = q.question;

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${currentQuestion + 1}/${questions.length}`;

  // Reset selected option
  selectedOption = null;
  submitBtn.disabled = true;
  
  // Tampilkan pertanyaan berdasarkan tipe
  switch (q.type) {
    case "choice":
      showChoiceQuestion(q);
      break;
    case "dragdrop":
      showDragDropQuestion(q);
      break;
    case "truefalse":
      showTrueFalseQuestion(q);
      break;
    case "fill":
      showFillQuestion(q);
      break;
  }
}

// Tampilkan pertanyaan pilihan ganda
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

// Tampilkan pertanyaan drag & drop
function showDragDropQuestion(q) {
  dragdropContainer.style.display = "block";
  dragdropOptions.innerHTML = "";
  dragdropTargets.innerHTML = "";
  
  // Reset state
  dragDropState.originalPairs = [...q.pairs];
  dragDropState.usedOptions = [];
  dragDropState.currentMatches = {};
  dragDropState.selectedTerm = null;
  
  // Set status
  totalPairs.textContent = q.pairs.length;
  matchedCount.textContent = "0";
  dragdropStatus.classList.remove("complete");
  
  // Acak urutan istilah
  const shuffledTerms = shuffleArray([...q.pairs.map(pair => pair.term)]);
  
  // Buat opsi yang bisa dipilih (istilah)
  shuffledTerms.forEach((term, i) => {
    const option = document.createElement("div");
    option.classList.add("dragdrop-option");
    option.textContent = term;
    option.dataset.term = term;
    
    // Event untuk desktop (drag & drop)
    option.draggable = true;
    option.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", term);
      option.classList.add("dragging");
    });
    
    option.addEventListener("dragend", () => {
      option.classList.remove("dragging");
    });
    
    // Event untuk mobile (tap/click)
    option.addEventListener("click", () => {
      if (isMobile) {
        handleMobileSelection(option, term);
      }
    });
    
    // Event touch untuk mobile
    option.addEventListener("touchstart", (e) => {
      e.preventDefault();
      handleMobileSelection(option, term);
    });
    
    dragdropOptions.appendChild(option);
  });
  
  // Acak urutan definisi
  const shuffledDefinitions = shuffleArray([...q.pairs.map(pair => pair.definition)]);
  
  // Buat target area (definisi)
  shuffledDefinitions.forEach((definition, i) => {
    const target = document.createElement("div");
    target.classList.add("dragdrop-target");
    target.dataset.definition = definition;
    
    // Tambahkan elemen untuk definisi
    const definitionEl = document.createElement("div");
    definitionEl.classList.add("target-definition");
    definitionEl.textContent = definition;
    
    // Tambahkan elemen untuk placeholder jawaban
    const answerEl = document.createElement("div");
    answerEl.classList.add("target-answer");
    
    const placeholderEl = document.createElement("div");
    placeholderEl.classList.add("target-placeholder");
    placeholderEl.textContent = isMobile ? "Tap istilah lalu tap di sini" : "Seret istilah ke sini";
    answerEl.appendChild(placeholderEl);
    
    target.appendChild(definitionEl);
    target.appendChild(answerEl);
    
    // Event untuk desktop (drag & drop)
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
    
    // Event untuk mobile (tap/click)
    target.addEventListener("click", () => {
      if (isMobile && dragDropState.selectedTerm) {
        handleMobileDrop(target, dragDropState.selectedTerm);
      }
    });
    
    // Event touch untuk mobile
    target.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (isMobile && dragDropState.selectedTerm) {
        handleMobileDrop(target, dragDropState.selectedTerm);
      }
    });
    
    dragdropTargets.appendChild(target);
  });
  
  // Tambahkan instruksi khusus untuk mobile
  if (isMobile) {
    const mobileInstruction = document.createElement("div");
    mobileInstruction.classList.add("mobile-instruction");
    mobileInstruction.innerHTML = `
      <p><strong>Cara main:</strong> Tap istilah di kiri, lalu tap definisi di kanan</p>
    `;
    dragdropContainer.insertBefore(mobileInstruction, dragdropContent);
  }
}

// Handle seleksi untuk mobile
function handleMobileSelection(option, term) {
  // Reset seleksi sebelumnya
  document.querySelectorAll('.dragdrop-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Reset seleksi target sebelumnya
  document.querySelectorAll('.dragdrop-target').forEach(target => {
    target.classList.remove('target-selected');
  });
  
  // Set seleksi baru
  option.classList.add('selected');
  dragDropState.selectedTerm = term;
  
  // Highlight semua target yang belum terisi
  document.querySelectorAll('.dragdrop-target:not(.filled)').forEach(target => {
    target.classList.add('target-selected');
  });
}

// Handle drop untuk desktop
function handleDrop(target, draggedTerm) {
  target.classList.remove("highlight");
  
  // Periksa apakah istilah sudah digunakan
  if (dragDropState.usedOptions.includes(draggedTerm)) {
    return;
  }
  
  // Tandai istilah sebagai digunakan
  dragDropState.usedOptions.push(draggedTerm);
  dragDropState.currentMatches[target.dataset.definition] = draggedTerm;
  
  // Update tampilan target
  const answerEl = target.querySelector(".target-answer");
  answerEl.innerHTML = "";
  answerEl.textContent = draggedTerm;
  target.classList.add("filled");
  
  // Tandai opsi sebagai digunakan
  const draggedElement = document.querySelector(`.dragdrop-option[data-term="${draggedTerm}"]`);
  draggedElement.classList.add("used");
  draggedElement.draggable = false;
  
  // Update status
  updateDragDropStatus();
  
  // Periksa apakah semua target sudah terisi
  checkDragDropCompletion();
}

// Handle drop untuk mobile
function handleMobileDrop(target, selectedTerm) {
  // Reset seleksi
  document.querySelectorAll('.dragdrop-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelectorAll('.dragdrop-target').forEach(t => {
    t.classList.remove('target-selected');
  });
  
  // Periksa apakah target sudah terisi
  if (target.classList.contains('filled')) {
    return;
  }
  
  // Periksa apakah istilah sudah digunakan
  if (dragDropState.usedOptions.includes(selectedTerm)) {
    return;
  }
  
  // Tandai istilah sebagai digunakan
  dragDropState.usedOptions.push(selectedTerm);
  dragDropState.currentMatches[target.dataset.definition] = selectedTerm;
  dragDropState.selectedTerm = null;
  
  // Update tampilan target
  const answerEl = target.querySelector(".target-answer");
  answerEl.innerHTML = "";
  answerEl.textContent = selectedTerm;
  target.classList.add("filled");
  
  // Tandai opsi sebagai digunakan
  const selectedElement = document.querySelector(`.dragdrop-option[data-term="${selectedTerm}"]`);
  selectedElement.classList.add("used");
  selectedElement.draggable = false;
  
  // Update status
  updateDragDropStatus();
  
  // Periksa apakah semua target sudah terisi
  checkDragDropCompletion();
}

// Update status drag & drop
function updateDragDropStatus() {
  const currentMatches = Object.keys(dragDropState.currentMatches).length;
  matchedCount.textContent = currentMatches;
  
  if (currentMatches === parseInt(totalPairs.textContent)) {
    dragdropStatus.classList.add("complete");
    dragdropStatus.textContent = "Semua pasangan telah terisi!";
  }
}

// Reset drag & drop
function resetDragDrop() {
  const q = questions[currentQuestion];
  showDragDropQuestion(q);
}

// Periksa apakah semua target drag & drop sudah terisi
function checkDragDropCompletion() {
  const allTargets = document.querySelectorAll(".dragdrop-target");
  const allFilled = Array.from(allTargets).every(target => target.classList.contains("filled"));
  
  if (allFilled) {
    submitBtn.disabled = false;
  }
}

// Tampilkan pertanyaan benar/salah dengan timer (VERSI DIPERBAIKI)
function showTrueFalseQuestion(q) {
  optionsContainer.style.display = "grid";
  optionsContainer.innerHTML = "";
  cancelBtn.style.display = "block";
  
  const trueOption = document.createElement("div");
  trueOption.classList.add("option");
  trueOption.textContent = "Benar";
  trueOption.onclick = () => {
    selectOption(0);
    // Hentikan timer jika user memilih jawaban
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };
  
  const falseOption = document.createElement("div");
  falseOption.classList.add("option");
  falseOption.textContent = "Salah";
  falseOption.onclick = () => {
    selectOption(1);
    // Hentikan timer jika user memilih jawaban
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };
  
  optionsContainer.appendChild(trueOption);
  optionsContainer.appendChild(falseOption);
  
  // Tampilkan dan jalankan timer
  timerContainer.style.display = "block";
  timeLeft = 5;
  timerText.textContent = timeLeft;
  timerProgress.style.width = "100%";
  timerProgress.classList.remove("warning");
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    timerProgress.style.width = `${(timeLeft / 5) * 100}%`;
    
    // Tambahkan efek warning ketika waktu hampir habis
    if (timeLeft <= 2) {
      timerProgress.classList.add("warning");
    }
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      handleTimeUp(); // Panggil function khusus untuk waktu habis
    }
  }, 1000);
}

// Handle ketika waktu habis (FUNCTION BARU)
function handleTimeUp() {
  const q = questions[currentQuestion];
  
  // Tampilkan feedback waktu habis
  const answerFeedback = document.getElementById("answerFeedback");
  answerFeedback.textContent = "⏰ Waktu habis! Jawaban dianggap salah.";
  answerFeedback.className = "answer-feedback incorrect show";
  
  // Simpan jawaban sebagai salah
  userAnswers[currentQuestion] = null;
  
  // Langsung lanjut ke pertanyaan berikutnya setelah 1.5 detik
  setTimeout(() => {
    nextOrEnd();
  }, 1500);
}

// Tampilkan pertanyaan isian
function showFillQuestion(q) {
  fillContainer.style.display = "block";
  fillInput.value = "";
  fillInput.classList.remove("correct", "incorrect");
  fillInput.placeholder = "Ketik jawaban Anda di sini...";
  
  fillInput.addEventListener("input", () => {
    submitBtn.disabled = !fillInput.value.trim();
  });
  
  fillInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && fillInput.value.trim()) {
      submitAnswer();
    }
  });
  
  setTimeout(() => {
    fillInput.focus();
  }, 100);
}

// Pilih jawaban (untuk pilihan ganda dan benar/salah)
function selectOption(index) {
  document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
  document.querySelectorAll(".option")[index].classList.add("selected");
  selectedOption = index;
  submitBtn.disabled = false;
}

// Kirim jawaban (VERSI DIPERBAIKI)
function submitAnswer() {
  const q = questions[currentQuestion];
  let isCorrect = false;
  
  // Hentikan timer jika ada
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Sembunyikan feedback waktu habis jika ada
  const answerFeedback = document.getElementById("answerFeedback");
  answerFeedback.classList.remove("show");
  
  switch (q.type) {
    case "choice":
    case "truefalse":
      if (selectedOption === null) {
        // Jika tidak ada jawaban yang dipilih, anggap salah
        userAnswers[currentQuestion] = null;
        popupExplanation.textContent = q.explanation || "Kamu belum memilih jawaban. Pelajari kembali materi ini ya!";
        showPopup();
        return;
      }
      isCorrect = selectedOption === q.correct;
      userAnswers[currentQuestion] = selectedOption;
      break;
      
    case "dragdrop":
      isCorrect = q.pairs.every(pair => 
        dragDropState.currentMatches[pair.definition] === pair.term
      );
      userAnswers[currentQuestion] = dragDropState.currentMatches;
      break;
      
    case "fill":
      if (!fillInput.value.trim()) {
        // Jika input kosong, anggap salah
        userAnswers[currentQuestion] = "";
        popupExplanation.textContent = q.explanation || "Kamu belum mengisi jawaban. Pelajari kembali materi ini ya!";
        showPopup();
        return;
      }
      isCorrect = fillInput.value.trim().toLowerCase() === q.correct.toLowerCase();
      userAnswers[currentQuestion] = fillInput.value.trim();
      
      if (isCorrect) {
        fillInput.classList.add("correct");
      } else {
        fillInput.classList.add("incorrect");
      }
      break;
  }
  
  if (isCorrect) {
    score++;
    nextOrEnd();
  } else {
    popupExplanation.textContent = q.explanation || "Pelajari kembali materi ini ya!";
    showPopup();
  }
}

// Tampilkan popup penjelasan jika salah
function showPopup() {
  popup.classList.add("show");
  popup.querySelector(".popup-content").classList.add("show");
}

function hidePopup() {
  popup.classList.remove("show");
  popup.querySelector(".popup-content").classList.remove("show");
  nextOrEnd();
}

// Lanjut ke pertanyaan berikut atau hasil akhir
function nextOrEnd() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResults();
  }
}

// Batal menjawab (khusus untuk timer questions)
// function cancelAnswer() {
//   if (timerInterval) {
//     clearInterval(timerInterval);
//     timerInterval = null;
//   }
//   selectedOption = null;
//   submitBtn.disabled = true;
//   document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
//   cancelBtn.style.display = "none";
// }

// Hasil akhir
function showResults() {
  quizScreen.style.display = "none";
  resultsScreen.style.display = "block";
  finalScore.textContent = `${score}/${questions.length}`;

  const percent = (score / questions.length) * 100;
  let msg = "";
  if (percent >= 90) { msg = "Luar biasa! Skor sempurna!"; }
  else if (percent >= 70) { msg = "Bagus sekali! Hampir sempurna."; }
  else if (percent >= 50) { msg = "Cukup baik, terus belajar!"; }
  else { msg = "Tetap semangat belajar!"; }

  scoreText.textContent = msg;
  resultIcon.textContent = percent >= 70 ? "✓" : "!";
  resultIcon.style.color = percent >= 70 ? "var(--success)" : "var(--error)";
  
  feedback.innerHTML = `
    <p><strong>Skor Akhir:</strong> ${score} / ${questions.length}</p>
    <p><strong>Persentase:</strong> ${percent.toFixed(1)}%</p>
    <p><strong>Status:</strong> ${percent >= 70 ? "Lulus" : "Belum Lulus"}</p>
  `;
}

// Ulang kuis
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  userAnswers.fill(null);
  resultsScreen.style.display = "none";
  quizScreen.style.display = "block";
  showQuestion();
}

// Event listener
submitBtn.onclick = submitAnswer;
// cancelBtn.onclick = cancelAnswer;
popupCloseBtn.onclick = hidePopup;
restartBtn.onclick = restartQuiz;
resetDragBtn.onclick = resetDragDrop;

// Start
initQuiz();