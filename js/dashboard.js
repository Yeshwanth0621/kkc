/**
 * Dashboard Module
 * BookTopia - Kalam Knowledge Club
 */

// ============================================
// Dashboard State
// ============================================

let currentUser = null;
let currentProfile = null;
let userLogs = [];

// ============================================
// Initialize Dashboard
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    // Wait for Supabase to be ready
    await waitForSupabase();

    // Check authentication
    currentUser = await checkAuth();

    if (!currentUser) {
        window.location.href = 'signin.html';
        return;
    }

    // Get user profile with retry (in case trigger is slow)
    currentProfile = await getProfile(currentUser.id);
    // Get user profile - In Appwrite auth user object is distinct from profile doc
    // currentUser is the Account object. We need to fetch the custom profile doc.
    const profile = await getProfile(currentUser.$id);

    // If no custom profile found, redirect to setup
    // Note: Appwrite creates user on signup but maybe not profile doc if custom logic failed
    if (!profile) {
        window.location.href = 'profile-setup.html';
        return;
    }

    currentProfile = profile; // Set global

    // Initialize the dashboard
    await initDashboard();

    // Hide loading overlay
    hideLoading();

    // Setup event listeners
    setupEventListeners();

    // Set daily tip
    const tipEl = document.getElementById('dailyTip');
    if (tipEl) {
        tipEl.textContent = getRandomTip();
    }
});

/**
 * Initialize dashboard with user data
 */
async function initDashboard() {
    // Update UI with profile info
    updateProfileUI();

    // Fetch and display logs
    await refreshLogs();

    // Fetch and display leaderboard
    await refreshLeaderboard();

    // Update progress visualization
    updateProgress();

    // Set date picker default and constraints
    setupDatePicker();
}

/**
 * Update UI with profile information
 */
function updateProfileUI() {
    // Nav avatar and username
    const navAvatar = document.getElementById('navAvatar');
    const navUsername = document.getElementById('navUsername');
    if (navAvatar) navAvatar.src = currentProfile.avatar_url || 'assets/default-avatar.svg';
    if (navUsername) navUsername.textContent = currentProfile.username;

    // Header avatar and info
    const headerAvatar = document.getElementById('headerAvatar');
    const welcomeText = document.getElementById('welcomeText');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const registerDisplay = document.getElementById('registerDisplay');

    if (headerAvatar) headerAvatar.src = currentProfile.avatar_url || 'assets/default-avatar.svg';
    if (welcomeText) welcomeText.textContent = `Welcome back, ${currentProfile.username}!`;
    if (usernameDisplay) usernameDisplay.textContent = currentProfile.username;
    if (registerDisplay) registerDisplay.textContent = currentProfile.register_number;
}

/**
 * Setup date picker with defaults and constraints
 */
function setupDatePicker() {
    const datePicker = document.getElementById('logDate');
    if (!datePicker) return;

    const today = getToday();
    const minDate = getDaysAgo(3);

    datePicker.value = today;
    datePicker.max = today;
    datePicker.min = minDate;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                await signOut();
            } catch (error) {
                showToast('Failed to sign out', 'error');
            }
        });
    }

    // Reading log form
    const logForm = document.getElementById('logForm');
    if (logForm) {
        logForm.addEventListener('submit', handleLogSubmit);
    }

    // Edit form
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }

    // Cancel edit button
    const cancelEdit = document.getElementById('cancelEdit');
    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeEditModal);
    }

    // Close modal on background click
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }
}

// ============================================
// Log Form Handling
// ============================================

async function handleLogSubmit(e) {
    e.preventDefault();

    const pagesInput = document.getElementById('pagesRead');
    const dateInput = document.getElementById('logDate');
    const logBtn = document.getElementById('logBtn');

    const pages = parseInt(pagesInput.value);
    const logDate = dateInput.value;

    if (!pages || pages < 1) {
        showToast('Please enter a valid number of pages', 'error');
        return;
    }

    // Set loading state
    logBtn.disabled = true;
    logBtn.innerHTML = '<span class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>';

    try {
        await addReadingLog(currentUser.$id, logDate, pages);
        showToast(`Logged ${pages} pages for ${formatDateReadable(logDate)}!`, 'success');

        // Reset form
        pagesInput.value = '';
        dateInput.value = getToday();

        // Refresh data
        await refreshLogs();
        await refreshLeaderboard();
        updateProgress();

    } catch (error) {
        showToast(error.message || 'Failed to add log', 'error');
    } finally {
        logBtn.disabled = false;
        logBtn.textContent = 'Add Entry';
    }
}

// ============================================
// Reading Logs Display
// ============================================

async function refreshLogs() {
    userLogs = await getUserLogs(currentUser.$id);

    // Calculate and display stats
    const stats = calculateStats(userLogs);
    updateStatsDisplay(stats);

    // Update streak badge
    updateStreakBadge(stats.currentStreak);

    // Display history table
    displayReadingHistory(userLogs);
}

function updateStatsDisplay(stats) {
    const totalPagesEl = document.getElementById('totalPages');
    const daysLoggedEl = document.getElementById('daysLogged');
    const avgPagesEl = document.getElementById('avgPages');

    if (totalPagesEl) totalPagesEl.textContent = formatNumber(stats.totalPages);
    if (daysLoggedEl) daysLoggedEl.textContent = stats.daysLogged;
    if (avgPagesEl) avgPagesEl.textContent = stats.avgPages;
}

