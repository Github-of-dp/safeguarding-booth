let scenarios = [];
let userAnswers = {};
let activeScenarioId = null;

document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/scenarios')
        .then(res => res.json())
        .then(data => {
            scenarios = data;
            renderCardsGrid();
        });
});

function switchTab(tab) {
    const mentalHealthSec = document.getElementById("sectionMentalHealth");
    const safeguardingSec = document.getElementById("sectionSafeguarding");
    const scenariosSec = document.getElementById("sectionScenarios");
    
    const mentalHealthBtn = document.getElementById("tabMentalHealthBtn");
    const safeguardingBtn = document.getElementById("tabSafeguardingBtn");
    const scenariosBtn = document.getElementById("tabScenariosBtn");

    mentalHealthSec.classList.add("hidden");
    safeguardingSec.classList.add("hidden");
    scenariosSec.classList.add("hidden");

    const inactiveStyle = "py-3 px-5 rounded-2xl font-semibold text-sm sm:text-base bg-stone-100 text-stone-700 hover:bg-stone-200 transition flex items-center gap-2 cursor-pointer border border-stone-200";
    const activeStyle = "py-3 px-5 rounded-2xl font-bold text-sm sm:text-base bg-[#7A1C2E] text-white shadow-md transition flex items-center gap-2 cursor-pointer";

    mentalHealthBtn.className = inactiveStyle;
    safeguardingBtn.className = inactiveStyle;
    scenariosBtn.className = inactiveStyle;

    if (tab === 'mentalHealth') {
        mentalHealthSec.classList.remove("hidden");
        mentalHealthBtn.className = activeStyle;
    } else if (tab === 'safeguarding') {
        safeguardingSec.classList.remove("hidden");
        safeguardingBtn.className = activeStyle;
    } else if (tab === 'scenarios') {
        scenariosSec.classList.remove("hidden");
        scenariosBtn.className = activeStyle;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCardsGrid() {
    const grid = document.getElementById("scenariosGrid");
    grid.innerHTML = scenarios.map(s => {
        const titleParts = s.card.split(":");
        const cardNum = titleParts[0];
        const cardTitle = titleParts[1] ? titleParts[1].trim() : s.card;
        const isAnswered = userAnswers[s.id] !== undefined;

        return `
            <div onclick="openModal(${s.id})" class="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/95 hover:border-[#7A1C2E]/40 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-5 group">
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
                    <span class="text-xs font-semibold ${isAnswered ? 'text-emerald-700' : 'text-stone-400'}">
                        ${isAnswered ? 'Completed' : 'Click to View Scenario ➔'}
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
        let btnStyle = "border-stone-200 bg-white hover:bg-slate-50 text-stone-700";
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
                ${isCorrect ? 'Correct Choice! Well Done.' : 'The correct answer is highlighted above.'}
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
    renderModalOptions();
    renderCardsGrid();
}

function closeModal() {
    if (activeScenarioId !== null) {
        delete userAnswers[activeScenarioId];
    }
    
    document.getElementById("scenarioModal").classList.add("hidden");
    activeScenarioId = null;
    renderCardsGrid();
}

function toggleDirectory(show) {
    const modal = document.getElementById("directoryModal");
    if (show) modal.classList.remove("hidden");
    else modal.classList.add("hidden");
}