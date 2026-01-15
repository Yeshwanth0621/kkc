/**
 * Authentication Module
 * BookTopia - Kalam Knowledge Club
 */

// ============================================
// Auth State Management
// ============================================

/**
 * Check if user is authenticated
 * @returns {Promise<object|null>} User object or null
 */
async function checkAuth() {
    const client = await getSupabase();
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

/**
 * Get current session
 * @returns {Promise<object|null>} Session object or null
 */
async function getSession() {
    const client = await getSupabase();
    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session) {
        return null;
    }

    return session;
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
    const client = await getSupabase();

    // First, check if username is available
    const isAvailable = await checkUsernameAvailability(profileData.username);
    if (!isAvailable) {
        throw new Error('Username is already taken');
    }

    // Sign up the user
    // We pass profile data in 'options.data' so the database trigger can pick it up
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: profileData.username,
                register_number: profileData.registerNumber,
                full_name: profileData.username, // Fallback
            }
        }
    });

    if (error) {
        throw error;
    }

    if (!data.user) {
        throw new Error('Failed to create account');
    }

    // Note: Profile creation is now handled by the 'on_auth_user_created' database trigger.
    // We do NOT manually insert into 'profiles' here to avoid race conditions and RLS issues.

    // Upload avatar if provided - doing this AFTER auth might be tricky if RLS requires profile
    // But usually storage RLS depends on auth.uid() which exists now.
    // However, for a smoother flow, we might want to do this after they log in or just warn if it fails.
    if (profileData.avatarFile && data.user) {
        try {
            // Slight delay to ensure trigger has run if we needed profile rows (but storage usually just needs auth)
            // Actually, we can just try to upload.
            const avatarUrl = await uploadAvatar(data.user.id, profileData.avatarFile);

            // If upload succeeds, we might want to update the profile with the URL
            // But we can't do that if the user isn't "logged in" fully yet (if email confirmation is on).
            // So for now, we'll skip immediate avatar update if email confirmation is required.
            // Ideally, avatar upload should happen on the 'Complete Profile' step or dashboard.

            // If email confirmation is NOT required, we could try updating:
            if (data.session) {
                await updateProfile(data.user.id, { avatarUrl });
            }
        } catch (e) {
            console.warn('Failed to upload avatar during signup (can be done later):', e);
        }
    }

    return data.user;
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
    const client = await getSupabase();

    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw error;
    }

    return data.user;
}

/**
 * Sign in with Google OAuth
 * @returns {Promise<void>}
 */
async function signInWithGoogle() {
    const client = await getSupabase();

    const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/profile-setup.html'
        }
    });

    if (error) {
        throw error;
    }
}

// ============================================
// Password Reset
// ============================================

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
async function resetPassword(email) {
    const client = await getSupabase();

    const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/signin.html'
    });

    if (error) {
        throw error;
    }
}

// ============================================
// Sign Out
// ============================================

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
async function signOut() {
    const client = await getSupabase();

    const { error } = await client.auth.signOut();

    if (error) {
        throw error;
    }

    window.location.href = 'index.html';
}

// ============================================
// Profile Management
// ============================================

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Profile object or null
 */
async function getProfile(userId) {
    const client = await getSupabase();

    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No profile found
            return null;
        }
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

/**
 * Create user profile
 * @param {string} userId - User ID
 * @param {object} profileData - Profile data
 * @returns {Promise<object>} Created profile
 */
async function createProfile(userId, profileData) {
    const client = await getSupabase();

    const { data, error } = await client
        .from('profiles')
        .upsert({
            id: userId,
            username: profileData.username,
            register_number: profileData.registerNumber,
            avatar_url: profileData.avatarUrl,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated profile
 */
async function updateProfile(userId, updates) {
    const client = await getSupabase();

    const updateData = {
        updated_at: new Date().toISOString()
    };

    if (updates.username) updateData.username = updates.username;
    if (updates.registerNumber) updateData.register_number = updates.registerNumber;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

    const { data, error } = await client
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// ============================================
// Username Availability
// ============================================

/**
 * Check if username is available
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} Whether username is available
 */
async function checkUsernameAvailability(username) {
    const client = await getSupabase();

    const { data, error } = await client
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .maybeSingle();

    if (error) {
        console.error('Error checking username:', error);
        return false;
    }

    return data === null;
}

// ============================================
// Avatar Upload
// ============================================

/**
 * Upload avatar to Supabase storage
 * @param {string} userId - User ID
 * @param {File} file - Image file
 * @returns {Promise<string>} Public URL of uploaded avatar
 */
async function uploadAvatar(userId, file) {
    const client = await getSupabase();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Upload file
    const { error: uploadError } = await client.storage
        .from('avatars')
        .upload(fileName, file, {
            upsert: true,
            contentType: file.type
        });

    if (uploadError) {
        throw uploadError;
    }

    // Get public URL
    const { data } = client.storage
        .from('avatars')
        .getPublicUrl(fileName);

    return data.publicUrl;
}

// ============================================
// Auth State Change Listener
// ============================================

/**
 * Listen for auth state changes
 * @param {Function} callback - Callback function (event, session)
 * @returns {Promise<object>} Subscription object
 */
async function onAuthStateChange(callback) {
    const client = await getSupabase();

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });

    return subscription;
}
