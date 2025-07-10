
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost, Category } from '../types';
import { PlusIcon, TrashIcon } from '../components/icons';

interface AdminDashboardPageProps {
    posts: BlogPost[];
    categories: Category[];
    addCategory: (categoryName: string) => void;
    deletePost: (postId: string) => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ posts, categories, addCategory, deletePost }) => {
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    const handleDelete = (postId: string, postTitle: string) => {
        if (window.confirm(`क्या आप वाकई "${postTitle}" पोस्ट को हटाना चाहते हैं?`)) {
            deletePost(postId);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">एडमिन डैशबोर्ड</h1>
                <Link
                    to="/admin/create"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <PlusIcon className="w-6 h-6" />
                    <span className="font-semibold">नई पोस्ट बनाएँ</span>
                </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">मौजूदा पोस्ट्स ({posts.length})</h2>
                    {posts.length > 0 ? (
                        <ul className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                            {posts.map(post => (
                                <li key={post.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                                        <p className="text-sm text-gray-500">{post.date} - {post.author}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Link to={`/post/${post.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">देखें</Link>
                                        <button 
                                            onClick={() => handleDelete(post.id, post.title)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            aria-label={`डिलीट ${post.title}`}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-6">कोई पोस्ट नहीं मिली। आरंभ करने के लिए एक नई पोस्ट बनाएँ!</p>
                    )}
                </div>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">श्रेणी प्रबंधन</h2>
                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                        <input 
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="नई श्रेणी का नाम"
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">+</button>
                    </form>
                     <h3 className="font-semibold text-gray-600 mb-2">मौजूदा श्रेणियाँ ({categories.length})</h3>
                    {categories.length > 0 ? (
                        <ul className="space-y-2">
                            {categories.map(cat => (
                                <li key={cat.id} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md text-sm">
                                    {cat.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-center text-gray-500 py-4">कोई श्रेणी नहीं है।</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;