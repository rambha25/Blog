import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCreatePostPage from './pages/AdminCreatePostPage';
import type { BlogPost, Category } from './types';
import { 
    isFirebaseConfigured,
    onAuthStateChanged,
    signOut,
    getPosts,
    getCategories,
    addPost as fbAddPost,
    deletePost as fbDeletePost,
    addCategory as fbAddCategory,
    seedDefaultCategories,
} from './services/firebaseService';


const FirebaseConfigErrorScreen: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl bg-white p-8 rounded-xl shadow-2xl border-t-4 border-red-500">
            <h1 className="text-3xl font-bold text-red-600 mb-4">🔴 वेबसाइट कॉन्फ़िगरेशन आवश्यक है!</h1>
            <p className="text-lg text-gray-700 mb-6">
                नमस्ते! आपकी वेबसाइट लगभग तैयार है, लेकिन यह अभी खाली दिख रही है क्योंकि यह अपने डेटाबेस से कनेक्ट नहीं हो पा रही है। इस समस्या को ठीक करने के लिए कृपया नीचे दिए गए स्टेप्स का पालन करें।
            </p>
            <div className="space-y-4 text-gray-800">
                <p>
                    <strong className="text-blue-600">समस्या क्या है?</strong> फ़ाइल <code className="bg-gray-200 text-red-700 px-2 py-1 rounded">src/firebaseConfig.ts</code> में आपके डेटाबेस से कनेक्ट होने के लिए सैंपल (नकली) जानकारी है। आपको इसे अपनी असली जानकारी से बदलना होगा।
                </p>
                <div>
                    <h2 className="text-xl font-semibold mb-2">समाधान के लिए स्टेप्स:</h2>
                    <ol className="list-decimal list-inside space-y-3 pl-2">
                        <li>
                            अपने Firebase कंसोल पर जाएँ: <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">console.firebase.google.com</a>
                        </li>
                        <li>
                            अपने <strong>InfoBharatKa</strong> प्रोजेक्ट को चुनें।
                        </li>
                        <li>
                            बाएँ कोने में प्रोजेक्ट सेटिंग्स (⚙️ आइकन) पर क्लिक करें, फिर <strong>Project settings</strong> चुनें।
                        </li>
                        <li>
                            <strong>General</strong> टैब में, नीचे स्क्रॉल करके "Your apps" सेक्शन पर जाएँ और अपनी वेब ऐप (<code>&lt;/&gt;</code>) पर क्लिक करें।
                        </li>
                        <li>
                            "SDK setup and configuration" के तहत, <strong>Config</strong> विकल्प चुनें।
                        </li>
                        <li>
                            आपको <code className="bg-gray-200 px-1 rounded">const firebaseConfig = &#123;...&#125;;</code> जैसा एक कोड ब्लॉक दिखेगा। उस पूरे ऑब्जेक्ट को कॉपी करें।
                        </li>
                        <li>
                            अपने कोड एडिटर में <code className="bg-gray-200 text-red-700 px-2 py-1 rounded">src/firebaseConfig.ts</code> फ़ाइल खोलें और वहां मौजूद सैंपल कोड को अपनी कॉपी की गई असली कॉन्फ़िगरेशन से बदल दें।
                        </li>
                        <li>
                            फ़ाइल को सेव करें। आपकी वेबसाइट अपने आप रीलोड हो जाएगी और सही से काम करने लगेगी!
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
);


const ProtectedRoute: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

const App: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null means checking, true/false means checked
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!isFirebaseConfigured()) {
            setIsLoadingData(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(user => {
            setIsLoggedIn(!!user);
        });

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                let fetchedCategories = await getCategories();
                if (fetchedCategories.length === 0) {
                    await seedDefaultCategories();
                    fetchedCategories = await getCategories();
                }
                const fetchedPosts = await getPosts();
                setCategories(fetchedCategories);
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
        return () => unsubscribe();
    }, []);

    const addPost = async (post: Omit<BlogPost, 'id'>): Promise<void> => {
        const newPostId = await fbAddPost(post);
        const newPostWithId = { ...post, id: newPostId };
        setPosts(prevPosts => [newPostWithId, ...prevPosts]);
    };
    
    const deletePost = async (postId: string): Promise<void> => {
        await fbDeletePost(postId);
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    };

    const addCategory = async (categoryName: string): Promise<void> => {
        const newId = categoryName.toLowerCase().replace(/\s+/g, '-');
        if (categories.some(c => c.id === newId)) {
            alert("यह श्रेणी पहले से मौजूद है।");
            return Promise.reject(new Error("Category exists"));
        }
        const newCategoryData = { name: categoryName };
        const createdId = await fbAddCategory(newCategoryData);
        setCategories(prev => [...prev, { id: createdId, name: categoryName }].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    
    if (!isFirebaseConfigured()) {
        return <FirebaseConfigErrorScreen />;
    }

    if (isLoggedIn === null || isLoadingData) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 justify-center items-center">
                <Spinner size="h-16 w-16" />
                <p className="mt-4 text-gray-600">{isLoggedIn === null ? 'प्रमाणीकरण की जाँच हो रही है...' : 'डेटा लोड हो रहा है...'}</p>
            </div>
        );
    }

    return (
        <HashRouter>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} categories={categories} />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage posts={posts} categories={categories} />} />
                        <Route path="/post/:id" element={<PostPage posts={posts} categories={categories} />} />
                        <Route path="/login" element={isLoggedIn ? <Navigate to="/admin" /> : <AdminLoginPage />} />

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
