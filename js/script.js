// ==========================================
// SecurePass Pro
// Part 3A
// ==========================================

// ---------- DOM Elements ----------

const passwordBox = document.getElementById("password");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");

const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");

const uppercase = document.getElementById("uppercase");
const lowercase = document.getElementById("lowercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");
const similar = document.getElementById("similar");
const duplicates = document.getElementById("duplicates");

const toast = document.getElementById("toast");

// ---------- Character Sets ----------

const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const lowerChars = "abcdefghijklmnopqrstuvwxyz";

const numberChars = "0123456789";

const symbolChars = "!@#$%^&*()_+{}[]<>?/|~";

const similarChars = "O0Il1";

// ==========================================
// Slider
// ==========================================

lengthSlider.addEventListener("input", () => {

    lengthValue.textContent = lengthSlider.value;

});

// ==========================================
// Remove Similar Characters
// ==========================================

function removeSimilar(str) {

    return [...str]

    .filter(char => !similarChars.includes(char))

    .join("");

}

// ==========================================
// Random Character
// ==========================================

function randomCharacter(chars) {

    return chars[Math.floor(Math.random() * chars.length)];

}

// ==========================================
// Generate Password
// ==========================================

function generatePassword() {

    let charset = "";

    if (uppercase.checked)
        charset += upperChars;

    if (lowercase.checked)
        charset += lowerChars;

    if (numbers.checked)
        charset += numberChars;

    if (symbols.checked)
        charset += symbolChars;

    if (similar.checked) {

        charset = removeSimilar(charset);

    }

    if (charset.length === 0) {

        alert("Select at least one option.");

        return;

    }

    let password = "";

    const used = new Set();

    while (password.length < lengthSlider.value) {

        const char = randomCharacter(charset);

        if (duplicates.checked) {

            if (used.has(char))
                continue;

            used.add(char);

        }

        password += char;

    }

    passwordBox.value = password;

    updateStatistics(password);

    updateStrength(password);

    updateHistory(password);

}

// ==========================================
// Generate Button
// ==========================================

generateBtn.addEventListener("click", generatePassword);

// ==========================================
// Copy Password
// ==========================================

copyBtn.addEventListener("click", () => {

    if (passwordBox.value === "")
        return;

    navigator.clipboard.writeText(passwordBox.value);

    showToast("Password Copied!");

});

// ==========================================
// Toast
// ==========================================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2000);

}

// ==========================================
// Generate First Password
// ==========================================

generatePassword();
// ==========================================
// PART 3B
// Password Strength + Statistics + Entropy
// ==========================================

// ---------- DOM ----------

const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const crackTime = document.getElementById("crackTime");

const statLength = document.getElementById("statLength");
const statUpper = document.getElementById("statUpper");
const statLower = document.getElementById("statLower");
const statNumber = document.getElementById("statNumber");
const statSymbol = document.getElementById("statSymbol");
const entropy = document.getElementById("entropy");

// ==========================================
// Password Statistics
// ==========================================

function updateStatistics(password) {

    let upper = 0;
    let lower = 0;
    let number = 0;
    let symbol = 0;

    for (const char of password) {

        if (upperChars.includes(char))
            upper++;

        else if (lowerChars.includes(char))
            lower++;

        else if (numberChars.includes(char))
            number++;

        else if (symbolChars.includes(char))
            symbol++;

    }

    statLength.textContent = password.length;
    statUpper.textContent = upper;
    statLower.textContent = lower;
    statNumber.textContent = number;
    statSymbol.textContent = symbol;

    calculateEntropy(password);

}

// ==========================================
// Entropy Calculation
// ==========================================

function calculateEntropy(password) {

    let pool = 0;

    if (uppercase.checked)
        pool += upperChars.length;

    if (lowercase.checked)
        pool += lowerChars.length;

    if (numbers.checked)
        pool += numberChars.length;

    if (symbols.checked)
        pool += symbolChars.length;

    const bits = Math.round(password.length * Math.log2(pool));

    entropy.textContent = bits + " bits";

    estimateCrackTime(bits);

}

