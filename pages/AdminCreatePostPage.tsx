import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BlogPost, SeoData, Category } from '../types';
import { generateBlogPost, generateSeoSuggestions } from '../services/geminiService';
import { SparklesIcon, SeoIcon } from '../components/icons';
import Spinner from '../components/Spinner';

interface AdminCreatePostPageProps {
  addPost: (post: BlogPost) => void;
  categories: Category[];
}

const AdminCreatePostPage: React.FC<AdminCreatePostPageProps> = ({ addPost, categories }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [seoData, setSeoData] = useState<SeoData | null>(null);

  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

  const navigate = useNavigate();

  const handleGeneratePost = async () => {
    if (!aiPrompt) {
      alert("कृपया AI प्रॉम्प्ट दर्ज करें।");
      return;
    }
    setIsGeneratingPost(true);
    try {
      const generatedContent = await generateBlogPost(aiPrompt);
      const lines = generatedContent.split('\n');
      const generatedTitle = lines.length > 0 ? lines[0].replace(/#/g, '').trim() : "AI द्वारा उत्पन्न शीर्षक";
      const generatedBody = lines.slice(1).join('\n').trim();
      
      setTitle(generatedTitle);
      setContent(generatedBody);
    } catch (error) {
      console.error(error);
      alert("AI पोस्ट उत्पन्न करने में विफल रहा।");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleGenerateSeo = async () => {
    if (!title || !content) {
      alert("SEO सुझावों के लिए शीर्षक और सामग्री आवश्यक है।");
      return;
    }
    setIsGeneratingSeo(true);
    try {
      const suggestions = await generateSeoSuggestions(title, content);
      setSeoData(suggestions);
    } catch (error) {
      console.error(error);
      alert("AI SEO सुझाव उत्पन्न करने में विफल रहा।");
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      alert("कृपया शीर्षक, सामग्री और श्रेणी दर्ज करें।");
      return;
    }
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title,
      content,
      mainImage,
      categoryId,
      author: 'एडमिन',
      date: new Date().toLocaleDateString('hi-IN'),
      seo: seoData || { keywords: [], metaDescription: '' },
    };
    addPost(newPost);
    navigate('/admin');
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">नई ब्लॉग पोस्ट बनाएँ</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">शीर्षक</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="पोस्ट का शीर्षक"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700 mb-1">मुख्य इमेज URL</label>
                <input
                  type="url"
                  id="mainImage"
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
               <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">श्रेणी</label>
                <select 
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                    <option value="" disabled>एक श्रेणी चुनें</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">सामग्री</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="अपनी कहानी यहाँ लिखें... आप इमेज URL को एक नई लाइन पर पेस्ट कर सकते हैं।"
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-bold text-lg transition-colors">
                पोस्ट प्रकाशित करें
              </button>
            </div>
          </form>
        </div>

        {/* AI Tools Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">AI पोस्ट जेनरेटर</h3>
            <div className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="AI के लिए एक विषय लिखें, जैसे 'भारत के शीर्ष 5 पर्यटन स्थल'"
              />
              <button onClick={handleGeneratePost} disabled={isGeneratingPost} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                {isGeneratingPost ? <Spinner size="h-5 w-5" /> : <SparklesIcon className="w-5 h-5" />}
                <span>{isGeneratingPost ? 'उत्पन्न हो रहा है...' : 'पोस्ट उत्पन्न करें'}</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">AI SEO सहायक</h3>
            <button onClick={handleGenerateSeo} disabled={isGeneratingSeo || !title || !content} className="w-full flex justify-center items-center gap-2 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300">
              {isGeneratingSeo ? <Spinner size="h-5 w-5" /> : <SeoIcon className="w-5 h-5" />}
              <span>{isGeneratingSeo ? 'उत्पन्न हो रहा है...' : 'SEO सुझाव उत्पन्न करें'}</span>
            </button>
            {seoData && (
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-gray-700">कीवर्ड्स:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {seoData.keywords.map((kw, i) => <span key={i} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{kw}</span>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700">मेटा विवरण:</h4>
                  <p className="text-gray-600 bg-gray-100 p-2 rounded-md mt-1">{seoData.metaDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreatePostPage;