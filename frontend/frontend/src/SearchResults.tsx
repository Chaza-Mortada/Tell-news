import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from "date-fns";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function for consistent image paths
  /*const getFullImageUrl = (url: string) => {
    if (!url || url === "" || url === "undefined") return "/no-image.jpg";
    const firstPath = url.split(",")[0].trim();
    if (firstPath.startsWith("http")) return firstPath;
    const cleanPath = firstPath.startsWith("uploads/") ? firstPath : `uploads/${firstPath}`;
   const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return `${baseUrl}/${cleanPath}`;
  };*/
  const getFullImageUrl = (url: string) => {
  if (!url || url === "undefined") {
    return "/no-image.jpg";
  }

  const firstPath = url.split(",")[0].trim();

  if (firstPath.startsWith("http")) {
    return firstPath;
  }

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const cleanPath = firstPath
    .replace(/^\/+/, "")
    .replace(/^uploads\//, "");

  return `${baseUrl}/uploads/${cleanPath}`;
};

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
fetch(`${baseUrl}/api/news`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;

        // 1. Get the array correctly (handle both wrapped and unwrapped JSON)
        const allArticles = Array.isArray(json) ? json : (json.data || []);

        // 2. Filter logic: Match query AND exclude Advertisements from search results
        const filtered = allArticles.filter((article: any) => {
          const isNotAd = article.category !== "Ads";
          const matchesTitle = article.title?.toLowerCase().includes(query);
          const matchesDesc = article.description?.toLowerCase().includes(query);
          
          return isNotAd && (matchesTitle || matchesDesc);
        });

        setResults(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search fetch error:", err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 text-white">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <h2 className="text-3xl font-black uppercase italic border-l-4 border-red-600 pl-4 tracking-tighter">
          Search Results: <span className="text-red-500">"{query}"</span>
        </h2>
        <span className="text-[10px] font-bold uppercase bg-white/10 px-3 py-1 rounded-full">
          {results.length} Matches Found
        </span>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse space-y-4">
              <div className="h-48 bg-white/5 rounded"></div>
              <div className="h-4 w-3/4 bg-white/5 rounded"></div>
              <div className="h-3 w-1/2 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {results.map((article) => (
            <Link 
              to={`/article/${article.slug}`} 
              key={article.ID} 
              className="group bg-[#252b3d] border border-white/5 rounded-lg overflow-hidden hover:border-red-600/50 transition-all"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={getFullImageUrl(article.image_url)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt={article.title} 
                />
                <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 text-[8px] font-black uppercase">
                  {article.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold uppercase leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-[10px] text-white/40 mt-3 flex items-center gap-2">
                   <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                   {article.CreatedAt ? formatDistanceToNow(new Date(article.CreatedAt), { addSuffix: true }) : "Recently"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-[#252b3d] rounded-xl border border-dashed border-white/10">
          <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-white/40 uppercase font-black tracking-[0.2em] text-sm">No results found for your query.</p>
          <Link to="/" className="text-red-500 text-xs font-bold uppercase mt-4 inline-block hover:underline">
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;