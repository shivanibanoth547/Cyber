/**
 * Validates an email address format.
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validates password strength.
 * Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char.
 */
function isStrongPassword(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
}

/**
 * Sanitizes a string to prevent injection.
 */
function sanitizeString(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[<>&"']/g, (char) => {
        const map = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" };
        return map[char];
    });
}

module.exports = { isValidEmail, isStrongPassword, sanitizeString };
