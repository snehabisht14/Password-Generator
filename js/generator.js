/**
 * js/generator.js
 * Core generation logic — no DOM touches here.
 *
 * Exports: window.Generator
 * Methods:
 *   Generator.password(options)   → string
 *   Generator.passphrase(options) → string
 */
window.Generator = (() => {

    /* ── Secure random helpers ── */
    function secureRandInt(max) {
        const arr = new Uint32Array(1);
        let result;
        do {
            window.crypto.getRandomValues(arr);
            result = arr[0];
        } while (result >= Math.floor(0xFFFFFFFF / max) * max); // avoid modulo bias
        return result % max;
    }

    function secureRandFloat() {
        return window.crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    }

    /* ── Character sets ── */
    const SETS = {
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        number: '0123456789',
        symbol: '!@#$%^&*()-_=+[]{}|;:,.<>?',
    };

    const AMBIGUOUS = new Set(['O', '0', 'l', 'I', '1']);

    function buildCharset({ lower, upper, number, symbol, noAmbiguous }) {
        let chars = '';
        if (lower) chars += SETS.lower;
        if (upper) chars += SETS.upper;
        if (number) chars += SETS.number;
        if (symbol) chars += SETS.symbol;

        if (noAmbiguous) {
            chars = chars.split('').filter(c => !AMBIGUOUS.has(c)).join('');
        }
        return chars;
    }

    /**
     * Generate a random password.
     * @param {Object} opts
     * @param {number}  opts.length
     * @param {boolean} opts.lower
     * @param {boolean} opts.upper
     * @param {boolean} opts.number
     * @param {boolean} opts.symbol
     * @param {boolean} opts.noAmbiguous
     * @returns {string}
     */
    function password({ length = 16, lower = true, upper = true, number = true, symbol = false, noAmbiguous = false } = {}) {
        const charset = buildCharset({ lower, upper, number, symbol, noAmbiguous });
        if (!charset) return '';

        // Guarantee at least one character from each selected type
        const guarantees = [];
        const types = [];
        if (lower) types.push(noAmbiguous ? SETS.lower.split('').filter(c => !AMBIGUOUS.has(c)).join('') : SETS.lower);
        if (upper) types.push(noAmbiguous ? SETS.upper.split('').filter(c => !AMBIGUOUS.has(c)).join('') : SETS.upper);
        if (number) types.push(noAmbiguous ? SETS.number.split('').filter(c => !AMBIGUOUS.has(c)).join('') : SETS.number);
        if (symbol) types.push(SETS.symbol);

        types.forEach(set => {
            if (set.length) guarantees.push(set[secureRandInt(set.length)]);
        });

        const remaining = length - guarantees.length;
        const pool = [];
        for (let i = 0; i < Math.max(0, remaining); i++) {
            pool.push(charset[secureRandInt(charset.length)]);
        }

        // Shuffle guarantees + pool together
        const all = [...guarantees, ...pool];
        for (let i = all.length - 1; i > 0; i--) {
            const j = secureRandInt(i + 1);
            [all[i], all[j]] = [all[j], all[i]];
        }

        return all.join('');
    }

    /**
     * Generate a memorable passphrase.
     * @param {Object} opts
     * @param {number}  opts.wordCount
     * @param {string}  opts.separator
     * @param {boolean} opts.capitalize
     * @param {boolean} opts.addNumbers
     * @returns {string}
     */
    function passphrase({ wordCount = 4, separator = '-', capitalize = true, addNumbers = true } = {}) {
        const list = window.WORD_LIST;
        const words = [];

        for (let i = 0; i < wordCount; i++) {
            let word = list[secureRandInt(list.length)];
            if (capitalize) word = word[0].toUpperCase() + word.slice(1);
            words.push(word);
        }

        if (!addNumbers) return words.join(separator);

        // Insert a 1–2 digit number at a random position between words
        const numPos = secureRandInt(wordCount - 1) + 1; // 1 to wordCount-1
        const numStr = String(10 + secureRandInt(90)); // 10–99
        words.splice(numPos, 0, numStr);

        return words.join(separator);
    }

    return { password, passphrase };
})();