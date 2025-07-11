//
// 🔴🔴🔴 जरूरी: Firebase कॉन्फ़िगरेशन अब इस फ़ाइल में है! 🔴🔴🔴
//
// आपको अपनी असली Firebase कॉन्फ़िगरेशन को नीचे दिए गए सैंपल से बदलना होगा।
// अगर आप ऐसा नहीं करते हैं, तो आपकी वेबसाइट Firebase से कनेक्ट नहीं हो पाएगी और काम नहीं करेगी।
//
// अपनी असली कॉन्फ़िगरेशन कैसे प्राप्त करें:
// 1. अपने Firebase प्रोजेक्ट कंसोल पर जाएँ (console.firebase.google.com)
// 2. प्रोजेक्ट सेटिंग्स (⚙️ आइकन) > सामान्य (General) टैब पर क्लिक करें।
// 3. नीचे "Your apps" सेक्शन में, अपनी वेब ऐप पर क्लिक करें।
// 4. "SDK setup and configuration" के तहत, "Config" विकल्प चुनें।
// 5. वहां दिए गए `firebaseConfig` ऑब्जेक्ट को कॉपी करें और नीचे दिए गए सैंपल को उससे बदलें।
//
export const firebaseConfig = {
  // --- नीचे दिए गए सभी मानों को अपनी Firebase सेटिंग से बदलें ---
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX", // <--- अपनी API की यहां पेस्ट करें
  authDomain: "your-project-id.firebaseapp.com", // <--- अपना Auth डोमेन यहां पेस्ट करें
  projectId: "your-project-id", // <--- अपना प्रोजेक्ट ID यहां पेस्ट करें
  storageBucket: "your-project-id.appspot.com", // <--- अपना स्टोरेज बकेट यहां पेस्ट करें
  messagingSenderId: "1234567890", // <--- अपना सेंडर ID यहां पेस्ट करें
  appId: "1:1234567890:web:abcdef1234567890" // <--- अपना ऐप ID यहां पेस्ट करें
};

import type { BlogPost, Category } from '../types';

let initializationPromise: Promise<void> | null = null;
let auth: any;
let db: any;

export const isFirebaseConfigured = (): boolean => {
  return firebaseConfig && firebaseConfig.apiKey !== "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX";
};

export const initializeFirebase = (): Promise<void> => {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = new Promise(async (resolve, reject) => {
        if (!isFirebaseConfigured()) {
            return reject(new Error('Firebase not configured'));
        }
        
        const firebase = (window as any).firebase;
        if (!firebase) {
             return reject(new Error("Firebase SDK not loaded."));
        }

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

export const addPost = async (post: Omit<BlogPost, 'id'>): Promise<string> => {
    await initializeFirebase();
    const docRef = await db.collection('posts').add(post);
    return docRef.id;
};

export const deletePost = async (postId: string): Promise<void> => {
    await initializeFirebase();
    await db.collection('posts').doc(postId).delete();
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
    await initializeFirebase();
    const docRef = await db.collection('categories').add(category);
    return docRef.id;
};

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
