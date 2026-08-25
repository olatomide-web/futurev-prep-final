const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const quiz = [
  {
    area: "Raw materials",
    question: "Which substance is a raw material used by green plants during photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Glucose", "Chlorophyll"],
    answer: 1,
    explanation: "Carbon dioxide is taken in by the plant and used with water to produce glucose."
  },
  {
    area: "Role of chlorophyll",
    question: "What is the main role of chlorophyll in photosynthesis?",
    options: ["It releases carbon dioxide", "It absorbs light energy", "It produces water", "It stores oxygen"],
    answer: 1,
    explanation: "Chlorophyll absorbs light energy. That energy drives the photosynthetic process."
  },
  {
    area: "Light energy",
    question: "Which factor provides the energy required for photosynthesis?",
    options: ["Light", "Oxygen", "Soil", "Protein"],
    answer: 0,
    explanation: "Light provides the energy that is captured by chlorophyll."
  },
  {
    area: "Products of photosynthesis",
    question: "Which product of photosynthesis can be converted and stored by plants as starch?",
    options: ["Glucose", "Carbon dioxide", "Water", "Chlorophyll"],
    answer: 0,
    explanation: "Photosynthesis produces glucose. Plants can convert glucose into starch for storage."
  },
  {
    area: "Photosynthesis process",
    question: "Which statement best describes photosynthesis?",
    options: [
      "Plants use oxygen to make carbon dioxide.",
      "Green plants use light energy to make food from carbon dioxide and water.",
      "Plants absorb food directly from the soil.",
      "Plants use glucose to produce sunlight."
    ],
    answer: 1,
    explanation: "Photosynthesis uses light energy, carbon dioxide and water to produce food, while oxygen is released."
  }
];

const state = {
  route: "home",
  questionIndex: 0,
  selected: null,
  submitted: false,
  score: 0,
  answers: [],
  topic: "Photosynthesis"
};

function saveState() {
  sessionStorage.setItem("futurevSession", JSON.stringify(state));
}

function loadState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("futurevSession"));
    if (saved) Object.assign(state, saved);
  } catch (_) {}
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
}

function routeTo(route) {
  if (route === "practice" && state.answers.length === 0) {
    state.questionIndex = 0;
    state.selected = null;
    state.submitted = false;
  }

  $$(".view").forEach(view => view.classList.toggle("active", view.id === route));
  state.route = route;
  $("#mobileNav").classList.remove("open");
  window.scrollTo({top: 0, behavior: "smooth"});

  if (route === "practice") renderQuestion();
  if (route === "progress") renderProgress();
  saveState();
}

function bindNavigation() {
  $$("[data-route]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      routeTo(button.dataset.route);
    });
  });
}

function renderQuestion() {
  const q = quiz[state.questionIndex];
  $("#questionCount").textContent = `QUESTION ${state.questionIndex + 1} OF ${quiz.length}`;

  const letters = ["A", "B", "C", "D"];
  $("#quizCard").innerHTML = `
    <span class="question-number">QUESTION ${state.questionIndex + 1}</span>
    <h2>${q.question}</h2>
    <div class="options">
      ${q.options.map((option, index) => `
        <button class="option ${state.selected === index ? "selected" : ""}" data-index="${index}" ${state.submitted ? "disabled" : ""}>
          <span class="option-key">${letters[index]}</span>${option}
        </button>
      `).join("")}
    </div>
    <div id="feedbackArea"></div>
    <div class="quiz-footer">
      <small>${state.submitted ? "Answer reviewed." : "Choose one answer."}</small>
      <button id="quizAction" class="btn btn-primary" ${state.selected === null ? "disabled" : ""}>
        ${state.submitted ? (state.questionIndex === quiz.length - 1 ? "View my progress →" : "Next question →") : "Submit answer"}
      </button>
    </div>
  `;

  if (state.submitted) {
    const result = state.answers[state.questionIndex];
    const correct = result.correct;
    $("#feedbackArea").innerHTML = `
      <div class="feedback ${correct ? "correct" : "wrong"}">
        <strong>${correct ? "✓ Correct" : "✗ Not quite"}</strong>
        ${correct ? "Nice work." : `The correct answer is <b>${q.options[q.answer]}</b>.`}
        ${q.explanation}
      </div>
    `;
  }

  $$(".option").forEach(button => {
    button.addEventListener("click", () => {
      if (state.submitted) return;
      state.selected = Number(button.dataset.index);
      $$(".option").forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");
      $("#quizAction").disabled = false;
    });
  });

  $("#quizAction").addEventListener("click", submitOrNext);
}

