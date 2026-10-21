let scenarios = [];
let userAnswers = {}; // stores { scenarioId: selectedOptionKey }
let score = 0;
let activeScenarioId = null;

document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/scenarios')
        .then(res => res.json())
        .then(data => {
            scenarios = data;
            renderCardsGrid();
        });
});

function renderCardsGrid() {
    const grid = document.getElementById("scenariosGrid");
    grid.innerHTML = scenarios.map(s => {
        const titleParts = s.card.split(":");
        const cardNum = titleParts[0];
        const cardTitle = titleParts[1] ? titleParts[1].trim() : s.card;
        const isAnswered = userAnswers[s.id] !== undefined;
        const selectedKey = userAnswers[s.id];
        const isCorrect = selectedKey === s.correct;

        return `
            <div onclick="openModal(${s.id})" class="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/90 hover:border-[#7A1C2E]/40 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-5 group">
                <div class="space-y-3">
                    <div class="flex items-center justify-between border-b border-stone-100 pb-3">
                        <span class="px-3 py-1 rounded-lg bg-[#7A1C2E]/10 text-[#7A1C2E] text-xs font-bold uppercase tracking-wider">${cardNum}</span>
                        <span class="text-xs font-medium text-stone-500">${s.category}</span>
                    </div>

                    <div>
                        <h3 class="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#7A1C2E] transition mb-2">${cardTitle}</h3>
                        <p class="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">${s.question}</p>
                    </div>
                </div>

                <div class="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span class="text-xs font-semibold ${isAnswered ? (isCorrect ? 'text-emerald-700' : 'text-amber-700') : 'text-stone-400'}">
                        ${isAnswered ? (isCorrect ? '✅ Solved Correctly' : '⚠️ Answered') : 'Click to View Scenario ➔'}
                    </span>
                    <span class="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-[#7A1C2E] group-hover:text-white text-stone-600 flex items-center justify-center text-xs font-bold transition">
                        🔍
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function openModal(scenarioId) {
    activeScenarioId = scenarioId;
    const s = scenarios.find(item => item.id === scenarioId);
    const titleParts = s.card.split(":");
    
    document.getElementById("modalCardBadge").innerText = titleParts[0];
    document.getElementById("modalCategory").innerText = s.category;
    document.getElementById("modalTitle").innerText = titleParts[1] ? titleParts[1].trim() : s.card;
    document.getElementById("modalQuestion").innerText = s.question;

    renderModalOptions();
    document.getElementById("scenarioModal").classList.remove("hidden");
}

function renderModalOptions() {
    const s = scenarios.find(item => item.id === activeScenarioId);
    const selectedKey = userAnswers[s.id];
    const isAnswered = selectedKey !== undefined;
    const isCorrect = selectedKey === s.correct;

    const optionsEl = document.getElementById("modalOptions");
    optionsEl.innerHTML = s.options.map(opt => {
        let btnStyle = "border-stone-200 bg-white hover:bg-stone-50 text-stone-700";
        let badgeStyle = "bg-stone-100 text-stone-700";

        if (isAnswered) {
            if (opt.key === s.correct) {
                btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-400";
                badgeStyle = "bg-emerald-600 text-white";
            } else if (opt.key === selectedKey && opt.key !== s.correct) {
                btnStyle = "border-rose-300 bg-rose-50 text-rose-900";
                badgeStyle = "bg-rose-500 text-white";
            } else {
                btnStyle = "border-stone-100 bg-stone-50 opacity-50 text-stone-400";
            }
        }

        return `
            <button 
                ${isAnswered ? 'disabled' : ''}
                onclick="handleModalAnswer('${opt.key}')"
                class="w-full text-left p-4 rounded-2xl border text-sm sm:text-base transition flex items-start gap-3.5 ${btnStyle}"
            >
                <span class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${badgeStyle}">
                    ${isAnswered && opt.key === s.correct ? '✓' : isAnswered && opt.key === selectedKey && opt.key !== s.correct ? '✕' : opt.key}
                </span>
                <span class="pt-0.5 leading-snug">${opt.text}</span>
            </button>
        `;
    }).join('');

    const expBox = document.getElementById("modalExplanation");
    if (isAnswered) {
        expBox.classList.remove("hidden");
        expBox.className = `p-5 rounded-2xl border text-sm space-y-2 animate-fadeIn ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`;
        expBox.innerHTML = `
            <p class="font-bold flex items-center gap-1.5 text-base">
                ${isCorrect ? '✅ Correct Choice! Well Done.' : '⚠️ Not quite. The correct answer is highlighted above.'}
            </p>
            <p class="leading-relaxed text-stone-700"><strong>Recommended Guidance:</strong> ${s.explanation}</p>
        `;
    } else {
        expBox.classList.add("hidden");
    }
}

function handleModalAnswer(optionKey) {
    if (userAnswers[activeScenarioId] !== undefined) return;

    userAnswers[activeScenarioId] = optionKey;
    const s = scenarios.find(item => item.id === activeScenarioId);

    if (optionKey === s.correct) {
        score++;
        document.getElementById("scoreDisplay").innerText = score;
    }

    renderModalOptions();
    renderCardsGrid();
}

function closeModal() {
    document.getElementById("scenarioModal").classList.add("hidden");
    activeScenarioId = null;
}

function resetProgress() {
    userAnswers = {};
    score = 0;
    document.getElementById("scoreDisplay").innerText = score;
    renderCardsGrid();
}

function toggleDirectory(show) {
    const modal = document.getElementById("directoryModal");
    if (show) modal.classList.remove("hidden");
    else modal.classList.add("hidden");
}