function updateStreakBadge(streak) {
    const streakBadge = document.getElementById('streakBadge');
    const streakCount = document.getElementById('streakCount');

    if (!streakBadge || !streakCount) return;

    streakCount.textContent = streak;

    if (streak > 0) {
        streakBadge.classList.remove('inactive');
    } else {
        streakBadge.classList.add('inactive');
    }
}

function displayReadingHistory(logs) {
    const historyBody = document.getElementById('historyBody');
    const historyWrapper = document.getElementById('historyWrapper');
    const emptyHistory = document.getElementById('emptyHistory');

    if (!historyBody) return;

    if (logs.length === 0) {
        historyWrapper.classList.add('hidden');
        emptyHistory.classList.remove('hidden');
        return;
    }

    historyWrapper.classList.remove('hidden');
    emptyHistory.classList.add('hidden');

    historyBody.innerHTML = logs.map(log => `
        <tr>
            <td>${formatDateReadable(log.log_date)}</td>
            <td><strong>${log.pages_read}</strong> pages</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-ghost btn-sm" onclick="openEditModal('${log.id}', ${log.pages_read})" title="Edit">
                        ✏️
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="confirmDeleteLog('${log.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// Edit Modal
// ============================================

function openEditModal(logId, currentPages) {
    const modal = document.getElementById('editModal');
    const editLogId = document.getElementById('editLogId');
    const editPages = document.getElementById('editPages');

    if (modal && editLogId && editPages) {
        editLogId.value = logId;
        editPages.value = currentPages;
        modal.classList.remove('hidden');
        editPages.focus();
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();

    const logId = document.getElementById('editLogId').value;
    const pages = parseInt(document.getElementById('editPages').value);

    if (!pages || pages < 1) {
        showToast('Please enter a valid number of pages', 'error');
        return;
    }

    try {
        await updateReadingLog(logId, pages);
        showToast('Log updated successfully!', 'success');
        closeEditModal();

        // Refresh data
        await refreshLogs();
        await refreshLeaderboard();

    } catch (error) {
        showToast(error.message || 'Failed to update log', 'error');
    }
}

// ============================================
// Delete Log
// ============================================

async function confirmDeleteLog(logId) {
    if (confirm('Are you sure you want to delete this reading log?')) {
        try {
            await deleteReadingLog(logId);
            showToast('Log deleted successfully', 'success');

            // Refresh data
            await refreshLogs();
            await refreshLeaderboard();
            updateProgress();

        } catch (error) {
            showToast(error.message || 'Failed to delete log', 'error');
        }
    }
}

// ============================================
// Leaderboard
// ============================================

async function refreshLeaderboard() {
    const leaderboard = await getLeaderboard(10);
    displayLeaderboard(leaderboard);

    // Update user rank
    const rank = await getUserRank(currentUser.$id);
    const rankEl = document.getElementById('userRank');
    if (rankEl) {
        rankEl.textContent = rank > 0 ? `#${rank}` : '#-';
    }
}

function displayLeaderboard(leaderboard) {
    const leaderboardList = document.getElementById('leaderboardList');
    const emptyLeaderboard = document.getElementById('emptyLeaderboard');

    if (!leaderboardList) return;

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '';
        emptyLeaderboard.classList.remove('hidden');
        return;
    }

    emptyLeaderboard.classList.add('hidden');

    leaderboardList.innerHTML = leaderboard.map(entry => {
        let rankClass = '';
        if (entry.rank === 1) rankClass = 'gold';
        else if (entry.rank === 2) rankClass = 'silver';
        else if (entry.rank === 3) rankClass = 'bronze';

        const isCurrentUser = entry.userId === currentUser.$id;

        return `
            <div class="leaderboard-item" style="${isCurrentUser ? 'background: var(--gradient-glow);' : ''}">
                <div class="leaderboard-rank ${rankClass}">${entry.rank}</div>
                <div class="leaderboard-user">
                    <img src="${entry.avatarUrl || 'assets/default-avatar.svg'}" alt="${entry.username}" class="avatar avatar-sm">
                    <span>${entry.username}${isCurrentUser ? ' (You)' : ''}</span>
                </div>
                <div class="leaderboard-pages">${formatNumber(entry.totalPages)} pages</div>
            </div>
        `;
    }).join('');
}

// ============================================
// Progress Visualization
// ============================================

function updateProgress() {
    const daysPassed = getDaysPassedThisMonth();
    const daysWithLogs = new Set(userLogs.map(log => log.log_date)).size;

    // Calculate progress percentage (days logged / days passed)
    const progressPercent = daysPassed > 0 ? Math.round((daysWithLogs / daysPassed) * 100) : 0;

    // Update progress ring
    const progressCircle = document.getElementById('progressCircle');
    const progressPercentEl = document.getElementById('progressPercent');
    const daysPassedEl = document.getElementById('daysPassed');

    if (progressCircle) {
        // Circle circumference is 2 * PI * radius = 2 * 3.14159 * 65 ≈ 408.4
        const circumference = 408.4;
        const offset = circumference - (progressPercent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }

    if (progressPercentEl) {
        progressPercentEl.textContent = `${progressPercent}%`;
    }

    if (daysPassedEl) {
        daysPassedEl.textContent = daysPassed;
    }
}
