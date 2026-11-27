import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

    try {
      const res = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || `Login failed (${res.status}). Please check your details.`);
        return;
      }

      localStorage.setItem("role", data.role || "user");
      localStorage.setItem("username", data.username || "");
      navigate("/");
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-[#252b3d] p-8 rounded-lg border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-black uppercase italic mb-6 border-l-4 border-red-600 pl-4">
        Sign In
      </h2>

      {error && <p role="alert" className="text-red-500 text-xs mb-4 font-bold">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="EMAIL"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:border-red-600 outline-none"
        />
        <input
          type="password"
          placeholder="PASSWORD"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#1a1e2e] border border-white/10 rounded px-4 py-2 focus:border-red-600 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 py-3 uppercase font-bold text-xs tracking-widest"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
