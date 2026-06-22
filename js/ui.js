/**
 * js/ui.js
 * UI utilities — toast notifications, theme toggle, tab switching,
 * clipboard, export, history list rendering, strength meter updates.
 *
 * Exports: window.UI
 */
window.UI = (() => {

    /* ─── Toast ─── */
    let _toastTimer = null;

    function toast(message, type = 'info', duration = 2200) {
        const el = document.getElementById('toast');
        if (!el) return;

        // Choose icon
        const icons = { success: 'fa-check-circle', error: 'fa-circle-xmark', info: 'fa-circle-info' };
        const icon = icons[type] || icons.info;

        el.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        el.className = `toast ${type} show`;

        clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => {
            el.className = 'toast';
        }, duration);
    }

    /* ─── Theme ─── */
    const THEME_KEY = 'passforge_theme';

    function loadTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved) {
            applyTheme(saved);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
        toast(current === 'dark' ? '☀️ Light mode' : '🌙 Dark mode', 'info', 1600);
    }

    /* ─── Tabs ─── */
    function initTabs() {
        const tabs = document.querySelectorAll('.tab');
        const panels = document.querySelectorAll('.tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => { t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false'); });
                panels.forEach(p => { p.classList.remove('active');
                    p.hidden = true; });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                const panel = document.getElementById(`tab-${target}`);
                if (panel) { panel.classList.add('active');
                    panel.hidden = false; }

                if (target === 'history') renderHistory();
            });
        });
    }

    /* ─── Clipboard ─── */
    function copyToClipboard(text) {
        if (!text || text === 'CLICK GENERATE') {
            toast('Generate a password first', 'error');
            return false;
        }
        try {
            navigator.clipboard.writeText(text).then(() => {
                toast('✓ Copied to clipboard!', 'success');
            }).catch(() => legacyCopy(text));
        } catch {
            legacyCopy(text);
        }
        return true;
    }

    function legacyCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast('✓ Copied to clipboard!', 'success');
    }

    /* ─── Export ─── */
    function exportToFile(content, filename = 'password.txt') {
        if (!content || content === 'CLICK GENERATE') {
            toast('Nothing to export yet', 'error');
            return;
        }
        const meta = [
            '========================================',
            '  PassForge — Generated Credential',
            `  Date: ${new Date().toLocaleString()}`,
            '========================================',
            '',
            content,
            '',
            '  ⚠  Store this file securely and delete it',
            '     after saving to a password manager.',
            '',
        ].join('\n');

        const blob = new Blob([meta], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast('File downloaded', 'success');
    }

    function exportHistory() {
        const items = window.HistoryManager.getAll();
        if (!items.length) {
            toast('No history to export', 'error');
            return;
        }
        const lines = [
            '========================================',
            '  PassForge — Password History Export',
            `  Date: ${new Date().toLocaleString()}`,
            `  Total: ${items.length} item(s)`,
            '========================================',
            '',
            ...items.map((it, idx) => `${String(idx + 1).padStart(2,'0')}.  [${it.type}]  ${it.time}  →  ${it.value}`),
            '',
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passforge-history-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast(`${items.length} passwords exported`, 'success');
    }

    /* ─── History Rendering ─── */
    function renderHistory() {
        const list = document.getElementById('history-list');
        const count = document.getElementById('history-count');
        const badge = document.getElementById('history-badge');
        if (!list) return;

        const items = window.HistoryManager.getAll();
        badge.textContent = items.length || '';
        if (count) count.textContent = `${items.length} password${items.length !== 1 ? 's' : ''} saved`;

        if (!items.length) {
            list.innerHTML = `
        <li class="history-empty">
          <i class="fas fa-clock-rotate-left fa-2x"></i>
          <p>No passwords yet. Generate some!</p>
        </li>`;
            return;
        }

        list.innerHTML = items.map(item => `
      <li class="history-item" data-id="${item.id}">
        <div class="history-item__text">${escapeHtml(item.value)}</div>
        <div class="history-item__meta">${item.type === 'passphrase' ? '🔤' : '🔑'} ${item.time}</div>
        <div class="history-item__actions">
          <button class="icon-btn history-copy" data-value="${escapeAttr(item.value)}" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
          <button class="icon-btn history-delete" data-id="${item.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </li>`).join('');

        // Bind copy/delete
        list.querySelectorAll('.history-copy').forEach(btn => {
            btn.addEventListener('click', () => copyToClipboard(btn.dataset.value));
        });
        list.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                window.HistoryManager.remove(Number(btn.dataset.id));
                renderHistory();
                toast('Removed from history', 'info', 1600);
            });
        });
    }

    function updateBadge() {
        const badge = document.getElementById('history-badge');
        if (badge) badge.textContent = window.HistoryManager.count() || '';
    }

    /* ─── Strength Meter ─── */
    function updateStrength(password, barId, textId) {
        const bar = document.getElementById(barId);
        const text = document.getElementById(textId);
        if (bar && text) window.StrengthMeter.render(password, bar, text);
    }

    /* ─── Slider fill ─── */
    function applySliderFill(sliderEl) {
        const pct = ((sliderEl.value - sliderEl.min) / (sliderEl.max - sliderEl.min)) * 100;
        sliderEl.style.background = `linear-gradient(90deg, var(--accent-bright) ${pct}%, var(--border) ${pct}%)`;
    }

    /* ─── Helpers ─── */
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    return {
        toast,
        loadTheme,
        toggleTheme,
        initTabs,
        copyToClipboard,
        exportToFile,
        exportHistory,
        renderHistory,
        updateBadge,
        updateStrength,
        applySliderFill,
    };
})();