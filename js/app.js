/**
 * js/app.js
 * Entry point — binds all DOM events, handles keyboard shortcuts,
 * and initialises the app on DOMContentLoaded.
 *
 * Depends on (loaded before this):
 *   words.js → window.WORD_LIST
 *   strength.js → window.StrengthMeter
 *   generator.js → window.Generator
 *   history.js → window.HistoryManager
 *   ui.js → window.UI
 */

(function() {
    'use strict';

    /* ── Helpers ── */
    function $(id) { return document.getElementById(id); }

    /* ── State ── */
    let lastPassword = '';
    let lastPhrase = '';

    /* ── Password options from DOM ── */
    function getPasswordOpts() {
        return {
            length: +$('slider').value,
            lower: $('lowercase').checked,
            upper: $('uppercase').checked,
            number: $('number').checked,
            symbol: $('symbol').checked,
            noAmbiguous: $('no-ambiguous').checked,
        };
    }

    function getPhraseOpts() {
        return {
            wordCount: +$('word-count').value,
            separator: $('separator').value,
            capitalize: $('phrase-capitalize').checked,
            addNumbers: $('phrase-numbers').checked,
        };
    }

    /* ── Generate Password ── */
    function doGenerate() {
        const opts = getPasswordOpts();

        // Ensure at least one type selected
        if (!opts.lower && !opts.upper && !opts.number && !opts.symbol) {
            UI.toast('Select at least one character type', 'error');
            return;
        }

        const pwd = Generator.password(opts);
        lastPassword = pwd;

        const resultEl = $('result');
        resultEl.textContent = pwd;
        resultEl.classList.remove('placeholder');

        // Spin refresh icon for feedback
        const refreshIcon = $('refresh-btn').querySelector('i');
        refreshIcon.classList.add('spinning');
        setTimeout(() => refreshIcon.classList.remove('spinning'), 400);

        UI.updateStrength(pwd, 'strength-bar', 'strength-text');
        HistoryManager.add(pwd, 'password');
        UI.updateBadge();
    }

    /* ── Generate Passphrase ── */
    function doGeneratePhrase() {
        const opts = getPhraseOpts();
        const phrase = Generator.passphrase(opts);
        lastPhrase = phrase;

        const el = $('phrase-result');
        el.textContent = phrase;
        el.classList.remove('placeholder');

        const refreshIcon = $('refresh-phrase-btn').querySelector('i');
        refreshIcon.classList.add('spinning');
        setTimeout(() => refreshIcon.classList.remove('spinning'), 400);

        UI.updateStrength(phrase, 'phrase-strength-bar', 'phrase-strength-text');
        HistoryManager.add(phrase, 'passphrase');
        UI.updateBadge();
    }

    /* ── Checkbox guard (keep at least one checked) ── */
    function guardCheckboxes() {
        const boxes = [$('uppercase'), $('lowercase'), $('number'), $('symbol')];
        const checked = boxes.filter(b => b.checked);
        boxes.forEach(b => { b.disabled = false; });
        if (checked.length === 1) checked[0].disabled = true;
    }

    /* ── Keyboard Shortcuts ── */
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', e => {
            // Ignore when typing in inputs / selects
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

            switch (e.key.toLowerCase()) {
                case 'g':
                    // Generate whichever tab is active
                    if (document.querySelector('.tab[data-tab="password"].active')) doGenerate();
                    else if (document.querySelector('.tab[data-tab="passphrase"].active')) doGeneratePhrase();
                    break;

                case 'c':
                    if (lastPassword && document.querySelector('.tab[data-tab="password"].active')) {
                        UI.copyToClipboard(lastPassword);
                    } else if (lastPhrase && document.querySelector('.tab[data-tab="passphrase"].active')) {
                        UI.copyToClipboard(lastPhrase);
                    }
                    break;

                case 't':
                    if (e.altKey) { e.preventDefault();
                        UI.toggleTheme(); }
                    break;
            }
        });
    }

    /* ── Init ── */
    document.addEventListener('DOMContentLoaded', () => {

        /* Theme */
        UI.loadTheme();
        $('theme-toggle').addEventListener('click', UI.toggleTheme);

        /* Shortcut hint dismiss */
        $('shortcut-close').addEventListener('click', () => {
            const hint = $('shortcut-hint');
            hint.style.opacity = '0';
            hint.style.pointerEvents = 'none';
            setTimeout(() => hint.remove(), 300);
        });

        /* Tabs */
        UI.initTabs();

        /* ── Password Tab ── */

        // Slider
        const slider = $('slider');
        UI.applySliderFill(slider);
        slider.addEventListener('input', () => {
            $('length-display').textContent = slider.value;
            UI.applySliderFill(slider);
            // Live update if password already shown
            if (lastPassword) doGenerate();
        });

        // Checkboxes
        [$('uppercase'), $('lowercase'), $('number'), $('symbol'), $('no-ambiguous')].forEach(el => {
            if (!el) return;
            el.addEventListener('change', () => {
                guardCheckboxes();
                if (lastPassword) doGenerate();
            });
        });

        // Result click → copy
        $('result').addEventListener('click', () => UI.copyToClipboard(lastPassword));

        // Buttons
        $('generate').addEventListener('click', doGenerate);
        $('refresh-btn').addEventListener('click', doGenerate);
        $('copy-btn').addEventListener('click', () => UI.copyToClipboard(lastPassword));
        $('export-btn').addEventListener('click', () =>
            UI.exportToFile(lastPassword, `password-${Date.now()}.txt`));

        /* ── Passphrase Tab ── */

        const wordSlider = $('word-count');
        UI.applySliderFill(wordSlider);
        wordSlider.addEventListener('input', () => {
            $('word-count-display').textContent = wordSlider.value;
            UI.applySliderFill(wordSlider);
            if (lastPhrase) doGeneratePhrase();
        });

        [$('phrase-numbers'), $('phrase-capitalize'), $('separator')].forEach(el => {
            if (!el) return;
            el.addEventListener('change', () => { if (lastPhrase) doGeneratePhrase(); });
        });

        $('phrase-result').addEventListener('click', () => UI.copyToClipboard(lastPhrase));
        $('generate-phrase').addEventListener('click', doGeneratePhrase);
        $('refresh-phrase-btn').addEventListener('click', doGeneratePhrase);
        $('copy-phrase-btn').addEventListener('click', () => UI.copyToClipboard(lastPhrase));
        $('export-phrase-btn').addEventListener('click', () =>
            UI.exportToFile(lastPhrase, `passphrase-${Date.now()}.txt`));

        /* ── History Tab ── */
        $('clear-history-btn').addEventListener('click', () => {
            if (confirm('Clear all saved passwords?')) {
                HistoryManager.clear();
                UI.renderHistory();
                UI.updateBadge();
                UI.toast('History cleared', 'info');
            }
        });

        $('export-history-btn').addEventListener('click', UI.exportHistory);

        /* ── Keyboard shortcuts ── */
        initKeyboardShortcuts();

        /* ── Generate one on load ── */
        doGenerate();

        /* Update badge on load */
        UI.updateBadge();
    });

})();