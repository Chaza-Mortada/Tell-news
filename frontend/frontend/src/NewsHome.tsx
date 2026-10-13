import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

interface Article {
  ID: number;
  title: string;
  title_ar?: string;
  title_fr?: string;
  slug: string;
  category: string;
  description: string;
  description_ar?: string;
  description_fr?: string;
  content: string;
  image_url: string;
  link_url?: string;
  is_breaking: boolean;
  CreatedAt: string;
}

const NewsHome: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const { categoryName } = useParams<{ categoryName: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [breakingIndex, setBreakingIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(12);

  const activeView = categoryName
    ? categoryName.charAt(0).toUpperCase() +
      categoryName.slice(1).replace("-", " ")
    : "Home";

  // Helpers to pick the correct language field
  const getDisplayTitle = (article: any) => {
    if (currentLang === "ar") {
      // This checks for both title_ar and Title_ar
      return article.title_ar || article.Title_ar || article.title;
    }
    if (currentLang === "fr") {
      return article.title_fr || article.Title_fr || article.title;
    }
    return article.title;
  };

  /*const getFullImageUrl = (url: string) => {
    if (!url || url === "" || url === "undefined") return "/no-image.jpg";
    const firstPath = url.split(",")[0].trim();
    if (firstPath.startsWith("http")) return firstPath;
    const cleanPath = firstPath.startsWith("uploads/") ? firstPath : `uploads/${firstPath}`;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${baseUrl}/${cleanPath}`;
  };*/

  const getFullImageUrl = (url: string) => {
    if (!url || url === "undefined") {
      return "/no-image.jpg";
    }

    const firstPath = url.split(",")[0].trim();

    if (firstPath.startsWith("http://") || firstPath.startsWith("https://")) {
      return firstPath;
    }

    const baseUrl = (
      import.meta.env.VITE_API_URL || "https://tell-news-1.onrender.com"
    ).replace(/\/+$/, "");

    const cleanPath = firstPath.replace(/^\/+/, "");

    if (cleanPath.startsWith("uploads/")) {
      return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}/uploads/${cleanPath}`;
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    fetch(`${baseUrl}/api/news`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          const fetchedArticles = Array.isArray(json) ? json : json.data;
          setArticles(fetchedArticles || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const newsArticles = articles.filter(
    (a) => a.category?.toLowerCase() !== "ads",
  );
  const sidebarAds = articles.filter(
    (a) => a.category?.toLowerCase() === "ads",
  );
  const breakingNews = newsArticles.filter((a) => a.is_breaking);

  const displayArticles = categoryName
    ? newsArticles.filter(
        (a) => a.category.toLowerCase() === categoryName.toLowerCase(),
      )
    : newsArticles;

  useEffect(() => {
    if (breakingNews.length > 1) {
      const timer = setInterval(() => {
        setBreakingIndex((prev) => (prev + 1) % breakingNews.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [breakingNews.length]);

  const nextSlide = () =>
    setBreakingIndex((prev) => (prev + 1) % breakingNews.length);
  const prevSlide = () =>
    setBreakingIndex(
      (prev) => (prev - 1 + breakingNews.length) % breakingNews.length,
    );

  if (loading)
    return (
      <div className="h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );

  const currentBreaking = breakingNews[breakingIndex] || newsArticles[0];

  return (
    <div
      className={`space-y-10 text-white ${currentLang === "ar" ? "font-arabic" : ""}`}
    >
      {activeView === "Home" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px]">
          {/* --- MAIN SLIDER (Stays Left) --- */}
          <section className="md:col-span-3 relative h-[300px] md:h-[500px] bg-gray-900 overflow-hidden rounded-md group">
            {currentBreaking && (
              <>
                <Link
                  to={`/article/${currentBreaking.slug}`}
                  className="absolute inset-0 z-10 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
                  <img
                    src={getFullImageUrl(currentBreaking.image_url)}
                    className="absolute inset-0 w-full h-full object-cover"
                    //alt="Breaking"
                    alt={getDisplayTitle(currentBreaking)}
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className={`absolute top-6 left-6 z-20 flex gap-2`}>
                    <span className="bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-tighter animate-pulse">
                      {t("breaking_news")}
                    </span>
                  </div>
                  {/* dir="auto" ensures Arabic is RTL and English is LTR inside the text box */}
                  <div
                    className={`absolute bottom-10 left-10 right-10 z-20 max-w-2xl px-4 md:px-0`}
                    dir="auto"
                  >
                    <h1 className="text-2xl md:text-5xl font-black uppercase italic leading-none tracking-tighter mb-4 text-white">
                      {getDisplayTitle(currentBreaking)}
                    </h1>
                    <p className="text-white/70 font-medium uppercase text-xs tracking-widest">
                      {formatDistanceToNow(
                        new Date(currentBreaking.CreatedAt),
                        { addSuffix: true },
                      )}
                    </p>
                  </div>
                </Link>
                <div className="absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className="pointer-events-auto bg-black/50 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className="pointer-events-auto bg-black/50 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </section>

          {/* --- SIDEBAR (Stays Right) --- */}
          <aside className="space-y-6">
            <div className="bg-[#252b3d] p-4 border border-white/5 rounded">
              <h3
                className={`text-red-500 font-black text-[10px] uppercase mb-4 tracking-widest border-b border-white/10 pb-2`}
                dir="auto"
              >
                {t("latest_news")}
              </h3>
              <ul className="space-y-4">
                {/* Updated .slice to (0, 3) to show only 3 items */}
                {newsArticles.slice(0, 3).map((a) => (
                  <li key={a.ID} className="group border-b border-white/5 pb-2">
                    <Link
                      to={`/article/${a.slug}`}
                      className={`text-sm font-bold group-hover:text-red-500 transition-colors line-clamp-2 uppercase block`}
                      dir="auto"
                    >
                      {getDisplayTitle(a)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {sidebarAds.length > 0 ? (
              <Link
                to={`/ad-details/${sidebarAds[0].ID}`}
                className="block group"
              >
                <div className="bg-[#252b3d] p-4 border border-white/10 rounded-lg hover:border-red-600 transition-all shadow-xl">
                  <span className="text-[10px] bg-red-600/10 text-red-500 px-2 py-0.5 rounded font-black uppercase mb-3 block w-fit">
                    {t("sponsored") || "Sponsored"}
                  </span>
                  <div className="aspect-[16/9] overflow-hidden rounded mb-3 bg-black">
                    <img
                      src={getFullImageUrl(sidebarAds[0].image_url)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      //alt="ad"
                      alt="Advertisement"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h4
                    className={`text-sm font-bold uppercase group-hover:text-red-500`}
                    dir="auto"
                  >
                    {/* Also updated the Ad title to be dynamic */}
                    {getDisplayTitle(sidebarAds[0])}
                  </h4>
                </div>
              </Link>
            ) : (
              <div className="h-64 bg-[#1a1f2e] border-2 border-dashed border-white/10 flex items-center justify-center rounded">
                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">
                  {t("advertisement") || "Advertisement"}
                </span>
              </div>
            )}
          </aside>

          {/* --- MAIN GRID --- */}
          <div className="md:col-span-4 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newsArticles.slice(0, visibleCount).map((article) => (
                <Link
                  to={`/article/${article.slug}`}
                  key={article.ID}
                  className="bg-[#252b3d] rounded border border-white/5 group overflow-hidden"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img
                      src={getFullImageUrl(article.image_url)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      //alt="thumb"
                      alt={getDisplayTitle(article)}
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      className={`absolute bottom-2 left-2 bg-red-600 px-2 py-0.5 text-[8px] font-black uppercase`}
                    >
                      {article.category}
                    </div>
                  </div>
                  <div className="p-4" dir="auto">
                    <h4
                      className={`font-bold text-sm uppercase leading-tight line-clamp-2 group-hover:underline`}
                    >
                      {getDisplayTitle(article)}
                    </h4>
                    <p className={`text-[10px] text-white/40 mt-2`}>
                      {formatDistanceToNow(new Date(article.CreatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {visibleCount < newsArticles.length && (
              <div className="flex justify-center pb-10">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="px-8 py-3 border border-red-600 text-red-600 font-bold uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all rounded-md"
                >
                  {t("load_more")}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- CATEGORY VIEW --- */
        <div className="space-y-8">
          <h2
            className={`text-4xl font-black uppercase italic border-l-4 border-red-600 pl-4`}
            dir="auto"
          >
            {activeView} News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayArticles.map((article) => (
              <Link
                to={`/article/${article.slug}`}
                key={article.ID}
                className="group"
              >
                <div className="h-56 bg-gray-800 rounded mb-4 overflow-hidden border border-white/5">
                  <img
                    src={getFullImageUrl(article.image_url)}
                    className="w-full h-full object-cover"
                    alt="img"
                  />
                </div>
                <h3
                  className={`text-xl font-bold uppercase group-hover:text-red-600`}
                  dir="auto"
                >
                  {getDisplayTitle(article)}
                </h3>
                <p className={`text-white/40 text-xs mt-2`} dir="auto">
                  {formatDistanceToNow(new Date(article.CreatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsHome;