// ==========================================
// Crack Time
// ==========================================

function estimateCrackTime(bits) {

    let text = "";

    if (bits < 30) {

        text = "Instantly";

    } else if (bits < 45) {

        text = "Few Minutes";

    } else if (bits < 60) {

        text = "Several Hours";

    } else if (bits < 75) {

        text = "Several Months";

    } else if (bits < 90) {

        text = "Hundreds of Years";

    } else if (bits < 110) {

        text = "Millions of Years";

    } else {

        text = "Practically Impossible";

    }

    crackTime.textContent = text;

}

// ==========================================
// Password Strength
// ==========================================

function updateStrength(password) {

    let score = 0;

    if (password.length >= 8)
        score++;

    if (password.length >= 12)
        score++;

    if (/[A-Z]/.test(password))
        score++;

    if (/[a-z]/.test(password))
        score++;

    if (/[0-9]/.test(password))
        score++;

    if (/[^A-Za-z0-9]/.test(password))
        score++;

    let width = 0;
    let color = "";
    let text = "";

    switch (score) {

        case 1:
        case 2:

            width = 20;
            color = "#FF4D4D";
            text = "Weak";
            break;

        case 3:

            width = 40;
            color = "#FF9800";
            text = "Fair";
            break;

        case 4:

            width = 65;
            color = "#F4B400";
            text = "Good";
            break;

        case 5:

            width = 85;
            color = "#00C896";
            text = "Strong";
            break;

        case 6:

            width = 100;
            color = "#00B894";
            text = "Very Strong";
            break;

        default:

            width = 10;
            color = "#FF4D4D";
            text = "Very Weak";

    }

    strengthFill.style.width = width + "%";
    strengthFill.style.background = color;

    strengthText.textContent = text;
    strengthText.style.color = color;

}
// ==========================================
// PART 3C
// History • Dark Mode • Export
// ==========================================

// ---------- DOM ----------

