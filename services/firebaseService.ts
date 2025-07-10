
import { firebaseConfig } from '../firebaseConfig';
import type { BlogPost, Category } from '../types';

// This promise will resolve when firebase is initialized.
let initializationPromise: Promise<void> | null = null;

// The initialized firebase services
let auth: any;
let db: any;

/**
 * Checks if the Firebase config has been updated from the placeholder values.
 */
export const isFirebaseConfigured = (): boolean => {
  return firebaseConfig.apiKey !== "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX";
};

/**
 * A robust function to initialize the Firebase app.
 * It waits for the Firebase SDK script to load, then initializes the app.
 * It's a "singleton" - it only runs once and subsequent calls return the original promise.
 */
export const initializeFirebase = (): Promise<void> => {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = new Promise(async (resolve, reject) => {
        if (!isFirebaseConfigured()) {
            return reject(new Error('CONFIG_MISSING'));
        }

        // Wait for the global `firebase` object to be available
        const firebase = await new Promise<any>((res, rej) => {
            const interval = setInterval(() => {
                if ((window as any).firebase) {
                    clearInterval(interval);
                    res((window as any).firebase);
                }
            }, 50);
            setTimeout(() => {
                clearInterval(interval);
                rej(new Error("Firebase SDK failed to load after 8 seconds."));
            }, 8000);
        });

        try {
            const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            resolve();
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            reject(error);
        }
    });

    return initializationPromise;
};


// --- AUTHENTICATION ---
// All service functions now await `initializeFirebase` to ensure the app is ready.

export const onAuthStateChanged = async (callback: (user: any) => void): Promise<() => void> => {
    await initializeFirebase();
    return auth.onAuthStateChanged(callback);
};

export const signInWithEmailAndPassword = async (email: string, password: string): Promise<any> => {
    await initializeFirebase();
    return auth.signInWithEmailAndPassword(email, password);
};

export const signOut = async (): Promise<void> => {
    await initializeFirebase();
    return auth.signOut();
};

// --- FIRESTORE ---

// Get all posts
export const getPosts = async (): Promise<BlogPost[]> => {
    await initializeFirebase();
    try {
        const snapshot = await db.collection('posts').orderBy('date', 'desc').get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as BlogPost));
    } catch (error) {
        console.error("Error getting posts: ", error);
        return [];
    }
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
    await initializeFirebase();
     try {
        const snapshot = await db.collection('categories').orderBy('name', 'asc').get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Category));
    } catch (error) {
        console.error("Error getting categories: ", error);
        return [];
    }
};

// Add a new post
export const addPost = async (post: Omit<BlogPost, 'id'>): Promise<string> => {
    await initializeFirebase();
    const docRef = await db.collection('posts').add(post);
    return docRef.id;
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
    await initializeFirebase();
    await db.collection('posts').doc(postId).delete();
};

// Add a new category
export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
    await initializeFirebase();
    const docRef = await db.collection('categories').add(category);
    return docRef.id;
};

// Seed default categories if none exist
export const seedDefaultCategories = async (): Promise<void> => {
    await initializeFirebase();
    const defaultCategories = [
        { name: 'सरकारी योजना' }, { name: 'जॉब' }, { name: 'शिक्षा' }, 
        { name: 'टेक' }, { name: 'व्यापार' }, { name: 'स्वास्थ्य' }, 
        { name: 'मनोरंजन' }, { name: 'खेल' }, { name: 'पर्यटन' }, { name: 'इतिहास' },
    ];
    
    const batch = db.batch();
    defaultCategories.forEach(cat => {
        const docRef = db.collection('categories').doc();
        batch.set(docRef, cat);
    });
    
    await batch.commit();
};
