/**
 * Appwrite Configuration
 * BookTopia - Kalam Knowledge Club
 */

// ============================================
// CONFIGURATION
// ============================================
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6968bd1e002588a2d014'; // Configured from user input

// Database IDs
const DB_ID = 'booktopia_db'; // You need to create this Database in Appwrite Console
const COLLECTION_READING_LOGS = 'reading_logs'; // You need to create this Collection
const COLLECTION_PROFILES = 'profiles'; // You need to create this Collection

// ============================================
// Appwrite Client Initialization
// ============================================
const { Client, Account, Databases, Storage, ID, Query } = Appwrite;

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Export for use in other files
window.appwriteClient = client;
window.appwriteAccount = account;
window.appwriteDatabases = databases;
window.appwriteStorage = storage;
window.AppwriteID = ID;
window.AppwriteQuery = Query;
window.APPWRITE_CONFIG = {
    DB_ID,
    COLLECTION_READING_LOGS,
    COLLECTION_PROFILES
};

console.log('✅ Appwrite client initialized');
