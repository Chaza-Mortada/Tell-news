import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import { useTranslation } from 'react-i18next';

const SignupPage: React.FC = () => {
  //const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        navigate('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-[#252b3d] p-8 rounded-lg border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-black uppercase italic mb-6 border-l-4 border-red-600 pl-4">Join Tell News</h2>
      {error && <p className="text-red-500 text-xs mb-4 uppercase font-bold">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Username</label>
          <input 
            type="text" 
            className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Email</label>
          <input 
            type="email" 
            className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Password</label>
          <input 
            type="password" 
            className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest text-xs transition-all rounded mt-4">
          Create Account
        </button>
      </form>
      <p className="text-center text-white/40 text-xs mt-6 uppercase">
        Already have an account? <Link to="/login" className="text-red-500 hover:underline">Sign In</Link>
      </p>
    </div>
  );
};

export default SignupPage;