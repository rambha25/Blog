import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import type { BlogPost, Category } from '../types';

interface PostPageProps {
  posts: BlogPost[];
  categories: Category[];
}

const PostPage: React.FC<PostPageProps> = ({ posts, categories }) => {
  const { id } = useParams<{ id: string }>();
  const post = posts.find(p => p.id === id);

  if (!post) {
    return <Navigate to="/" />;
  }

  const category = categories.find(c => c.id === post.categoryId);

  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph.startsWith('http') && (trimmedParagraph.endsWith('.jpg') || trimmedParagraph.endsWith('.png') || trimmedParagraph.endsWith('.webp') || trimmedParagraph.endsWith('.jpeg') || trimmedParagraph.endsWith('.gif'))) {
        return (
          <div key={index} className="my-6 flex justify-center">
            <img 
              src={trimmedParagraph} 
              alt={`इमेज ${index + 1}`} 
              className="rounded-lg shadow-xl max-w-full h-auto lg:max-w-3xl"
            />
          </div>
        );
      }
      if (trimmedParagraph === '') {
          return <br key={index} />;
      }
      return <p key={index} className="text-lg text-gray-700 leading-relaxed mb-4">{trimmedParagraph}</p>;
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <article className="bg-white p-6 sm:p-8 lg:p-12 rounded-xl shadow-lg">
        {category && (
            <Link to={`/?category=${category.id}`} className="inline-block bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 text-sm font-semibold mb-4 px-3 py-1 rounded-full hover:shadow-md transition-shadow">
                {category.name}
            </Link>
        )}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center text-gray-500 mb-6">
          <span>{post.author} द्वारा</span>
          <span className="mx-2">&bull;</span>
          <span>{post.date}</span>
        </div>
        <img src={post.mainImage || `https://picsum.photos/seed/${post.id}/800/400`} alt={post.title} className="w-full h-auto object-cover rounded-lg shadow-md mb-8" />
        <div className="prose prose-lg max-w-none">
          {renderContent(post.content)}
        </div>
      </article>
    </div>
  );
};

export default PostPage;