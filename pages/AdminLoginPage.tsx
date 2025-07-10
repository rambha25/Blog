import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginIcon } from '../components/icons';
import Spinner from '../components/Spinner';

interface AdminLoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isDemoMode: boolean;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, isDemoMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'लॉगिन करने में एक अप्रत्याशित त्रुटि हुई।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            एडमिन पैनल में लॉगिन करें
          </h2>
          {isDemoMode && (
            <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
                <p className="font-bold">आप डेमो मोड में हैं।</p>
                <p className="text-sm">उपयोग करें: <code className="font-mono">admin@demo.com</code> / <code className="font-mono">demo</code></p>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ईमेल पता"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">Password</label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
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
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <Spinner size="h-5 w-5" />
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LoginIcon className="h-5 w-5 text-green-300 group-hover:text-orange-200" />
                  </span>
                  लॉगिन करें
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
