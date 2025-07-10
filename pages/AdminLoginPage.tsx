
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginIcon } from '../components/icons';

interface AdminLoginPageProps {
  onLogin: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const adminPassword = process.env.ADMIN_PASSWORD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminPassword) {
      setError("एडमिन पासवर्ड कॉन्फ़िगर नहीं है। कृपया व्यवस्थापक से संपर्क करें।");
      return;
    }

    if (password === adminPassword) {
      setError('');
      onLogin();
      navigate('/admin');
    } else {
      setError('गलत पासवर्ड। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            एडमिन पैनल में लॉगिन करें
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password-input" className="sr-only">Password</label>
              <input
                id="password-input"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="पासवर्ड"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LoginIcon className="h-5 w-5 text-green-300 group-hover:text-orange-200" />
              </span>
              लॉगिन करें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;