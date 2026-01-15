/**
 * Reading Log Module
 * BookTopia - Kalam Knowledge Club
 * Powered by Appwrite
 */

// ============================================
// Reading Log CRUD Operations
// ============================================

const { APPWRITE_CONFIG, AppwriteQuery, AppwriteID } = window;

/**
 * Add a new reading log entry
 * @param {string} userId - User ID
 * @param {string} logDate - Date of reading (YYYY-MM-DD)
 * @param {number} pagesRead - Number of pages read
 * @returns {Promise<object>} Created log entry
 */
async function addReadingLog(userId, logDate, pagesRead) {
    const { databases } = window;

    // Validate date is within allowed range (today to 3 days ago)
    if (!isDateInRange(logDate, 3)) {
        throw new Error('You can only log entries for today or the past 3 days');
    }

    // Validate pages
    if (pagesRead < 1 || pagesRead > 1000) {
        throw new Error('Pages must be between 1 and 1000');
    }

    // Check for existing entry on this date
    // Note: Appwrite doesn't support multi-field unique constraints natively in same way as SQL
    // so we must check manually before insert.
    const existingLog = await getLogByDate(userId, logDate);
    if (existingLog) {
        throw new Error('You already have an entry for this date. Please edit it instead.');
    }

    try {
        const response = await databases.createDocument(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_READING_LOGS,
            AppwriteID.unique(),
            {
                user_id: userId,
                log_date: logDate,
                pages_read: parseInt(pagesRead) // Ensure integer
            }
        );
        return response;
    } catch (error) {
        console.error("Add Log Error:", error);
        throw error;
    }
}

/**
 * Get reading log by date
 * @param {string} userId - User ID
 * @param {string} logDate - Date to check (YYYY-MM-DD)
 * @returns {Promise<object|null>} Log entry or null
 */
async function getLogByDate(userId, logDate) {
    const { databases } = window;

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_READING_LOGS,
            [
                AppwriteQuery.equal('user_id', userId),
                AppwriteQuery.equal('log_date', logDate)
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0];
        }
        return null;
    } catch (error) {
        // If collection doesn't exist yet, return null
        return null;
    }
}

/**
 * Get all reading logs for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of entries (default: 50)
 * @returns {Promise<array>} Array of log entries
 */
async function getUserLogs(userId, limit = 50) {
    const { databases } = window;

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_READING_LOGS,
            [
                AppwriteQuery.equal('user_id', userId),
                AppwriteQuery.orderDesc('log_date'),
                AppwriteQuery.limit(limit)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error("Get Logs Error:", error);
        return [];
    }
}

/**
 * Get reading logs for current month
 * @param {string} userId - User ID
 * @returns {Promise<array>} Array of log entries
 */
async function getCurrentMonthLogs(userId) {
    const { databases } = window;

    const monthStart = getMonthStart();
    const startDate = formatDateForInput(monthStart);
    const endDate = getToday();

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_READING_LOGS,
            [
                AppwriteQuery.equal('user_id', userId),
                AppwriteQuery.greaterThanEqual('log_date', startDate),
                AppwriteQuery.lessThanEqual('log_date', endDate),
                AppwriteQuery.orderDesc('log_date')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error("Get Month Logs Error:", error);
        return [];
    }
}

/**
 * Update a reading log entry
 * @param {string} logId - Log entry ID (Document ID)
 * @param {number} pagesRead - New pages count
 * @returns {Promise<object>} Updated log entry
 */
async function updateReadingLog(logId, pagesRead) {
    const { databases } = window;

    // Validate pages
    if (pagesRead < 1 || pagesRead > 1000) {
        throw new Error('Pages must be between 1 and 1000');
    }

    try {
        const response = await databases.updateDocument(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_READING_LOGS,
            logId,
            {
                pages_read: parseInt(pagesRead)
            }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Delete a reading log entry
 * @param {string} logId - Log entry ID
 * @returns {Promise<void>}
 */
async function deleteReadingLog(logId) {
    const { databases } = window;

    try {
        await databases.deleteDocument(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_READING_LOGS,
            logId
        );
    } catch (error) {
        throw error;
    }
}

// ============================================
// Statistics Calculation
// ============================================
// (Logic remains same as before, no backend calls here)

function calculateStats(logs) {
    if (!logs || logs.length === 0) {
        return {
            totalPages: 0,
            daysLogged: 0,
            avgPages: 0,
            currentStreak: 0,
            longestStreak: 0
        };
    }

    const totalPages = logs.reduce((sum, log) => sum + log.pages_read, 0);
    const daysLogged = logs.length;
    const avgPages = Math.round(totalPages / daysLogged);
    const { currentStreak, longestStreak } = calculateStreaks(logs);

    return {
        totalPages,
        daysLogged,
        avgPages,
        currentStreak,
        longestStreak
    };
}

function calculateStreaks(logs) {
    if (!logs || logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }
    const sortedLogs = [...logs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
    const loggedDates = new Set(sortedLogs.map(log => log.log_date));

    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    const todayStr = formatDateForInput(checkDate);
    if (!loggedDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
        const dateStr = formatDateForInput(checkDate);
        if (loggedDates.has(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;
    for (const log of sortedLogs) {
        const currentDate = new Date(log.log_date);
        currentDate.setHours(0, 0, 0, 0);
        if (prevDate) {
            const dayDiff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        } else {
            tempStreak = 1;
        }
        prevDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    return { currentStreak, longestStreak };
}

// ============================================
// Leaderboard
// ============================================

async function getLeaderboard(limit = 10) {
    const { databases } = window;
    const monthStart = getMonthStart();
    const startDate = formatDateForInput(monthStart);

    // Appwrite doesn't support complex joins or aggregation like SQL
    // We have to fetch logs and aggregate manually
    try {
        // Fetch all logs for this month
        // Warning: This could be slow with many users, ideally we need backend function or aggregation attribute
        // For MVP, limit to 100 recent adds or just fetch all (paginated)
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_READING_LOGS,
            [
                AppwriteQuery.greaterThanEqual('log_date', startDate),
                AppwriteQuery.limit(100)
            ]
        );

        const logs = response.documents;
        const userTotals = {};

        // We also need user profiles for names
        // Ideally we would fetch them in batches or have them embedded
        // For MVP, let's fetch profile when we aggregate

        for (const log of logs) {
            if (!userTotals[log.user_id]) {
                userTotals[log.user_id] = {
                    userId: log.user_id,
                    totalPages: 0
                };
            }
            userTotals[log.user_id].totalPages += log.pages_read;
        }

        // Convert to array
        let leaderboard = Object.values(userTotals)
            .sort((a, b) => b.totalPages - a.totalPages)
            .slice(0, limit);

        // Fetch profiles for these users
        for (const entry of leaderboard) {
            const profile = await getProfile(entry.userId); // Imported from auth.js implicitly or via window
            // Since this module doesn't import auth.js directly, we assume getProfile is globally available or we duplicate logic
            // Better: Use databases directly here
            if (profile) {
                entry.username = profile.username;
                entry.avatarUrl = profile.avatar_url;
            } else {
                entry.username = 'Unknown User';
            }
        }

        return leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

    } catch (error) {
        console.error("Leaderboard Error:", error);
        return [];
    }
}

async function getUserRank(userId) {
    const leaderboard = await getLeaderboard(50);
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    return userEntry ? userEntry.rank : 0;
}
