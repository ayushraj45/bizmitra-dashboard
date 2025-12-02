import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { Timezone } from '../types';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    business_type: '',
    timezone: Timezone.US,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getUTMSource();
    const utm=new URLSearchParams(location.search)
 
      console.log('UTM Source on load:', utm);
    
  }, []);

  // Function to extract UTM source from URL
  const getUTMSource = () => {
    const params = new URLSearchParams(location.search);

    console.log('UTM Source:', params.get('utm_source'));
    return params.get('utm_source') || '';
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Add UTM source if present
      const utmSource = getUTMSource();
      const dataToSend = utmSource
        ? { ...formData, affiliate_source: utmSource }
        : formData;
      await register(dataToSend);
      onRegisterSuccess();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-xl p-8 space-y-6">
        <h2 className="text-center text-3xl font-extrabold text-primary-600 dark:text-primary-400">
          Create your BizMitra Account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="name" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="Business Name" onChange={handleChange} />
          <input name="email" type="email" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="Email Address" onChange={handleChange} />
          <input name="password" type="password" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="Password" onChange={handleChange} />
          <input name="phone_number" type="tel" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="Phone Number" onChange={handleChange} />
          <input name="business_type" required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="Type of Business (e.g., Freelancer, Agency)" onChange={handleChange} />
          <select name="timezone" value={formData.timezone} required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" onChange={handleChange}>
            {/* <option value={Timezone.US}>US (EST)</option> */}
            <option value={Timezone.INDIA}>India (IST)</option>
            {/* <option value={Timezone.EUROPE}>Europe (GMT)</option> */}
          </select>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <a onClick={() => navigate('/login')} className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;