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
        cashBuyRate: document.getElementById('cashBuyRate'),
        usdtSellRate: document.getElementById('usdtSellRate')
    };

    // Displays
    const displays = {
        totalBs: document.getElementById('totalBs'),
        breakevenRate: document.getElementById('breakevenRate'),
        finalCash: document.getElementById('finalCash'),
        resultsContainer: document.getElementById('results')
    };

    const resetBtn = document.getElementById('resetBtn');
    const cashBuyRateInput = document.getElementById('cashBuyRate'); // This is the hidden input for the cash buy rate

    // Init Logic
    function getVals() {
        return {
            zelle: parseFloat(inputs.zelle.value) || 0,
            usdtReceived: parseFloat(inputs.usdtReceived.value) || 0,
            usdtSellRate: parseFloat(inputs.usdtSellRate.value) || 0
        };
    }

    function calculate() {
        const val = getVals();

        if (val.zelle > 0 && val.usdtReceived > 0 && val.usdtSellRate > 0) {
            // Unhide results
            displays.resultsContainer.classList.remove('hidden');
            setTimeout(() => displays.resultsContainer.classList.add('visible'), 10);

            // 1. Total Bs
            const totalBs = val.usdtReceived * val.usdtSellRate;
            displays.totalBs.textContent = formatNb(totalBs);

            // 2. Tasa de Equilibrio (Auto-Calculated)
            const breakeven = totalBs / val.zelle;
            displays.breakevenRate.textContent = formatNb(breakeven);

            // 3. Auto-Apply Breakeven Rate to Logic (Simulated)
            // User requested to "use the recommended rate to calculate cash received".
            // If we buy at Breakeven, Cash = Zelle.
            // If we buy at BCV? No, user said "use recommended".
            // Let's show the Cash value assuming they buy at BREAKEVEV (which is the max).
            // Actually, if they buy at Breakeven, they get exactly their Zelle back.
            // Let's display simple Zelle amount as "Retorno" or allow input?
            // "Utiliza la tasa que me recomienda" -> Use Breakeven.

            // Set hidden input value for reference
            cashBuyRateInput.value = breakeven.toFixed(2);

            // Final Cash (Technically = Zelle Amount if Rate = Breakeven)
            // But let's calculate it properly in case of rounding
            const finalUsd = totalBs / breakeven;
            displays.finalCash.textContent = formatNb(finalUsd) + ' $';

        } else {
            // Hide
            displays.resultsContainer.classList.remove('visible');
            displays.resultsContainer.classList.add('hidden');
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

    resetBtn.addEventListener('click', () => {
        Object.values(inputs).forEach(input => input.value = '');
        displays.resultsContainer.classList.remove('visible');
        setTimeout(() => displays.resultsContainer.classList.add('hidden'), 300);
        inputs.zelle.focus();
    });
});
