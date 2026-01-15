/**
 * Reading Log Module
 * BookTopia - Kalam Knowledge Club
 */

// ============================================
// Reading Log CRUD Operations
// ============================================

/**
 * Add a new reading log entry
 * @param {string} userId - User ID
 * @param {string} logDate - Date of reading (YYYY-MM-DD)
 * @param {number} pagesRead - Number of pages read
 * @returns {Promise<object>} Created log entry
 */
async function addReadingLog(userId, logDate, pagesRead) {
    const client = await getSupabase();

    // Validate date is within allowed range (today to 3 days ago)
    if (!isDateInRange(logDate, 3)) {
        throw new Error('You can only log entries for today or the past 3 days');
    }

    // Validate pages
    if (pagesRead < 1 || pagesRead > 1000) {
        throw new Error('Pages must be between 1 and 1000');
    }

    // Check for existing entry on this date
    const existingLog = await getLogByDate(userId, logDate);
    if (existingLog) {
        throw new Error('You already have an entry for this date. Please edit it instead.');
    }

    // Insert the log
    const { data, error } = await client
        .from('reading_logs')
        .insert({
            user_id: userId,
            log_date: logDate,
            pages_read: pagesRead
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error('You already have an entry for this date');
        }
        throw error;
    }

    return data;
}

/**
 * Get reading log by date
 * @param {string} userId - User ID
 * @param {string} logDate - Date to check (YYYY-MM-DD)
 * @returns {Promise<object|null>} Log entry or null
 */
async function getLogByDate(userId, logDate) {
    const client = await getSupabase();

    const { data, error } = await client
        .from('reading_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', logDate)
        .maybeSingle();

    if (error) {
        console.error('Error fetching log:', error);
        return null;
    }

    return data;
}

/**
 * Get all reading logs for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of entries (default: 50)
 * @returns {Promise<array>} Array of log entries
 */
async function getUserLogs(userId, limit = 50) {
    const client = await getSupabase();

    const { data, error } = await client
        .from('reading_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching logs:', error);
        return [];
    }

    return data || [];
}

/**
 * Get reading logs for current month
 * @param {string} userId - User ID
 * @returns {Promise<array>} Array of log entries
 */
async function getCurrentMonthLogs(userId) {
    const client = await getSupabase();

    const monthStart = getMonthStart();
    const startDate = formatDateForInput(monthStart);
    const endDate = getToday();

    const { data, error } = await client
        .from('reading_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: false });

    if (error) {
        console.error('Error fetching month logs:', error);
        return [];
    }

    return data || [];
}

/**
 * Update a reading log entry
 * @param {string} logId - Log entry ID
 * @param {number} pagesRead - New pages count
 * @returns {Promise<object>} Updated log entry
 */
async function updateReadingLog(logId, pagesRead) {
    const client = await getSupabase();

    // Validate pages
    if (pagesRead < 1 || pagesRead > 1000) {
        throw new Error('Pages must be between 1 and 1000');
    }

    const { data, error } = await client
        .from('reading_logs')
        .update({
            pages_read: pagesRead,
            updated_at: new Date().toISOString()
        })
        .eq('id', logId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Delete a reading log entry
 * @param {string} logId - Log entry ID
 * @returns {Promise<void>}
 */
async function deleteReadingLog(logId) {
    const client = await getSupabase();

    const { error } = await client
        .from('reading_logs')
        .delete()
        .eq('id', logId);

    if (error) {
        throw error;
    }
}

// ============================================
// Statistics Calculation
// ============================================

/**
 * Calculate user reading statistics
 * @param {array} logs - Array of reading log entries
 * @returns {object} Statistics object
 */
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

    // Total pages
    const totalPages = logs.reduce((sum, log) => sum + log.pages_read, 0);

    // Days logged
    const daysLogged = logs.length;

    // Average pages per day
    const avgPages = Math.round(totalPages / daysLogged);

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(logs);

    return {
        totalPages,
        daysLogged,
        avgPages,
        currentStreak,
        longestStreak
    };
}

/**
 * Calculate reading streaks
 * @param {array} logs - Array of reading log entries (sorted by date descending)
 * @returns {object} Current and longest streak
 */
function calculateStreaks(logs) {
    if (!logs || logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Sort logs by date ascending for streak calculation
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(a.log_date) - new Date(b.log_date)
    );

    // Create a set of logged dates for quick lookup
    const loggedDates = new Set(sortedLogs.map(log => log.log_date));

    // Calculate current streak (counting back from today)
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Check if today has an entry, if not check yesterday
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

    // Calculate longest streak
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

/**
 * Get leaderboard data
 * @param {number} limit - Maximum number of entries (default: 10)
 * @returns {Promise<array>} Array of leaderboard entries
 */
async function getLeaderboard(limit = 10) {
    const client = await getSupabase();

    // Get month start date
    const monthStart = getMonthStart();
    const startDate = formatDateForInput(monthStart);

    // Get total pages per user for the current month
    const { data, error } = await client
        .from('reading_logs')
        .select(`
            user_id,
            pages_read,
            profiles!inner (
                username,
                avatar_url
            )
        `)
        .gte('log_date', startDate);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    if (!data || data.length === 0) {
        return [];
    }

    // Aggregate pages by user
    const userTotals = {};
    for (const entry of data) {
        const userId = entry.user_id;
        if (!userTotals[userId]) {
            userTotals[userId] = {
                userId,
                username: entry.profiles.username,
                avatarUrl: entry.profiles.avatar_url,
                totalPages: 0
            };
        }
        userTotals[userId].totalPages += entry.pages_read;
    }

    // Convert to array and sort by total pages
    const leaderboard = Object.values(userTotals)
        .sort((a, b) => b.totalPages - a.totalPages)
        .slice(0, limit)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

    return leaderboard;
}

/**
 * Get user's rank in the leaderboard
 * @param {string} userId - User ID
 * @returns {Promise<number>} User's rank (0 if not ranked)
 */
async function getUserRank(userId) {
    const leaderboard = await getLeaderboard(100); // Get more entries to find rank

    const userEntry = leaderboard.find(entry => entry.userId === userId);
    return userEntry ? userEntry.rank : 0;
}
