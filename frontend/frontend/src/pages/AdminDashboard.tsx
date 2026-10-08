import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

type Tab = "news" | "ads";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("news");
  const [formLang, setFormLang] = useState<"en" | "ar" | "fr">("en");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [newsData, setNewsData] = useState({
    title: "",
    title_ar: "",
    title_fr: "",
    category: "Art",
    description: "",
    description_ar: "",
    description_fr: "",
    fullDescription: "",
    fullDescription_ar: "",
    fullDescription_fr: "",
    mediaUrl: "",
    isBreaking: false,
  });

  const [adData, setAdData] = useState({
    adTitle: "",
    adTitle_ar: "",
    adTitle_fr: "",
    description: "",
    description_ar: "",
    description_fr: "",
    targetUrl: "",
  });

  const fetchArticles = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/news`);
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEditClick = (article: any) => {
    setEditingSlug(article.slug);
    if (article.category === "Ads") {
      setActiveTab("ads");
      setAdData({
        adTitle: article.title || "",
        adTitle_ar: article.title_ar || "",
        adTitle_fr: article.title_fr || "",
        description: article.description || "",
        description_ar: article.description_ar || "",
        description_fr: article.description_fr || "",
        targetUrl: article.link_url || "",
      });
    } else {
      setActiveTab("news");
      // Map database fields (underscored) to form state (camelCase)
      setNewsData({
        title: article.title || "",
        title_ar: article.title_ar || "",
        title_fr: article.title_fr || "",
        description: article.description || "",
        description_ar: article.description_ar || "",
        description_fr: article.description_fr || "",
        fullDescription: article.full_description || "",
        fullDescription_ar: article.full_description_ar || "",
        fullDescription_fr: article.full_description_fr || "",
        category: article.category,
        mediaUrl: article.video_url || "",
        isBreaking: article.is_breaking,
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await fetch(`${baseUrl}/api/news/${slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        alert("Deleted!");
        fetchArticles();
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setMediaFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".webp"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
  });

  const removeFile = (name: string) => {
    setMediaFiles((files) => files.filter((f) => f.name !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();

    if (activeTab === "news") {
      formData.append("category", newsData.category);
      formData.append("title", newsData.title);
      formData.append("title_ar", newsData.title_ar);
      formData.append("title_fr", newsData.title_fr);
      formData.append("description", newsData.description);
      formData.append("description_ar", newsData.description_ar);
      formData.append("description_fr", newsData.description_fr);
      formData.append("full_description", newsData.fullDescription);
      formData.append("full_description_ar", newsData.fullDescription_ar);
      formData.append("full_description_fr", newsData.fullDescription_fr);
      formData.append("video_url", newsData.mediaUrl);
      formData.append("is_breaking", String(newsData.isBreaking));
    } else {
      formData.append("category", "Ads");
      formData.append("title", adData.adTitle);
      formData.append("title_ar", adData.adTitle_ar);
      formData.append("title_fr", adData.adTitle_fr);
      formData.append("description", adData.description);
      formData.append("description_ar", adData.description_ar);
      formData.append("description_fr", adData.description_fr);
      formData.append("link_url", adData.targetUrl);
    }

    mediaFiles.forEach((file) => formData.append("media_files", file));

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const url = editingSlug
      ? `${baseUrl}/api/news/${editingSlug}`
      : `${baseUrl}/api/news`;
    const method = editingSlug ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        alert(
          editingSlug ? "Updated Successfully!" : "Published Successfully!",
        );
        setEditingSlug(null);
        // Clear all fields
        setNewsData({
          title: "",
          title_ar: "",
          title_fr: "",
          category: "Art",
          description: "",
          description_ar: "",
          description_fr: "",
          fullDescription: "",
          fullDescription_ar: "",
          fullDescription_fr: "",
          mediaUrl: "",
          isBreaking: false,
        });
        setAdData({
          adTitle: "",
          adTitle_ar: "",
          adTitle_fr: "",
          description: "",
          description_ar: "",
          description_fr: "",
          targetUrl: "",
        });
        setMediaFiles([]);
        fetchArticles();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to save"}`);
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-[#1a1f2e] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase italic border-b-2 border-red-600 inline-block">
          {editingSlug ? "Editing Item" : "Admin Terminal"}
        </h1>
        <div className="flex bg-[#252b3d] rounded-lg p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("news")}
            className={`px-6 py-2 rounded-md font-bold text-xs ${activeTab === "news" ? "bg-red-600" : ""}`}
          >
            News
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ads")}
            className={`px-6 py-2 rounded-md font-bold text-xs ${activeTab === "ads" ? "bg-red-600" : ""}`}
          >
            Ads
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6 bg-[#252b3d] p-8 rounded-lg">
          <div className="flex bg-[#1a1f2e] p-1 rounded-md border border-white/5 w-fit">
            {(["en", "ar", "fr"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setFormLang(lang)}
                className={`px-4 py-1.5 rounded text-[10px] font-black uppercase transition-all ${formLang === lang ? "bg-red-600 text-white" : "text-white/40 hover:text-white"}`}
              >
                {lang === "en"
                  ? "English"
                  : lang === "ar"
                    ? "Arabic"
                    : "French"}
              </button>
            ))}
          </div>

          {activeTab === "news" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select
                  className="bg-[#1a1f2e] border border-white/10 p-3 rounded text-white"
                  value={newsData.category}
                  onChange={(e) =>
                    setNewsData({ ...newsData, category: e.target.value })
                  }
                >
                  <option>Art</option>
                  <option>Social</option>
                  <option>Scientific</option>
                  <option>Cultural</option>
                  <option>UIT</option>
                </select>
                <div className="flex items-center gap-2 bg-[#1a1f2e] p-3 rounded border border-white/10">
                  <input
                    type="checkbox"
                    id="breaking"
                    checked={newsData.isBreaking}
                    onChange={(e) =>
                      setNewsData({ ...newsData, isBreaking: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="breaking"
                    className="text-xs uppercase font-bold text-red-500 cursor-pointer"
                  >
                    Mark as Breaking News
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {formLang === "en" && (
                  <div className="space-y-4">
                    <input
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded"
                      placeholder="Title (EN)"
                      value={newsData.title}
                      onChange={(e) =>
                        setNewsData({ ...newsData, title: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded h-20"
                      placeholder="Short Description (EN)"
                      value={newsData.description}
                      onChange={(e) =>
                        setNewsData({
                          ...newsData,
                          description: e.target.value,
                        })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded aspect-[16/9]"
                      placeholder="Full Content (EN)"
                      value={newsData.fullDescription}
                      onChange={(e) =>
                        setNewsData({
                          ...newsData,
                          fullDescription: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                {formLang === "ar" && (
                  <div className="space-y-4" dir="rtl">
                    <input
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded text-right font-arabic"
                      placeholder="العنوان (AR)"
                      value={newsData.title_ar}
                      onChange={(e) =>
                        setNewsData({ ...newsData, title_ar: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded h-20 text-right font-arabic"
                      placeholder="الوصف (AR)"
                      value={newsData.description_ar}
                      onChange={(e) =>
                        setNewsData({
                          ...newsData,
                          description_ar: e.target.value,
                        })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded aspect-[16/9] text-right font-arabic"
                      placeholder="المحتوى الكامل (AR)"
                      value={newsData.fullDescription_ar}
                      onChange={(e) =>
                        setNewsData({
                          ...newsData,
                          fullDescription_ar: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                {formLang === "fr" && (
                  <div className="space-y-4">
                    <input
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded"
                      placeholder="Titre (FR)"
                      value={newsData.title_fr}
                      onChange={(e) =>
                        setNewsData({ ...newsData, title_fr: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded h-20"
                      placeholder="Description (FR)"
                      value={newsData.description_fr}
                      onChange={(e) =>
                        setNewsData({
                          ...newsData,
                          description_fr: e.target.value,
                        })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded aspect-[16/9]"
                      placeholder="Contenu (FR)"
                      value={newsData.fullDescription_fr}
                      onChange={(e) =>
                        setNewsData({
                          ...newsData,
                          fullDescription_fr: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <input
                className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded text-xs"
                placeholder="Global Target URL (e.g., https://site.com)"
                value={adData.targetUrl}
                onChange={(e) =>
                  setAdData({ ...adData, targetUrl: e.target.value })
                }
              />
              <div className="space-y-4">
                {formLang === "en" && (
                  <div className="space-y-4">
                    <input
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded"
                      placeholder="Ad Title (EN)"
                      value={adData.adTitle}
                      onChange={(e) =>
                        setAdData({ ...adData, adTitle: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded h-24"
                      placeholder="Ad Description (EN)"
                      value={adData.description}
                      onChange={(e) =>
                        setAdData({ ...adData, description: e.target.value })
                      }
                    />
                  </div>
                )}
                {formLang === "ar" && (
                  <div className="space-y-4" dir="rtl">
                    <input
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded text-right font-arabic"
                      placeholder="عنوان الإعلان (AR)"
                      value={adData.adTitle_ar}
                      onChange={(e) =>
                        setAdData({ ...adData, adTitle_ar: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded h-24 text-right font-arabic"
                      placeholder="وصف الإعلان (AR)"
                      value={adData.description_ar}
                      onChange={(e) =>
                        setAdData({ ...adData, description_ar: e.target.value })
                      }
                    />
                  </div>
                )}
                {formLang === "fr" && (
                  <div className="space-y-4">
                    <input
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded"
                      placeholder="Titre de l'annonce (FR)"
                      value={adData.adTitle_fr}
                      onChange={(e) =>
                        setAdData({ ...adData, adTitle_fr: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full bg-[#1a1f2e] border border-white/10 p-3 rounded h-24"
                      placeholder="Description de l'annonce (FR)"
                      value={adData.description_fr}
                      onChange={(e) =>
                        setAdData({ ...adData, description_fr: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#252b3d] p-6 rounded-lg border border-white/5">
            <label className="block mb-4 text-xs font-bold uppercase text-red-500 tracking-widest">
              Media Assets
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${isDragActive ? "border-red-500 bg-red-500/10" : "border-white/10 hover:border-white/30"}`}
            >
              <input {...getInputProps()} />
              <p className="text-sm font-medium">Drag & drop files</p>
            </div>
            <div className="mt-4 space-y-2">
              {mediaFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex justify-between items-center bg-[#1a1f2e] p-2 rounded text-[10px] border border-white/5"
                >
                  <span className="truncate w-40">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="text-red-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block mb-2 text-[10px] font-bold uppercase text-white/40">
                Or provide Video URL
              </label>
              <input
                className="w-full bg-[#1a1f2e] border border-white/10 p-2 rounded text-xs"
                placeholder="https://youtube.com/..."
                value={newsData.mediaUrl}
                onChange={(e) =>
                  setNewsData({ ...newsData, mediaUrl: e.target.value })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-black py-4 rounded-lg bg-red-600 uppercase tracking-widest transition-all ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 active:scale-95"}`}
          >
            {isSubmitting
              ? "Processing..."
              : editingSlug
                ? "Update Item"
                : `Publish ${activeTab}`}
          </button>
        </div>
      </form>

      {/* Articles Table */}
      <div className="mt-16 bg-[#252b3d] rounded-lg border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1a1f2e] text-[10px] uppercase text-white/40">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {articles.map((article) => (
              <tr
                key={article.ID}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="p-4 font-bold text-sm">{article.title}</td>
                <td className="p-4">
                  <span className="text-[10px] bg-red-600/20 text-red-500 px-2 py-1 rounded">
                    {article.category}
                  </span>
                </td>
                <td className="p-4 text-right space-x-4">
                  <button
                    onClick={() => handleEditClick(article)}
                    className="text-[10px] uppercase font-bold hover:text-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article.slug)}
                    className="text-[10px] uppercase font-bold text-red-600 hover:text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
