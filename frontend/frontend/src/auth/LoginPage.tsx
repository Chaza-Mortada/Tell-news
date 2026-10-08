import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
   const res = await fetch(`${baseUrl}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include', // THIS IS REQUIRED FOR COOKIES
});

if (res.ok) {
  const data = await res.json();
  // We only store the role/username for UI purposes
  localStorage.setItem('role', data.role);
  localStorage.setItem('username', data.username);
  window.location.href = "/";
}};

  return (
    <div className="max-w-md mx-auto mt-20 bg-[#252b3d] p-8 rounded-lg border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-black uppercase italic mb-6 border-l-4 border-red-600 pl-4">Sign In</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input 
          type="email" 
          placeholder="EMAIL" 
          className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:border-red-600 outline-none" 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="PASSWORD" 
          className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:border-red-600 outline-none" 
          onChange={e => setPassword(e.target.value)} 
        />
        <button className="w-full bg-red-600 py-3 uppercase font-bold text-xs tracking-widest">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;