function submitOrNext() {
  if (!state.submitted) {
    const q = quiz[state.questionIndex];
    const correct = state.selected === q.answer;

    state.answers[state.questionIndex] = {
      area: q.area,
      selected: state.selected,
      correct
    };

    if (correct) state.score += 1;
    state.submitted = true;
    saveState();
    renderQuestion();
    return;
  }

  if (state.questionIndex === quiz.length - 1) {
    routeTo("progress");
  } else {
    state.questionIndex += 1;
    state.selected = null;
    state.submitted = false;
    saveState();
    renderQuestion();
  }
}

function renderProgress() {
  const total = quiz.length;
  const pct = Math.round((state.score / total) * 100);
  const wrong = state.answers.filter(Boolean).filter(answer => !answer.correct);
  const right = state.answers.filter(Boolean).filter(answer => answer.correct);

  const weak = [...new Set(wrong.map(answer => answer.area))];
  const strengths = [...new Set(right.map(answer => answer.area))];

  let headline = "Good start — keep building.";
  if (pct >= 80) headline = "Strong work — you're getting it.";
  else if (pct < 50) headline = "You've found the areas to work on.";

  $("#progressContent").innerHTML = `
    <div class="summary-hero">
      <div class="score-ring" style="--score:${pct}%">
        <div class="score-inner"><strong>${pct}%</strong><span>UNDERSTANDING</span></div>
      </div>
      <div>
        <h2>${headline}</h2>
        <p>You scored <b>${state.score} out of ${total}</b> on this ${state.topic} practice session. Futurev uses the mistakes to suggest your next study step.</p>
      </div>
    </div>

    <div class="summary-grid">
      <article class="summary-card">
        <h3>You're doing well in</h3>
        <div class="tag-list">
          ${strengths.length ? strengths.map(item => `<span class="tag">✓ ${item}</span>`).join("") : `<span class="empty">Keep practising to build your strengths.</span>`}
        </div>
      </article>

      <article class="summary-card">
        <h3>Needs more attention</h3>
        <div class="tag-list">
          ${weak.length ? weak.map(item => `<span class="tag warn">⚠ ${item}</span>`).join("") : `<span class="tag">No clear weak area</span>`}
        </div>
      </article>

      <article class="summary-card recommendation">
        <h3>Recommended next step</h3>
        <p>${weak.length
          ? `Review <b>${weak.join(", ")}</b>, then take a short targeted practice set focused on those areas.`
          : "Move to a harder practice set to test deeper understanding."}</p>
        <button id="retryBtn" class="btn btn-primary">${weak.length ? "Practise again →" : "Try a harder set →"}</button>
      </article>
    </div>
  `;

  $("#retryBtn").addEventListener("click", () => {
    state.questionIndex = 0;
    state.selected = null;
    state.submitted = false;
    state.score = 0;
    state.answers = [];
    saveState();
    routeTo("practice");
  });
}

function startSession() {
  const topic = $("#topicInput").value.trim() || "Photosynthesis";
  state.topic = topic;
  state.questionIndex = 0;
  state.selected = null;
  state.submitted = false;
  state.score = 0;
  state.answers = [];

  if (topic.toLowerCase() !== "photosynthesis") {
    toast("The MVP currently demonstrates Photosynthesis.");
    $("#topicInput").value = "Photosynthesis";
    state.topic = "Photosynthesis";
  }

  saveState();
  routeTo("learn");
}

function init() {
  loadState();
  bindNavigation();
  $("#startBtn").addEventListener("click", startSession);
  $("#menuBtn").addEventListener("click", () => $("#mobileNav").classList.toggle("open"));
  window.addEventListener("hashchange", () => {
    const route = location.hash.replace("#", "");
    if (["home","learn","practice","progress"].includes(route)) routeTo(route);
  });

  const initial = location.hash.replace("#", "");
  if (["home","learn","practice","progress"].includes(initial)) routeTo(initial);
  else routeTo("home");
}

init();
