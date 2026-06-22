/**
 * js/history.js
 * Manages the password history — stored in localStorage.
 *
 * Exports: window.HistoryManager
 */
window.HistoryManager = (() => {
    const STORAGE_KEY = 'passforge_history';
    const MAX_ITEMS = 50;

    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function save(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function add(password, type = 'password') {
        if (!password || password === 'CLICK GENERATE') return;
        const items = load();
        // Avoid duplicates at the top
        if (items.length && items[0].value === password) return;
        items.unshift({
            id: Date.now(),
            value: password,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        save(items.slice(0, MAX_ITEMS));
    }

    function remove(id) {
        save(load().filter(item => item.id !== id));
    }

    function clear() {
        save([]);
    }

    function getAll() {
        return load();
    }

    function count() {
        return load().length;
    }

    return { add, remove, clear, getAll, count };
})();