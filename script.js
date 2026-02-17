// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('SW Registered', registration))
            .catch(err => console.log('SW Registration Failed', err));
    });
}

// Predefined Rates (Simulation for BCV - In a real app this could fetch from an API)
const MOCK_BCV_DATE = "Actual"; 
let currentBcvRate = 396.37; // Default initial value

document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const inputs = {
        zelle: document.getElementById('zelleAmount'),
        usdtReceived: document.getElementById('usdtReceived'),
        usdtSellRate: document.getElementById('usdtSellRate'),
        cashBuyRate: document.getElementById('cashBuyRate')
    };

    // Displays
    const displays = {
        totalBs: document.getElementById('totalBs'),
        breakevenRate: document.getElementById('breakevenRate'),
        profitBs: document.getElementById('profitBs'),
        profitUsd: document.getElementById('profitUsd'),
        buyRateDisplay: document.getElementById('buyRateDisplay'),
        summaryText: document.getElementById('summaryText'),
        resultsContainer: document.getElementById('results'),
        bcvRateDisplay: document.getElementById('bcvRateDisplay')
    };

    const useBcvBtn = document.getElementById('useBcvBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Init BCV display
    displays.bcvRateDisplay.textContent = `${currentBcvRate} Bs`;

    // Calculate Logic
    function calculate() {
        const val = {
            zelle: parseFloat(inputs.zelle.value) || 0,
            usdtReceived: parseFloat(inputs.usdtReceived.value) || 0,
            usdtSellRate: parseFloat(inputs.usdtSellRate.value) || 0,
            cashBuyRate: parseFloat(inputs.cashBuyRate.value) || 0
        };

        if (val.zelle > 0 && val.usdtReceived > 0 && val.usdtSellRate > 0) {
            // Unhide results
            displays.resultsContainer.classList.remove('hidden');
            setTimeout(() => displays.resultsContainer.classList.add('visible'), 10);

            // 1. Total Bs
            const totalBs = val.usdtReceived * val.usdtSellRate;
            displays.totalBs.textContent = formatNb(totalBs) + ' Bs';

            // 2. Tasa de Equilibrio (Breakeven)
            const breakeven = totalBs / val.zelle;
            displays.breakevenRate.textContent = formatNb(breakeven) + ' Bs/$';

            // 3. Profit/Loss Analysis (Only if Cash Buy Rate is provided)
            if (val.cashBuyRate > 0) {
                displays.buyRateDisplay.textContent = formatNb(val.cashBuyRate);
                
                // Cost to buy back the Zelle amount in Cash
                const costBs = val.zelle * val.cashBuyRate;
                
                // Profit in Bs
                const profitBs = totalBs - costBs;
                
                // Profit in USD (Profit Bs / Cash Buy Rate) OR (Total USD gained - Initial Zelle)
                // Let's use: How much USD do I have now? Total Bs / Cash Rate
                const finalUsd = totalBs / val.cashBuyRate;
                const profitUsd = finalUsd - val.zelle;

                // Color coding
                const profitCard = document.querySelector('.result-card.profit');
                if (profitBs >= 0) {
                    displays.profitBs.textContent = '+' + formatNb(profitBs) + ' Bs';
                    displays.profitUsd.textContent = '+' + formatNb(profitUsd) + ' $';
                    profitCard.classList.remove('negative');
                    profitCard.classList.add('positive');
                } else {
                    displays.profitBs.textContent = formatNb(profitBs) + ' Bs';
                    displays.profitUsd.textContent = formatNb(profitUsd) + ' $';
                    profitCard.classList.remove('positive');
                    profitCard.classList.add('negative');
                }

                // Summary Text
                displays.summaryText.innerHTML = `
                    Para recuperar tus <strong>${val.zelle}$</strong> iniciales, teniendo <strong>${formatNb(totalBs)} Bs</strong>, debes comprar el efectivo a un máximo de <strong>${formatNb(breakeven)} Bs/USD</strong>.<br><br>
                    Si pagas el efectivo a <strong>${formatNb(val.cashBuyRate)} Bs</strong>, tu ganancia neta sería de <strong>${formatNb(profitUsd)} $</strong>.
                `;

            } else {
                displays.buyRateDisplay.textContent = '--';
                displays.profitBs.textContent = '0.00 Bs';
                displays.profitUsd.textContent = '0.00 $';
                displays.summaryText.innerHTML = `Ingresa una "Tasa Compra Efectivo" para ver tu ganancia.`;
            }

        } else {
            // Hide or clear if incomplete
            displays.resultsContainer.classList.remove('visible');
            // displays.resultsContainer.classList.add('hidden'); // Optional: keep hidden until valid
        }
    }

    // Helper: Format Number
    function formatNb(num) {
        return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Event Listeners
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', calculate);
    });

    useBcvBtn.addEventListener('click', () => {
        inputs.cashBuyRate.value = currentBcvRate;
        calculate();
    });

    resetBtn.addEventListener('click', () => {
        Object.values(inputs).forEach(input => input.value = '');
        displays.resultsContainer.classList.remove('visible');
        setTimeout(() => displays.resultsContainer.classList.add('hidden'), 300);
        inputs.zelle.focus();
    });
});
