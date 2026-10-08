import React, { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  title: string;
  title_ar?: string; 
  title_fr?: string; 
  description: string;
  description_ar?: string; 
  description_fr?: string; 
  full_description: string;
  full_description_ar?: string;
  full_description_fr?: string;
  image_url: string;
  video_url: string;
  media_type: string;
  category: string;
  CreatedAt: string;
}

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { ads } = useOutletContext<{ ads: any[] }>(); 
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarAd, setSidebarAd] = useState<any>(null);
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  /*const getFullImageUrl = (url: string) => {
    if (!url || url === "" || url === "undefined") return "/no-image.jpg";
    const firstPath = url.split(",")[0].trim();
    if (firstPath.startsWith("http")) return firstPath;
    const cleanPath = firstPath.startsWith("uploads/") ? firstPath : `uploads/${firstPath}`;
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
    setLoading(true);
    fetch(`${baseUrl}/api/news/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        // Support both { data: ... } and direct object responses
        const fetchedData = json.data ? json.data : json;
        setArticle(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [slug, baseUrl]);

  useEffect(() => {
    if (ads && ads.length > 0) {
      setSidebarAd(ads[Math.floor(Math.random() * ads.length)]);
    } else {
      fetch(`${baseUrl}/api/news`)
        .then(res => res.json())
        .then(json => {
          const allData = Array.isArray(json) ? json : (json.data || []);
          const foundAds = allData.filter(
  (a: any) => a.category?.toLowerCase() === "ads"
);
          if (foundAds.length > 0) {
            setSidebarAd(foundAds[Math.floor(Math.random() * foundAds.length)]);
          }
        });
    }
  }, [ads, baseUrl]);

  if (loading) return <div className="p-20 text-center text-white font-black uppercase italic tracking-widest animate-pulse">Loading Article...</div>;
  if (!article) return <div className="p-20 text-center text-white">Article not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-white grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        
        {/* Navigation */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <Link to="/" className="text-white/40 hover:text-white transition-colors">Home</Link>
          <span className="text-red-600">/</span>
          <span className="text-white/80">{article.category}</span>
        </nav>

        {/* Title Section */}
        <header>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic leading-none tracking-tighter mb-6">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase">
            <span>By Tell News</span>
            <div className="w-1 h-1 bg-red-600 rounded-full" />
            <span>
              {article.CreatedAt ? formatDistanceToNow(new Date(article.CreatedAt), { addSuffix: true }) : "Recently"}
            </span>
          </div>
        </header>

        {/* Media Section */}
        <div className="space-y-6">
          {/* Image Display */}
          {(article.media_type === 'image' || article.media_type === 'both' || !article.media_type) && article.image_url && (
            /*<div className="rounded border border-white/5 overflow-hidden shadow-2xl bg-black/20">
              <img 
                src={getFullImageUrl(article.image_url)} 
                className="w-full h-auto object-cover" 
                alt={article.title} 
              />
            </div>*/
            <div className="rounded border border-white/5 overflow-hidden shadow-2xl bg-black/20 aspect-video">
  <img 
    src={getFullImageUrl(article.image_url)} 
    className="w-full h-full object-cover" 
    alt={article.title}
    fetchPriority="high"
    decoding="async"
  />
</div>
          )}

          {/* Video Display */}
          {(article.media_type === 'video' || article.media_type === 'both' || (article.video_url && !article.media_type)) && article.video_url && (
            <div className="aspect-video bg-black rounded overflow-hidden shadow-2xl border border-white/5">
              <iframe 
                className="w-full h-full" 
                src={article.video_url.includes("watch?v=") 
                  ? article.video_url.replace("watch?v=", "embed/") 
                  : article.video_url} 
                title="Video Content"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen 
              />
            </div>
          )}
        </div>

        {/* Article Body */}
        <article className="text-lg leading-relaxed text-white/80 whitespace-pre-line border-t border-white/10 pt-8">
          <p className="font-bold text-white text-xl mb-8 italic leading-snug border-l-4 border-red-600 pl-6">
            {article.description}
          </p>
          <div className="text-white/70 space-y-4 prose prose-invert max-w-none">
            {article.full_description}
          </div>
        </article>
      </div>

      {/* Sidebar Ad Section */}
      <aside className="lg:col-span-1">
        <div className="sticky top-28 space-y-6">
          <div className="bg-[#1e2333] p-1 border border-white/5 rounded-lg overflow-hidden">
            {sidebarAd ? (
              <Link to={`/ad-details/${sidebarAd.ID}`} className="block group">
                <div className="bg-[#252b3d] p-6 text-center hover:bg-[#2a3145] transition-all">
                  <p className="text-[9px] text-red-500 uppercase tracking-[0.4em] mb-4 font-black">Sponsored</p>
                  <div className="aspect-[3/4] bg-black rounded overflow-hidden mb-4 border border-white/5">
                    <img 
                      src={getFullImageUrl(sidebarAd.image_url)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt="Advertisement" 
                    />
                  </div>
                  <h4 className="text-sm font-black uppercase italic tracking-tighter leading-tight group-hover:text-red-500 transition-colors">
                    {sidebarAd.title}
                  </h4>
                  <button className="mt-4 text-[10px] font-black uppercase border-b border-red-600 pb-1 hover:text-red-500 transition-all">
                    Learn More
                  </button>
                </div>
              </Link>
            ) : (
              <div className="bg-[#252b3d] p-10 text-center border border-dashed border-white/10 rounded-lg">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">Advertisement Space</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ArticleDetail;
