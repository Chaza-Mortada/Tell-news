import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  
  // --- GLOBAL ADS STATE ---
  const [ads, setAds] = useState<any[]>([]);

  const categories = [t("art"), "Cultural", "Social", "Scientific", "UIT"];
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const isActive = (path: string) => location.pathname === path;
  const isCategoryActive = (cat: string) =>
    location.pathname === `/category/${cat.toLowerCase().replace(/\s+/g, "-")}`;

  // 1. Fetch Global Ads once on mount
  useEffect(() => {
    fetch(`${baseUrl}/api/news`)
      .then(res => res.json())
      .then(json => {
        const allData = Array.isArray(json) ? json : (json.data || []);
        // Filter for items categorized as "Ads"
        const filteredAds = allData.filter((item: any) => 
          item.category === "Ads" || item.category === "advertisement"
        );
        setAds(filteredAds);
      })
      .catch(err => console.error("Global Ad fetch error:", err));
  }, [baseUrl]);

  // 2. Check Auth Status
/*useEffect(() => {
  const checkAuth = async () => {
    try {
      // We must include credentials to send the HttpOnly cookie to the backend
      const response = await fetch(`${baseUrl}/api/validate`, { 
        credentials: "include" 
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  checkAuth();
}, [location.pathname, baseUrl]); // Re-check when the user changes pages*/
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };
  // 2. Check Auth Status + Role
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/validate`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        setIsLoggedIn(data.authenticated === true);
        setUserRole(data.role || "");
      } else {
        setIsLoggedIn(false);
        setUserRole("");
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUserRole("");
    }
  };

  checkAuth();
}, [location.pathname, baseUrl]);

const handleLogout = async () => {
  try {
    // Optional: Call a backend /api/logout to clear the cookie server-side
    await fetch(`${baseUrl}/api/logout`, { method: "POST", credentials: "include" });
  } catch (e) {
    console.error("Logout failed", e);
  }
  
  setIsLoggedIn(false);
  navigate("/");
};

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

 return (
  <div className="min-h-screen bg-[#1a1e2e] text-white font-sans selection:bg-red-500/30">

    {/* Admin Dashboard Button */}
    {userRole === "admin" && (
      <div className="w-full bg-[#141824] border-b border-white/5 px-6 py-2 flex justify-end">
        <Link
          to="/admin"
          className="text-[9px] font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-all"
        >
          Admin Dashboard
        </Link>
      </div>
    )}

    
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#1a1e2e]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center space-x-2 cursor-pointer">
          <div className="bg-[#e61e25] px-3 py-1 font-black text-xl uppercase tracking-tighter text-white">
            Tell
          </div>
          <span className="text-sm font-light tracking-widest uppercase opacity-80">
            news
          </span>
        </Link>

        {/* Center: Main Navigation */}
        <ul className="hidden lg:flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em]">
          <li>
            <Link
              to="/"
              className={`transition-colors hover:text-red-500 ${isActive("/") ? "text-red-500 underline underline-offset-8 decoration-2" : "text-white/60"}`}
            >
              {t("home")}
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                to={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className={`transition-colors hover:text-red-500 ${isCategoryActive(cat) ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-white/60"}`}
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Tools & Auth */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative flex items-center">
            {isSearchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute right-10 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#252b3d] border border-white/10 rounded-full px-4 py-1 text-xs w-64 focus:outline-none focus:border-red-500 transition-all"
                  placeholder="Type to search..."
                />
              </form>
            )}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={isSearchOpen ? "text-red-500" : "text-white/60 hover:text-white"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-[10px] font-black uppercase tracking-widest border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-all"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold uppercase text-white/50 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="bg-red-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded tracking-widest hover:bg-red-700 transition-colors">Sign Up</Link>
              </>
            )}
          </div>

          {/* Language Switcher */}
          <div className="hidden sm:flex bg-white/5 rounded-full p-1 border border-white/10">
            {["en", "ar", "fr"].map((lng) => (
              <button
                key={lng}
                onClick={() => changeLanguage(lng)}
                className={`px-2 py-1 rounded-full text-[8px] font-black uppercase transition-all ${i18n.language === lng ? "bg-red-600 text-white" : "text-white/40 hover:text-white"}`}
              >
                {lng}
              </button>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#1a1e2e] pt-20 px-6 animate-in slide-in-from-top duration-300">
          <ul className="flex flex-col space-y-6 text-xl font-black uppercase italic tracking-tighter">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)} className={isActive("/") ? "text-red-500" : ""}>{t("home")}</Link></li>
            {categories.map((cat) => (
              <li key={cat}>
                <Link to={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setIsMenuOpen(false)} className={isCategoryActive(cat) ? "text-red-500" : ""}>{cat}</Link>
              </li>
            ))}
            <li className="pt-6 border-t border-white/5">
               {isLoggedIn ? (
                 <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-red-600">Logout</button>
               ) : (
                 <div className="flex flex-col gap-4">
                   <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                   <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-red-600">Sign Up</Link>
                 </div>
               )}
            </li>
          </ul>
        </div>
      )}

      {/* Main Content Area: Passing 'ads' context to all children */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet context={{ ads }} />
      </main>

      
<footer className="mt-24 border-t border-white/5 bg-[#141824] py-12 px-6">
  <div className="max-w-6xl mx-auto">

    {/* Logo & Description */}
    <div className="text-center mb-10">
      <div className="bg-[#e61e25] w-fit mx-auto px-3 py-1.5 font-black text-sm uppercase tracking-tighter text-white mb-4">
        Tell News
      </div>
      <p className="text-white/40 text-xs max-w-md mx-auto leading-relaxed">
        Your trusted source for the latest news, stories, and updates.
      </p>
    </div>

    {/* Contact & Links */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-xl mx-auto text-center mb-10">

      {/* Contact Information */}
      <div>
        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
          Contact Us
        </h3>
        <div className="space-y-3 text-white/40 text-xs">
          <p>
            <span className="text-[#e61e25] mr-2">✉</span>
            info@tellnews.com
          </p>
          <p>
            <span className="text-[#e61e25] mr-2">☎</span>
            +961 71717171
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
          Quick Links
        </h3>
        <div className="flex flex-col gap-3 text-white/40 text-xs">
          <a href="/" className="hover:text-[#e61e25] transition-colors">
            Home
          </a>
          <a href="/about" className="hover:text-[#e61e25] transition-colors">
            About Us
          </a>
          <a href="/privacy-policy" className="hover:text-[#e61e25] transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>

    </div>

    {/* Social Media */}
    <div className="flex justify-center gap-6 mb-8 text-white/30 text-xs">
      <a href="#" className="hover:text-[#e61e25] transition-colors">Facebook</a>
      <a href="#" className="hover:text-[#e61e25] transition-colors">Instagram</a>
      <a href="#" className="hover:text-[#e61e25] transition-colors">X</a>
    </div>

    {/* Copyright */}
    <div className="border-t border-white/5 pt-6 text-center">
      <p className="text-white/20 text-[9px] uppercase tracking-[0.3em]">
        © {new Date().getFullYear()} Tell News. All Rights Reserved.
      </p>
      <p  className="text-white/20 text-[9px] uppercase tracking-[0.3em]">
       Designed and Developed by Chaza Youssef Mortada 
       </p>
    </div>

  </div>
</footer>

    </div>
  );
};

export default MainLayout;