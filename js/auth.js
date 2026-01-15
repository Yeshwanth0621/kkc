/**
 * Authentication Module
 * BookTopia - Kalam Knowledge Club
 * Powered by Appwrite
 */

// ============================================
// Auth State Management
// ============================================

/**
 * Check if user is authenticated
 * @returns {Promise<object|null>} User object or null
 */
async function checkAuth() {
    try {
        const user = await window.appwriteAccount.get();
        return user;
    } catch (error) {
        return null; // Not authenticated
    }
}

/**
 * Get current session
 * @returns {Promise<object|null>} Session info or null
 */
async function getSession() {
    try {
        return await window.appwriteAccount.getSession('current');
    } catch (error) {
        return null;
    }
}

// ============================================
// Sign Up
// ============================================

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} profileData - Profile data (username, registerNumber, avatarFile)
 * @returns {Promise<object>} User object
 */
async function signUp(email, password, profileData) {
    // 1. Check Username Availability
    const isAvailable = await checkUsernameAvailability(profileData.username);
    if (!isAvailable) {
        throw new Error('Username is already taken');
    }

    try {
        // 2. Create Account
        // ID.unique() generates a unique ID for the user
        const user = await window.appwriteAccount.create(
            window.AppwriteID.unique(),
            email,
            password,
            profileData.username // Use username as name initially
        );

        // 3. Create Session (Login immediately to create profile)
        await window.appwriteAccount.createEmailPasswordSession(email, password);

        // 4. Create Profile Document
        // Note: In Appwrite, we need to create the profile document manually since we don't have triggers yet
        let avatarUrl = null;
        if (profileData.avatarFile) {
            try {
                // We'll implement upload logic later or skip for MVP
                avatarUrl = await uploadAvatar(user.$id, profileData.avatarFile);
            } catch (e) {
                console.warn('Avatar upload failed:', e);
            }
        }

        await createProfile(user.$id, {
            username: profileData.username,
            registerNumber: profileData.registerNumber,
            avatarUrl,
            email: email
        });

        return user;
    } catch (error) {
        console.error("Signup Error:", error);
        throw error;
    }
}

// ============================================
// Sign In
// ============================================

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object
 */
async function signIn(email, password) {
    try {
        await window.appwriteAccount.createEmailPasswordSession(email, password);
        return await window.appwriteAccount.get();
    } catch (error) {
        throw error;
    }
}

/**
 * Sign in with Google OAuth
 */
async function signInWithGoogle() {
    try {
        window.appwriteAccount.createOAuth2Session(
            'google',
            window.location.origin + '/dashboard.html', // Success
            window.location.origin + '/signin.html'    // Failure
        );
    } catch (error) {
        throw error;
    }
}

// ============================================
// Password Reset
// ============================================

async function resetPassword(email) {
    try {
        await window.appwriteAccount.createRecovery(
            email,
            window.location.origin + '/reset-password.html'
        );
    } catch (error) {
        throw error;
    }
}

// ============================================
// Sign Out
// ============================================

async function signOut() {
    try {
        await window.appwriteAccount.deleteSession('current');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Signout failed", error);
        window.location.href = 'index.html';
    }
}

// ============================================
// Profile Management (Database)
// ============================================

async function getProfile(userId) {
    const { databases, APPWRITE_CONFIG, AppwriteQuery } = window;

    try {
        // Try simple get first if ID matches
        // But profiles might be stored with custom IDs or mapped.
        // Let's assume Profile ID = User ID for simplicity if we can set it,
        // otherwise we query by user_id field.

        // Strategy: Query 'profiles' collection where user_id (or $id) matches
        // Assuming we store profile with document ID = User ID
        try {
            return await databases.getDocument(
                APPWRITE_CONFIG.DB_ID,
                APPWRITE_CONFIG.COLLECTION_PROFILES,
                userId
            );
        } catch (e) {
            // If not found by ID, try query just in case schema differs
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.DB_ID,
                APPWRITE_CONFIG.COLLECTION_PROFILES,
                [AppwriteQuery.equal('user_id', userId)]
            );
            if (response.documents.length > 0) return response.documents[0];
            return null;
        }
    } catch (error) {
        return null;
    }
}

async function createProfile(userId, profileData) {
    const { databases, APPWRITE_CONFIG } = window;

    return await databases.createDocument(
        APPWRITE_CONFIG.DB_ID,
        APPWRITE_CONFIG.COLLECTION_PROFILES,
        userId, // Use User ID as Document ID for easy retrieval
        {
            username: profileData.username,
            register_number: profileData.registerNumber,
            avatar_url: profileData.avatarUrl,
            user_id: userId,
            created_at: new Date().toISOString()
        }
    );
}

async function updateProfile(userId, updates) {
    const { databases, APPWRITE_CONFIG } = window;

    return await databases.updateDocument(
        APPWRITE_CONFIG.DB_ID,
        APPWRITE_CONFIG.COLLECTION_PROFILES,
        userId,
        updates
    );
}

async function checkUsernameAvailability(username) {
    const { databases, APPWRITE_CONFIG, AppwriteQuery } = window;

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DB_ID,
            APPWRITE_CONFIG.COLLECTION_PROFILES,
            [AppwriteQuery.equal('username', username)]
        );
        return response.total === 0;
    } catch (error) {
        // If DB doesn't exist yet, assume available or error out safely
        console.warn("Username check failed (DB might be missing):", error);
        return true;
    }
}

// ============================================
// Avatar Upload (Storage)
// ============================================

async function uploadAvatar(userId, file) {
    const { storage, ID } = window;
    const BUCKET_ID = 'avatars'; // Need to create this bucket

    try {
        const result = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
        );

        // Get View URL
        const resultUrl = storage.getFileView(BUCKET_ID, result.$id);
        return resultUrl.href;
    } catch (error) {
        console.error("Avatar upload failed:", error);
        return null;
    }
}

// Listeners helper (not used much in Appwrite web SDK same way as Supabase but we can mock it)
function onAuthStateChange(callback) {
    // Appwrite doesn't have a direct global listener for session changes in the same way 
    // without realtime subscription to account, but for simple MVP we might skip or poll.
    // For now, let's just return a dummy unsubscribe.
    return { unsubscribe: () => { } };
}
