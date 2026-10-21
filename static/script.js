let scenarios = [];
let filteredScenarios = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let isMuted = false;
let currentCategory = "All";
let completedScenarios = {};

document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/scenarios')
        .then(res => res.json())
        .then(data => {
            scenarios = data;
            filteredScenarios = data;
            setupCategories();
            renderScenario();
        });
});

function setupCategories() {
    const categories = ["All", ...new Set(scenarios.map(s => s.category))];
    const container = document.getElementById("categoryFilters");
    container.innerHTML = categories.map(cat => `
        <button onclick="filterCategory('${cat}')" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${currentCategory === cat ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
            ${cat}
        </button>
    `).join('');
}

function filterCategory(cat) {
    currentCategory = cat;
    currentIndex = 0;
    answered = false;
    filteredScenarios = cat === "All" ? scenarios : scenarios.filter(s => s.category === cat);
    setupCategories();
    renderScenario();
}

function renderScenario() {
    if (filteredScenarios.length === 0) return;
    const s = filteredScenarios[currentIndex];

    document.getElementById("cardBadge").innerText = s.card.split(":")[0];
    document.getElementById("cardCategory").innerText = s.category;
    document.getElementById("scenarioCounter").innerText = `Scenario ${currentIndex + 1} of ${filteredScenarios.length}`;
    document.getElementById("cardTitle").innerText = s.card.split(":")[1];
    document.getElementById("cardQuestion").innerText = s.question;
    document.getElementById("totalScenarios").innerText = scenarios.length;

    const optionsEl = document.getElementById("optionsContainer");
    optionsEl.innerHTML = s.options.map(opt => `
        <button id="opt-${opt.key}" onclick="selectOption('${opt.key}')" class="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-start gap-3.5">
            <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">${opt.key}</span>
            <span class="text-sm sm:text-base pt-0.5">${opt.text}</span>
        </button>
    `).join('');

    document.getElementById("explanationBox").classList.add("hidden");
    document.getElementById("nextBtn").classList.add("hidden");
    answered = false;

    speak(s.question);
}

function selectOption(key) {
    if (answered) return;
    answered = true;
    const s = filteredScenarios[currentIndex];
    const isCorrect = key === s.correct;

    if (isCorrect && !completedScenarios[s.id]) {
        score++;
        completedScenarios[s.id] = true;
        document.getElementById("scoreDisplay").innerText = score;
    }

    s.options.forEach(opt => {
        const btn = document.getElementById(`opt-${opt.key}`);
        btn.disabled = true;
        const badge = btn.querySelector('span');
        if (opt.key === s.correct) {
            btn.className = "w-full text-left p-4 rounded-xl border border-emerald-500 bg-emerald-50/60 text-emerald-900 font-medium ring-1 ring-emerald-400 transition flex items-start gap-3.5";
            badge.className = "w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0";
            badge.innerHTML = "✓";
        } else if (opt.key === key && !isCorrect) {
            btn.className = "w-full text-left p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 transition flex items-start gap-3.5";
            badge.className = "w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0";
            badge.innerHTML = "✕";
        } else {
            btn.className = "w-full text-left p-4 rounded-xl border border-slate-100 bg-slate-50 opacity-60 text-slate-500 transition flex items-start gap-3.5";
        }
    });

    const expBox = document.getElementById("explanationBox");
    const expHeader = document.getElementById("explanationHeader");
    expBox.classList.remove("hidden");
    expBox.className = `p-5 rounded-xl border animate-fadeIn space-y-2 ${isCorrect ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'}`;
    
    expHeader.innerHTML = isCorrect ? '✅ Correct Choice! Well Done.' : '⚠️ Not quite. The correct answer is highlighted above.';
    document.getElementById("explanationText").innerText = s.explanation;
    document.getElementById("nextBtn").classList.remove("hidden");
}

function nextScenario() {
    if (currentIndex < filteredScenarios.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    renderScenario();
}

function resetQuiz() {
    currentIndex = 0;
    score = 0;
    completedScenarios = {};
    document.getElementById("scoreDisplay").innerText = score;
    renderScenario();
}

function toggleDirectory(show) {
    const modal = document.getElementById("directoryModal");
    if (show) modal.classList.remove("hidden");
    else modal.classList.add("hidden");
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById("muteBtn").innerText = isMuted ? "🔇" : "🔊";
    if (isMuted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function speak(text) {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}