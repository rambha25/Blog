
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCreatePostPage from './pages/AdminCreatePostPage';
import type { BlogPost, Category } from './types';

const sampleCategories: Category[] = [
    { id: "sarkari-yojna", name: "सरकारी योजना" },
    { id: "jobs", name: "जॉब" },
    { id: "shiksha", name: "शिक्षा" },
    { id: "tech", name: "टेक" },
    { id: "vyapar", name: "व्यापार" },
    { id: "swasthya", name: "स्वास्थ्य" },
    { id: "manoranjan", name: "मनोरंजन" },
    { id: "khel", name: "खेल" },
    { id: "tourism", name: "पर्यटन" },
    { id: "etihas", name: "इतिहास" },
];

const samplePosts: BlogPost[] = [
    {
        id: "1",
        title: "ताजमहल: मोहब्बत की अनूठी निशानी",
        content: `आगरा में यमुना नदी के दक्षिणी तट पर स्थित, ताजमहल दुनिया के सात अजूबों में से एक है। यह एक हाथीदांत-सफेद संगमरमर का मकबरा है जिसे 1632 में मुगल सम्राट शाहजहाँ ने अपनी पसंदीदा पत्नी मुमताज महल की याद में बनवाया था।
        
https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop

ताजमहल का निर्माण 1648 में पूरा हुआ था और यह मुगल वास्तुकला का एक बेहतरीन उदाहरण है, जो भारतीय, फारसी और इस्लामी शैलियों का एक संयोजन है। मुख्य मकबरे के अलावा, इस परिसर में एक मस्जिद, एक गेस्ट हाउस और औपचारिक उद्यान भी शामिल हैं। हर साल लाखों पर्यटक इस शानदार स्मारक को देखने आते हैं।`,
        author: "InfoBharatKa टीम",
        date: "15/07/2024",
        mainImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop",
        categoryId: "tourism",
        seo: {
            keywords: ["ताजमहल", "आगरा", "भारत के अजूबे", "मुगल वास्तुकला", "शाहजहाँ"],
            metaDescription: "भारत के आगरा में स्थित ताजमहल की सुंदरता और इतिहास के बारे में जानें, जो मुगल सम्राट शाहजहाँ द्वारा अपनी पत्नी मुमताज महल के लिए बनाया गया एक प्रेम का प्रतीक है।"
        }
    }
];

const ProtectedRoute: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

const App: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Load posts from localStorage or use sample
        const storedPosts = localStorage.getItem('blogPosts');
        if (storedPosts) {
            setPosts(JSON.parse(storedPosts));
        } else {
            setPosts(samplePosts);
            localStorage.setItem('blogPosts', JSON.stringify(samplePosts));
        }

        // Load categories from localStorage or use sample
        const storedCategories = localStorage.getItem('blogCategories');
        if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
        } else {
            setCategories(sampleCategories);
            localStorage.setItem('blogCategories', JSON.stringify(sampleCategories));
        }
        
        // Check login status
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedInStatus);
    }, []);

    const addPost = (post: BlogPost) => {
        const updatedPosts = [post, ...posts];
        setPosts(updatedPosts);
        localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    };
    
    const deletePost = (postId: string) => {
        const updatedPosts = posts.filter(p => p.id !== postId);
        setPosts(updatedPosts);
        localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    };

    const addCategory = (categoryName: string) => {
        const newCategory: Category = {
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName
        };
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        localStorage.setItem('blogCategories', JSON.stringify(updatedCategories));
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
    };

    return (
        <HashRouter>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} categories={categories} />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage posts={posts} categories={categories} />} />
                        <Route path="/post/:id" element={<PostPage posts={posts} categories={categories} />} />
                        <Route path="/login" element={<AdminLoginPage onLogin={handleLogin} />} />

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