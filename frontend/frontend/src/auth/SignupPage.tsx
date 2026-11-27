import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

    try {
      const res = await fetch(`${baseUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || `Registration failed (${res.status}).`);
        return;
      }

      navigate("/login", { state: { message: "Account created. Please sign in." } });
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-[#252b3d] p-8 rounded-lg border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-black uppercase italic mb-6 border-l-4 border-red-600 pl-4">
        Join Tell News
      </h2>

      {error && <p role="alert" className="text-red-500 text-xs mb-4 uppercase font-bold">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Username</label>
          <input
            type="text"
            autoComplete="username"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 uppercase tracking-widest text-xs transition-all rounded mt-4"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-white/40 text-xs mt-6 uppercase">
        Already have an account? <Link to="/login" className="text-red-500 hover:underline">Sign In</Link>
      </p>
    </div>
  );
};

export default SignupPage;
