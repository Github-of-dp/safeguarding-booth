let scenarios = [];
let userAnswers = {}; // Stores { scenarioId: selectedOptionKey }
let score = 0;

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
        const cardTitleParts = s.card.split(":");
        const cardNum = cardTitleParts[0];
        const cardHeading = cardTitleParts[1] ? cardTitleParts[1].trim() : s.card;
        const isAnswered = userAnswers[s.id] !== undefined;
        const selectedKey = userAnswers[s.id];
        const isCorrect = selectedKey === s.correct;

        return `
            <div class="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-5 flex flex-col justify-between gap-4 transition hover:shadow-md">
                <div class="space-y-3">
                    <div class="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <span class="px-2.5 py-0.5 rounded-md bg-[#7A1C2E]/10 text-[#7A1C2E] text-xs font-bold uppercase tracking-wider">${cardNum}</span>
                        <span class="text-[11px] font-medium text-stone-500 truncate max-w-[180px]">${s.category}</span>
                    </div>

                    <div>
                        <h3 class="text-sm font-bold text-stone-800 mb-1.5">${cardHeading}</h3>
                        <p class="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">${s.question}</p>
                    </div>

                    <div class="space-y-2 pt-1">
                        <p class="text-[10px] font-bold uppercase tracking-wider text-stone-400">Choose best response:</p>
                        <div class="grid gap-2">
                            ${s.options.map(opt => {
                                let btnStyle = "border-stone-200 bg-white hover:bg-stone-50 text-stone-700";
                                let badgeStyle = "bg-stone-100 text-stone-600";
                                
                                if (isAnswered) {
                                    if (opt.key === s.correct) {
                                        btnStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-900 font-medium";
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
                                        onclick="handleAnswer(${s.id}, '${opt.key}')"
                                        class="w-full text-left p-2.5 rounded-xl border text-xs transition flex items-start gap-2.5 ${btnStyle}"
                                    >
                                        <span class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${badgeStyle}">
                                            ${isAnswered && opt.key === s.correct ? '✓' : isAnswered && opt.key === selectedKey && opt.key !== s.correct ? '✕' : opt.key}
                                        </span>
                                        <span class="pt-0.5 leading-snug">${opt.text}</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                ${isAnswered ? `
                    <div class="p-3 rounded-xl border text-xs space-y-1 animate-fadeIn ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}">
                        <p class="font-bold flex items-center gap-1">
                            ${isCorrect ? '✅ Correct Choice!' : '⚠️ Correct Answer Highlighted Above.'}
                        </p>
                        <p class="text-[11px] leading-relaxed text-stone-700"><strong>Guidance:</strong> ${s.explanation}</p>
                    </div>
                ` : '<div class="text-[11px] text-stone-400 italic text-right">Click an option to test response</div>'}
            </div>
        `;
    }).join('');
}

function handleAnswer(scenarioId, optionKey) {
    if (userAnswers[scenarioId] !== undefined) return;
    
    userAnswers[scenarioId] = optionKey;
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (optionKey === scenario.correct) {
        score++;
        document.getElementById("scoreDisplay").innerText = score;
    }

    renderCardsGrid();
}

function toggleDirectory(show) {
    const modal = document.getElementById("directoryModal");
    if (show) modal.classList.remove("hidden");
    else modal.classList.add("hidden");
}