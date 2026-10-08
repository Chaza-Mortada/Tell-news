import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AdsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<any>(null);

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
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    fetch(`${baseUrl}/api/ads/${id}`)
      .then(res => res.json())
      .then(data => setAd(data.data || data));
  }, [id]);

  if (!ad) return <div className="p-20 text-center text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white min-h-screen">
      {/* Media Section */}
      <div className="mb-8">
        {ad.image_url && (
          <img 
            src={getFullImageUrl(ad.image_url)} 
            className="w-full max-h-[500px] object-contain bg-black rounded-xl border border-white/10" 
            alt={ad.title} 
          />
        )}
        
        {/* Support for video ads */}
        {ad.video_url && (
          <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10">
            <iframe 
              className="w-full h-full" 
              src={ad.video_url.replace("watch?v=", "embed/")} 
              allowFullScreen 
            />
          </div>
        )}
      </div>

      <h1 className="text-5xl font-black uppercase italic mb-6 border-l-4 border-red-600 pl-4">{ad.title}</h1>
      
      <div className="bg-[#252b3d] p-8 rounded-xl border border-white/10 mb-8 shadow-2xl">
        <p className="text-white/70 leading-relaxed text-xl whitespace-pre-line">
          {ad.description}
        </p>
      </div>

      {ad.link_url ? (
  <a 
    href={ad.link_url.startsWith('http') ? ad.link_url : `https://${ad.link_url}`} 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-block w-full md:w-auto text-center bg-red-600 text-white px-12 py-5 rounded-lg font-black uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all transform hover:scale-105 shadow-lg"
  >
    Visit Official Link
  </a>
) : (
  <p className="text-white/20 italic text-sm">No external link provided for this ad.</p>
)}
    </div>
  );
};

export default AdsDetails;