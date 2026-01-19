// Data Migration Utility
// Migrates data from localStorage to Firestore

// Migration status
let migrationInProgress = false;

// Check if migration is needed
async function checkMigrationNeeded() {
    const localFilaments = JSON.parse(localStorage.getItem('filaments') || '[]');
    const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const migrationCompleted = localStorage.getItem('firestore_migration_completed');

    if (migrationCompleted === 'true') {
        console.log('✅ Migration already completed');
        return false;
    }

    if (localFilaments.length > 0 || localProducts.length > 0) {
        console.log(`📦 Found ${localFilaments.length} filaments and ${localProducts.length} products to migrate`);
        return true;
    }

    return false;
}

// Perform migration
async function performMigration() {
    if (migrationInProgress) {
        console.log('⏳ Migration already in progress');
        return;
    }

    migrationInProgress = true;

    try {
        showToast('info', 'Migration Started', 'Migrating your data to Firebase...');

        const results = await migrateLocalStorageToFirestore();

        // Mark migration as completed
        localStorage.setItem('firestore_migration_completed', 'true');

        // Keep backup in localStorage
        localStorage.setItem('filaments_backup', localStorage.getItem('filaments'));
        localStorage.setItem('products_backup', localStorage.getItem('products'));

        showToast('success', 'Migration Complete!',
            `Successfully migrated ${results.filaments.success} filaments and ${results.products.success} products`);

        console.log('✅ Migration completed successfully:', results);

        // Refresh the UI
        setTimeout(() => {
            location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        showToast('error', 'Migration Failed', 'Please try again or contact support');
    } finally {
        migrationInProgress = false;
    }
}

// Auto-migrate on page load if needed
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Firebase to initialize
    setTimeout(async () => {
        if (typeof db !== 'undefined' && db) {
            const needsMigration = await checkMigrationNeeded();

            if (needsMigration) {
                // Show migration prompt
                if (confirm('We found existing data in your browser. Would you like to migrate it to Firebase for cloud storage and real-time sync?')) {
                    await performMigration();
                } else {
                    // User declined, mark as completed to not ask again
                    localStorage.setItem('firestore_migration_completed', 'true');
                }
            }
        }
    }, 2000);
});

// Manual migration trigger (for testing or retry)
function triggerManualMigration() {
    localStorage.removeItem('firestore_migration_completed');
    performMigration();
}