const historyList = document.getElementById("historyList");
const historyBtn = document.getElementById("historyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const themeBtn = document.getElementById("themeBtn");

// ==========================================
// PASSWORD HISTORY
// ==========================================

let history = JSON.parse(localStorage.getItem("passwordHistory")) || [];

function updateHistory(password) {

    history.unshift(password);

    if (history.length > 10) {

        history.pop();

    }

    localStorage.setItem(
        "passwordHistory",
        JSON.stringify(history)
    );

    renderHistory();

}

function renderHistory() {

    historyList.innerHTML = "";

    history.forEach(pass => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span>${pass}</span>
            <button class="history-copy">Copy</button>
        `;

        li.querySelector("button").addEventListener("click", () => {

            navigator.clipboard.writeText(pass);

            showToast("Copied from History!");

        });

        historyList.appendChild(li);

    });

}

renderHistory();

// ==========================================
// EXPORT HISTORY
// ==========================================

downloadBtn.addEventListener("click", () => {

    if (history.length === 0) {

        showToast("History is Empty");

        return;

    }

    const data = history.join("\n");

    const blob = new Blob([data], {

        type: "text/plain"

    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "password-history.txt";

    a.click();

    URL.revokeObjectURL(url);

});

// ==========================================
// DARK MODE
// ==========================================

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.innerHTML =
        `<i class="fa-solid fa-sun"></i>`;

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeBtn.innerHTML =
            `<i class="fa-solid fa-sun"></i>`;

    } else {

        localStorage.setItem("theme", "light");

        themeBtn.innerHTML =
            `<i class="fa-solid fa-moon"></i>`;

    }

});

// ==========================================
// AUTO GENERATE
// ==========================================

[
    uppercase,
    lowercase,
    numbers,
    symbols,
    similar,
    duplicates
].forEach(option => {

    option.addEventListener("change", generatePassword);

});

lengthSlider.addEventListener("input", generatePassword);

// ==========================================
// KEYBOARD SHORTCUT
// Ctrl + G
// ==========================================

document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.key === "g") {

        e.preventDefault();

        generatePassword();

    }

});

// ==========================================
// HISTORY BUTTON
// ==========================================

historyBtn.addEventListener("click", () => {

    document.querySelector(".history")
        .scrollIntoView({

            behavior: "smooth"

        });

});
// ==========================================
// PART 3D
// Professional Improvements
// ==========================================

// ------------------------------------------
// Shuffle Password
// ------------------------------------------

function shufflePassword(password) {

    const array = password.split("");

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];

    }

    return array.join("");

}

// ------------------------------------------
// Guarantee Every Selected Character Type
// ------------------------------------------

function generateSecurePassword() {

    let charset = "";
    let password = "";

    const selectedSets = [];

    if (uppercase.checked) {

        charset += upperChars;
        selectedSets.push(upperChars);

    }

    if (lowercase.checked) {

        charset += lowerChars;
        selectedSets.push(lowerChars);

    }

    if (numbers.checked) {

        charset += numberChars;
        selectedSets.push(numberChars);

    }

    if (symbols.checked) {

        charset += symbolChars;
        selectedSets.push(symbolChars);

    }

    if (similar.checked) {

        charset = removeSimilar(charset);

    }

    if (charset.length === 0) {

        showToast("Select at least one option.");

        return;

    }

    // Add one character from each selected category

    selectedSets.forEach(set => {

        password += randomCharacter(set);

    });

    const used = new Set(password);

    while (password.length < lengthSlider.value) {

        const char = randomCharacter(charset);

        if (duplicates.checked) {

            if (used.has(char))
                continue;

            used.add(char);

        }

        password += char;

    }

    password = shufflePassword(password);

    passwordBox.value = password;

    updateStatistics(password);

    updateStrength(password);

    updateHistory(password);

}

// Replace old generator

generateBtn.removeEventListener("click", generatePassword);

generateBtn.addEventListener("click", generateSecurePassword);

generateSecurePassword();

// ------------------------------------------
// Double Click to Copy
// ------------------------------------------

passwordBox.addEventListener("dblclick", () => {

    if (passwordBox.value === "") return;

    navigator.clipboard.writeText(passwordBox.value);

    showToast("Password Copied!");

});

// ------------------------------------------
// Show / Hide Password
// ------------------------------------------

const eyeButton = document.createElement("button");

eyeButton.id = "eyeBtn";

eyeButton.innerHTML = '<i class="fa-solid fa-eye"></i>';

passwordBox.parentElement.appendChild(eyeButton);

eyeButton.style.marginLeft = "10px";

eyeButton.addEventListener("click", () => {

    if (passwordBox.type === "password") {

        passwordBox.type = "text";

        eyeButton.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        passwordBox.type = "password";

        eyeButton.innerHTML = '<i class="fa-solid fa-eye"></i>';

    }

});

// Default hidden

passwordBox.type = "password";

// ------------------------------------------
// Prevent Impossible Duplicate Requests
// ------------------------------------------

lengthSlider.addEventListener("change", () => {

    if (!duplicates.checked)
        return;

    let available = "";

    if (uppercase.checked)
        available += upperChars;

    if (lowercase.checked)
        available += lowerChars;

    if (numbers.checked)
        available += numberChars;

    if (symbols.checked)
        available += symbolChars;

    if (similar.checked)
        available = removeSimilar(available);

    if (lengthSlider.value > available.length) {

        showToast("Length exceeds available unique characters");

        lengthSlider.value = available.length;

        lengthValue.textContent = available.length;

    }

});

// ------------------------------------------
// Password Quality Score
// ------------------------------------------

function passwordScore(password) {

    let score = 0;

    score += password.length * 4;

    if (/[A-Z]/.test(password))
        score += 10;

    if (/[a-z]/.test(password))
        score += 10;

    if (/[0-9]/.test(password))
        score += 10;

    if (/[^A-Za-z0-9]/.test(password))
        score += 20;

    return Math.min(score, 100);

}

// ------------------------------------------
// Console Welcome
// ------------------------------------------

console.log("%cSecurePass Pro", "color:#6C63FF;font-size:24px;font-weight:bold;");
console.log("%cBuilt by Sneha Bisht", "color:#00C896;font-size:16px;");