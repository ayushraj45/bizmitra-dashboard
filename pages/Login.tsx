
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
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
      await login(email, password);
      onLoginSuccess();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-xl p-8 space-y-6">
        <h2 className="text-center text-3xl font-extrabold text-primary-600 dark:text-primary-400">
          Welcome to BizMitra
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-300">Sign in to your account</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 dark:disabled:bg-primary-800"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <a onClick={() => navigate('/register')} className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
