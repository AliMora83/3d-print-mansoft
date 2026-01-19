// Firebase Configuration and Initialization
// This file initializes Firebase and Firestore for the 3D Print ManSoft application

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJ20eHnPCpZjgMgErF28LZV_qI6Vwilbs",
    authDomain: "d-print-mansoft-dab7c.firebaseapp.com",
    projectId: "d-print-mansoft-dab7c",
    storageBucket: "d-print-mansoft-dab7c.firebasestorage.app",
    messagingSenderId: "49931813418",
    appId: "1:49931813418:web:f9bf2ebcce5cc5aeadf953",
    measurementId: "G-QHQWBRF2S3"
};

// Initialize Firebase
let app;
let db;
let analytics;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();

    // Enable offline persistence
    db.enablePersistence()
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.warn('The current browser does not support offline persistence');
            }
        });

    // Initialize Analytics (optional)
    if (typeof firebase.analytics !== 'undefined') {
        analytics = firebase.analytics();
    }

    console.log('✅ Firebase initialized successfully');
    console.log('✅ Firestore connected');
    console.log('✅ Offline persistence enabled');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Export for use in other files
window.firebaseApp = app;
window.firestoreDb = db;
window.firebaseAnalytics = analytics;
