// Firestore Service Layer
// Centralized CRUD operations for Filaments and Products collections

// ============================================
// FILAMENT OPERATIONS
// ============================================

/**
 * Get all filaments from Firestore with real-time updates
 * @param {Function} callback - Called when data changes
 * @returns {Function} Unsubscribe function
 */
function subscribeToFilaments(callback) {
    return db.collection('filaments')
        .orderBy('dateAdded', 'desc')
        .onSnapshot((snapshot) => {
            const filaments = [];
            snapshot.forEach((doc) => {
                filaments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(filaments);
        }, (error) => {
            console.error('Error fetching filaments:', error);
            showToast('error', 'Database Error', 'Failed to load filaments');
        });
}

/**
 * Add a new filament to Firestore
 * @param {Object} filament - Filament data
 * @returns {Promise<string>} Document ID
 */
async function addFilament(filament) {
    try {
        // Convert dateAdded to Firestore Timestamp
        const filamentData = {
            ...filament,
            dateAdded: firebase.firestore.Timestamp.fromDate(new Date(filament.dateAdded))
        };

        const docRef = await db.collection('filaments').add(filamentData);
        console.log('✅ Filament added:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding filament:', error);
        throw error;
    }
}

/**
 * Update an existing filament
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateFilament(id, updates) {
    try {
        await db.collection('filaments').doc(id).update(updates);
        console.log('✅ Filament updated:', id);
    } catch (error) {
        console.error('❌ Error updating filament:', error);
        throw error;
    }
}

/**
 * Delete a filament from Firestore
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
async function deleteFilament(id) {
    try {
        await db.collection('filaments').doc(id).delete();
        console.log('✅ Filament deleted:', id);
    } catch (error) {
        console.error('❌ Error deleting filament:', error);
        throw error;
    }
}

// ============================================
// PRODUCT OPERATIONS
// ============================================

/**
 * Get all products from Firestore with real-time updates
 * @param {Function} callback - Called when data changes
 * @returns {Function} Unsubscribe function
 */
function subscribeToProducts(callback) {
    return db.collection('products')
        .orderBy('dateAdded', 'desc')
        .onSnapshot((snapshot) => {
            const products = [];
            snapshot.forEach((doc) => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(products);
        }, (error) => {
            console.error('Error fetching products:', error);
            showToast('error', 'Database Error', 'Failed to load products');
        });
}

/**
 * Add a new product to Firestore
 * @param {Object} product - Product data
 * @returns {Promise<string>} Document ID
 */
async function addProduct(product) {
    try {
        // Convert dateAdded to Firestore Timestamp
        const productData = {
            ...product,
            dateAdded: firebase.firestore.Timestamp.fromDate(new Date(product.dateAdded))
        };

        const docRef = await db.collection('products').add(productData);
        console.log('✅ Product added:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding product:', error);
        throw error;
    }
}

/**
 * Update an existing product
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateProduct(id, updates) {
    try {
        await db.collection('products').doc(id).update(updates);
        console.log('✅ Product updated:', id);
    } catch (error) {
        console.error('❌ Error updating product:', error);
        throw error;
    }
}

/**
 * Delete a product from Firestore
 * @param {string} id - Document ID
 * @returns {Promise<void>}
 */
async function deleteProductFromFirestore(id) {
    try {
        await db.collection('products').doc(id).delete();
        console.log('✅ Product deleted:', id);
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
    }
}

// ============================================
// DATA MIGRATION UTILITIES
// ============================================

/**
 * Migrate data from localStorage to Firestore
 * @returns {Promise<Object>} Migration results
 */
async function migrateLocalStorageToFirestore() {
    console.log('🔄 Starting migration from localStorage to Firestore...');

    const results = {
        filaments: { success: 0, failed: 0 },
        products: { success: 0, failed: 0 }
    };

    try {
        // Migrate filaments
        const localFilaments = JSON.parse(localStorage.getItem('filaments') || '[]');
        console.log(`📦 Found ${localFilaments.length} filaments in localStorage`);

        for (const filament of localFilaments) {
            try {
                await addFilament(filament);
                results.filaments.success++;
            } catch (error) {
                console.error('Failed to migrate filament:', filament.id, error);
                results.filaments.failed++;
            }
        }

        // Migrate products
        const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
        console.log(`📦 Found ${localProducts.length} products in localStorage`);

        for (const product of localProducts) {
            try {
                await addProduct(product);
                results.products.success++;
            } catch (error) {
                console.error('Failed to migrate product:', product.id, error);
                results.products.failed++;
            }
        }

        console.log('✅ Migration complete:', results);
        return results;
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

/**
 * Backup Firestore data to localStorage
 * @returns {Promise<void>}
 */
async function backupFirestoreToLocalStorage() {
    try {
        const filamentsSnapshot = await db.collection('filaments').get();
        const productsSnapshot = await db.collection('products').get();

        const filaments = [];
        const products = [];

        filamentsSnapshot.forEach(doc => {
            filaments.push({ id: doc.id, ...doc.data() });
        });

        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        localStorage.setItem('filaments_backup', JSON.stringify(filaments));
        localStorage.setItem('products_backup', JSON.stringify(products));

        console.log('✅ Backup complete');
        showToast('success', 'Backup Complete', `${filaments.length} filaments and ${products.length} products backed up`);
    } catch (error) {
        console.error('❌ Backup failed:', error);
        showToast('error', 'Backup Failed', error.message);
    }
}

// ============================================
// CONNECTION STATUS
// ============================================

/**
 * Monitor Firestore connection status
 */
function monitorConnectionStatus() {
    db.collection('_connection_test').doc('status')
        .onSnapshot(() => {
            console.log('🟢 Firestore connected');
            updateConnectionIndicator(true);
        }, () => {
            console.log('🔴 Firestore disconnected');
            updateConnectionIndicator(false);
        });
}

/**
 * Update connection indicator in UI
 * @param {boolean} isConnected
 */
function updateConnectionIndicator(isConnected) {
    const indicator = document.getElementById('connection-status');
    if (indicator) {
        indicator.textContent = isConnected ? '🟢 Online' : '🔴 Offline';
        indicator.style.color = isConnected ? 'var(--success)' : 'var(--text-tertiary)';
    }
}
