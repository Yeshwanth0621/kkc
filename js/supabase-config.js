/**
 * Supabase Configuration
 * BookTopia - Kalam Knowledge Club
 * 
 * IMPORTANT: Replace the placeholder values with your actual Supabase credentials
 * Get these from your Supabase project: Settings > API
 */

// ============================================
// CONFIGURATION - Replace with your values!
// ============================================
const SUPABASE_URL = 'https://bbmykatszqpalhknwnyy.supabase.co'; // e.g., 'https://xyzproject.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibXlrYXRzenFwYWxoa253bnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTg5ODUsImV4cCI6MjA4Mzk3NDk4NX0.40T-WGscFGMTNQ4Z4a-t9ojBZY20iTVSZmVvJMccT38'; // Your anon/public key

// ============================================
// Supabase Client Initialization
// ============================================

// Check if configuration is set
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('⚠️ Supabase not configured! Please update js/supabase-config.js with your Supabase credentials.');
}

// Import Supabase from CDN (using ES modules pattern via script tag alternative)
// We'll use the global supabase object from the CDN script

// Create a script tag to load Supabase (using UMD bundle for global scope)
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

// Initialize supabase client after script loads
let supabase = null;

supabaseScript.onload = function () {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');

        // Dispatch event to notify other scripts
        window.dispatchEvent(new CustomEvent('supabaseReady'));
    } else {
        console.error('❌ Failed to initialize Supabase - createClient not available');
    }
};

supabaseScript.onerror = function () {
    console.error('❌ Failed to load Supabase SDK from CDN');
    this.dataset.status = 'failed';
    window.dispatchEvent(new CustomEvent('supabaseError'));
};

document.head.appendChild(supabaseScript);


/**
 * Get the Supabase client
 * Returns a promise that resolves when client is ready
 */
function getSupabase() {
    return new Promise((resolve, reject) => {
        if (supabase) {
            resolve(supabase);
        } else {
            // Check if script already failed
            const script = document.querySelector('script[src*="supabase.min.js"]');
            if (script && script.dataset.status === 'failed') {
                reject(new Error('Supabase failed to load'));
                return;
            }

            const onReady = () => {
                cleanup();
                resolve(supabase);
            };

            const onError = () => {
                cleanup();
                reject(new Error('Failed to connect to backend'));
            };

            const cleanup = () => {
                window.removeEventListener('supabaseReady', onReady);
                window.removeEventListener('supabaseError', onError);
            };

            window.addEventListener('supabaseReady', onReady);
            window.addEventListener('supabaseError', onError);

            // Timeout after 10 seconds
            setTimeout(() => {
                cleanup();
                if (!supabase) reject(new Error('Connection timed out'));
            }, 10000);
        }
    });
}

/**
 * Utility to wait for Supabase to be ready
 */
async function waitForSupabase() {
    return getSupabase();
}
