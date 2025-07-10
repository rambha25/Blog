import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCreatePostPage from './pages/AdminCreatePostPage';
import DemoModeBanner from './components/DemoModeBanner';
import type { BlogPost, Category } from './types';
import { samplePosts, sampleCategories } from './data/sampleData';
import { 
    isFirebaseConfigured,
    initializeFirebase,
    onAuthStateChanged,
    signOut,
    getPosts,
    getCategories,
    addPost as fbAddPost,
    deletePost as fbDeletePost,
    addCategory as fbAddCategory,
    seedDefaultCategories,
    signInWithEmailAndPassword
} from './services/firebaseService';

const ProtectedRoute: React.FC<{ isLoggedIn: boolean | null }> = ({ isLoggedIn }) => {
    if (isLoggedIn === null) return <Spinner />;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <Outlet />;
};

const App: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const loadDemoData = useCallback(() => {
        setPosts(samplePosts);
        setCategories(sampleCategories);
        setIsDemoMode(true);
        setIsLoggedIn(false); // Start logged out in demo mode
        setIsLoading(false);
    }, []);

    useEffect(() => {
        let authUnsubscribe: (() => void) | null = null;
        
        const startApp = async () => {
            if (!isFirebaseConfigured()) {
                console.warn("Firebase configuration is missing. Running in Demo Mode.");
                loadDemoData();
                return;
            }

            try {
                await initializeFirebase();
                authUnsubscribe = await onAuthStateChanged(user => {
                    setIsLoggedIn(!!user);
                    if (isLoggedIn === null) { // only load data on initial auth check
                        Promise.all([getPosts(), getCategories()]).then(([fetchedPosts, fetchedCategories]) => {
                            setPosts(fetchedPosts);
                            if (fetchedCategories.length === 0) {
                                seedDefaultCategories().then(() => getCategories()).then(setCategories);
                            } else {
                                setCategories(fetchedCategories);
                            }
                            setIsLoading(false);
                        });
                    }
                });
            } catch (error) {
                console.error("Failed to initialize Firebase, falling back to Demo Mode.", error);
                loadDemoData();
            }
        };

        startApp();

        return () => {
            if (authUnsubscribe) authUnsubscribe();
        };
    }, [loadDemoData, isLoggedIn]);
    
    // --- Data Manipulation ---
    const addPost = async (post: Omit<BlogPost, 'id'>): Promise<void> => {
        if (isDemoMode) {
            const newPost = { ...post, id: `demo-${Date.now()}` };
            setPosts(prev => [newPost, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            return;
        }
        const newPostId = await fbAddPost(post);
        const newPostWithId = { ...post, id: newPostId };
        setPosts(prev => [newPostWithId, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };
    
    const deletePost = async (postId: string): Promise<void> => {
        if (isDemoMode) {
            setPosts(prev => prev.filter(p => p.id !== postId));
            return;
        }
        await fbDeletePost(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const addCategory = async (categoryName: string): Promise<void> => {
        if (categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            alert("यह श्रेणी पहले से मौजूद है।");
            throw new Error("Category exists");
        }
        if (isDemoMode) {
             setCategories(prev => [...prev, { id: `demo-cat-${Date.now()}`, name: categoryName }].sort((a, b) => a.name.localeCompare(b.name, 'hi')));
             return;
        }
        const createdId = await fbAddCategory({ name: categoryName });
        setCategories(prev => [...prev, { id: createdId, name: categoryName }].sort((a, b) => a.name.localeCompare(b.name, 'hi')));
    };

    // --- Auth Actions ---
     const handleLogin = async (email: string, password: string): Promise<void> => {
        if (isDemoMode) {
            if (email === 'admin@demo.com' && password === 'demo') {
                setIsLoggedIn(true);
            } else {
                throw new Error("डेमो मोड में, कृपया उपयोग करें: admin@demo.com / demo");
            }
            return;
        }
        await signInWithEmailAndPassword(email, password);
        // Auth state change will be handled by onAuthStateChanged listener
    };

    const handleLogout = async () => {
        if(isDemoMode) {
            setIsLoggedIn(false);
            return;
        }
        try {
            await signOut();
            // Auth state change will be handled by onAuthStateChanged listener
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    
    if (isLoading) {
      return (
            <div className="flex flex-col min-h-screen bg-gray-50 justify-center items-center">
                <Spinner size="h-16 w-16" />
                <p className="mt-4 text-gray-600">एप्लिकेशन शुरू हो रहा है...</p>
            </div>
        );
    }

    return (
        <HashRouter>
            <div className="flex flex-col min-h-screen bg-gray-50">
                {isDemoMode && <DemoModeBanner />}
                <Header isLoggedIn={isLoggedIn === true} onLogout={handleLogout} categories={categories} />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage posts={posts} categories={categories} />} />
                        <Route path="/post/:id" element={<PostPage posts={posts} categories={categories} />} />
                        <Route path="/login" element={isLoggedIn ? <Navigate to="/admin" /> : <AdminLoginPage onLogin={handleLogin} isDemoMode={isDemoMode} />} />

                        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
                            <Route path="/admin" element={<AdminDashboardPage posts={posts} categories={categories} addCategory={addCategory} deletePost={deletePost} />} />
                            <Route path="/admin/create" element={<AdminCreatePostPage addPost={addPost} categories={categories} />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </HashRouter>
    );
};

export default App;
