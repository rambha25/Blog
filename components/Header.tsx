
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginIcon, LogoutIcon } from './icons';
import type { Category } from '../types';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  categories: Category[];
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout, categories }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="h-2 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-gray-800 tracking-wider font-display">
          Info<span className="text-[#FF9933]">Bharat</span><span className="text-[#138808]">Ka</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">होम</Link>
          
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(prev => !prev)} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center">
              श्रेणियाँ
              <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1 border-t-2 border-[#FF9933]">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={`/?category=${category.id}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#138808]"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <>
              <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">एडमिन डैशबोर्ड</Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
              >
                <LogoutIcon className="w-5 h-5" />
                <span>लॉगआउट</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <LoginIcon className="w-5 h-5" />
              <span>एडमिन लॉगिन</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
