/**
 * Utility Functions
 * BookTopia - Kalam Knowledge Club
 */

// ============================================
// Toast Notification System
// ============================================

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// Date Utilities
// ============================================

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date to human readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Human readable date
 */
function formatDateReadable(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get today's date as YYYY-MM-DD
 * @returns {string} Today's date formatted
 */
function getToday() {
    return formatDateForInput(new Date());
}

/**
 * Get date N days ago as YYYY-MM-DD
 * @param {number} days - Number of days ago
 * @returns {string} Date formatted
 */
function getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDateForInput(date);
}

/**
 * Check if a date is within allowed range (today to N days ago)
 * @param {string} dateString - Date to check (YYYY-MM-DD)
 * @param {number} daysBack - Maximum days back allowed
 * @returns {boolean} Whether date is valid
 */
function isDateInRange(dateString, daysBack = 3) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(dateString);
    checkDate.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - daysBack);

    return checkDate >= minDate && checkDate <= today;
}

/**
 * Get the start of the current month
 * @returns {Date} First day of current month
 */
function getMonthStart() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Calculate days passed in current month
 * @returns {number} Number of days passed
 */
function getDaysPassedThisMonth() {
    return new Date().getDate();
}

// ============================================
// Form Validation
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
function validatePassword(password) {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[a-zA-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: 'Password is strong' };
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} Validation result with isValid and message
 */
function validateUsername(username) {
    if (username.length < 3) {
        return { isValid: false, message: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
        return { isValid: false, message: 'Username must be at most 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { isValid: true, message: 'Username is valid' };
}

// ============================================
// Loading State Management
// ============================================

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Set button loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Whether to show loading state
 * @param {string} originalText - Original button text (for restoration)
 */
function setButtonLoading(button, isLoading, originalText = 'Submit') {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></span>';
    } else {
        button.disabled = false;
        button.textContent = originalText;
    }
}

// ============================================
// Number Formatting
// ============================================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Format number as ordinal (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to format
 * @returns {string} Ordinal string
 */
function formatOrdinal(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// ============================================
// Reading Tips
// ============================================

const readingTips = [
    "Set a specific time each day for reading. Morning routines work great!",
    "Keep your book visible - on your desk, nightstand, or bag.",
    "Start with just 10 pages a day. Small steps lead to big progress!",
    "Create a cozy reading corner to make reading more enjoyable.",
    "Try audiobooks during commutes to maximize reading time.",
    "Join a reading buddy - it keeps you accountable!",
    "Track your progress daily - it's motivating to see your growth.",
    "Mix different genres to keep things interesting.",
    "Set realistic goals and celebrate small wins!",
    "Put your phone in another room while reading.",
    "Reading before bed can help you sleep better.",
    "Carry a book everywhere - you never know when you'll have time!",
    "Highlight and take notes to engage more with what you read.",
    "Don't be afraid to abandon a book that doesn't interest you.",
    "Discuss what you read with friends to deepen understanding."
];

/**
 * Get a random reading tip
 * @returns {string} Random tip
 */
function getRandomTip() {
    return readingTips[Math.floor(Math.random() * readingTips.length)];
}

// ============================================
// Debounce Utility
// ============================================

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// URL Utilities
// ============================================

/**
 * Get URL query parameter
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Get current page name from URL
 * @returns {string} Current page name without extension
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'index';
}
