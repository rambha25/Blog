
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { BlogPost, Category } from '../types';

interface HomePageProps {
  posts: BlogPost[];
  categories: Category[];
}

const HomePage: React.FC<HomePageProps> = ({ posts, categories }) => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');

  const filteredPosts = categoryId ? posts.filter(p => p.categoryId === categoryId) : posts;
  const selectedCategory = categoryId ? categories.find(c => c.id === categoryId) : null;
  
  const getSnippet = (content: string, length = 100) => {
    const textContent = content.split('\n').filter(line => !line.startsWith('http')).join(' ');
    if (textContent.length <= length) return textContent;
    return textContent.substring(0, length) + '...';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
        {selectedCategory ? `${selectedCategory.name} श्रेणी` : 'ज्ञान का सागर'}
      </h1>
      <p className="text-xl text-center text-gray-600 mb-12">
        {selectedCategory ? `इस श्रेणी की सभी पोस्ट्स देखें` : 'भारत की जानकारी, आपकी भाषा में।'}
      </p>
      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500">इस श्रेणी में कोई पोस्ट नहीं है।</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">सभी पोस्ट्स देखें</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPosts.map(post => (
            <Link to={`/post/${post.id}`} key={post.id} className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <img src={post.mainImage || `https://picsum.photos/seed/${post.id}/400/250`} alt={post.title} className="w-full h-56 object-cover" />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">{post.title}</h2>
                <p className="text-gray-600 mb-4 font-light">{getSnippet(post.content)}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
