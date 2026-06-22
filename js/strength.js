/**
 * js/strength.js
 * Calculates password / passphrase strength and updates the UI meter.
 *
 * Exports:  window.StrengthMeter
 * Methods:
 *   StrengthMeter.evaluate(password)  → { score 0-4, label, cssClass, pct }
 *   StrengthMeter.render(password, barEl, textEl)
 */
window.StrengthMeter = (() => {

    const LEVELS = [
        { label: 'Very Weak', cssClass: 'weak', pct: 15 },
        { label: 'Weak', cssClass: 'weak', pct: 30 },
        { label: 'Fair', cssClass: 'fair', pct: 52 },
        { label: 'Good', cssClass: 'good', pct: 72 },
        { label: 'Strong', cssClass: 'strong', pct: 88 },
        { label: 'Very Strong', cssClass: 'very-strong', pct: 100 },
    ];

    function evaluate(password) {
        if (!password || password === 'CLICK GENERATE') {
            return { score: -1, label: '—', cssClass: '', pct: 0 };
        }

        let score = 0;

        // Length bonuses
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (password.length >= 20) score++;

        // Character variety
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        // Unique characters
        const unique = new Set(password).size;
        if (unique > 8) score++;
        if (unique > 14) score++;

        // Penalise repetition / sequential runs
        if (/(.)\1{2,}/.test(password)) score -= 2;
        if (/012|123|234|345|456|567|678|789|890/.test(password)) score -= 1;
        if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk/.test(password.toLowerCase())) score -= 1;

        // Clamp to 0-5
        score = Math.max(0, Math.min(5, score));

        return { score, ...LEVELS[score] };
    }

    function render(password, barEl, textEl) {
        const result = evaluate(password);

        // Reset classes
        barEl.className = 'strength-bar';
        textEl.className = 'strength-text';

        if (result.pct === 0) {
            barEl.style.width = '0%';
            textEl.textContent = '—';
            return;
        }

        barEl.style.width = result.pct + '%';
        barEl.classList.add(result.cssClass);
        textEl.classList.add(result.cssClass);
        textEl.textContent = result.label;
    }

    return { evaluate, render };
})();