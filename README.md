# PassForge — Enhanced Password Generator

A fully upgraded password generator with modern UI, new features, and clean file separation.

---

## 📁 Project Structure

```
password-generator/
├── index.html          ← Main HTML (structure + tabs)
├── css/
│   └── style.css       ← All styles (dark/light themes, responsive)
└── js/
    ├── words.js        ← Word list for passphrase generation
    ├── strength.js     ← Password strength calculator
    ├── generator.js    ← Core generation logic (password + passphrase)
    ├── history.js      ← History manager (localStorage)
    ├── ui.js           ← UI utilities (toast, theme, tabs, export, etc.)
    └── app.js          ← Main entry point — wires everything together
```

---

## 🚀 How to Run

**Option 1 — Just open the file:**
```
Open index.html in any modern browser (Chrome, Firefox, Edge, Safari)
```

**Option 2 — Local dev server (recommended to avoid CORS quirks):**
```bash
# Using Python
python3 -m http.server 8080
# then visit http://localhost:8080

# Using Node.js / npx
npx serve .
```

---

## ✅ New Features

| Feature | File | Notes |
|---|---|---|
| **Password strength meter** | `strength.js` | Scores length, variety, uniqueness, penalises patterns |
| **Dark / Light mode** | `css/style.css` + `ui.js` | Persisted in localStorage; respects OS preference on first load |
| **Password history** | `history.js` + `ui.js` | Up to 50 entries, stored in localStorage, copy/delete each |
| **No ambiguous characters** | `generator.js` | Filters out O, 0, l, I, 1 |
| **Memorable passphrases** | `generator.js` + `words.js` | Configurable words, separator, capitalisation, numbers |
| **Export to file** | `ui.js` | Downloads `.txt` with metadata warning |
| **Responsive mobile design** | `css/style.css` | Tested down to 320px viewport |
| **Keyboard shortcuts** | `app.js` | `G` = generate, `C` = copy, `Alt+T` = toggle theme |
| **Toast notifications** | `ui.js` | Success / error / info with auto-dismiss |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Generate new password / passphrase (whichever tab is active) |
| `C` | Copy last generated value |
| `Alt + T` | Toggle dark / light theme |

---

## 📸 Project Preview

| Dark mode          | Light mode           |
|--------------------|----------------------|
| ![](dark mode.png) | ![](light mode.png) |

### Password History

![](History.png)

## 🔐 Security Notes

- Uses `window.crypto.getRandomValues()` for all randomness (cryptographically secure).
- Modulo-bias protection applied on each character pick.
- Guarantees at least one character from each selected type before filling the rest.
- History is stored in **localStorage only** — nothing is sent anywhere.

---

## 🛠 Customisation Tips

**Add more words for passphrases** → edit `js/words.js`, push to `window.WORD_LIST`.

**Change the colour accent** → edit `--accent` and `--accent-bright` in the `:root` block of `css/style.css`.

**Change max password length** → edit `max="64"` on the `#slider` input in `index.html`.

**Change history limit** → edit `MAX_ITEMS` in `js/history.js`.