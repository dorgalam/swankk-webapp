import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cdnUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { useBookmarks } from "@/lib/BookmarksContext";
import type { BookmarkCategory } from "@/lib/bookmarks";

const TABS: { key: BookmarkCategory; label: string }[] = [
  { key: "images", label: "Images" },
  { key: "products", label: "Products" },
  { key: "styles", label: "Styles" },
  { key: "designers", label: "Designers" },
];

export default function Saved() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { getItems, toggle, isLoaded } = useBookmarks();
  const [activeTab, setActiveTab] = useState<BookmarkCategory>("images");

  const items = getItems(activeTab);

  const handleRemove = async (id: string, item: any) => {
    await toggle(activeTab, id, item);
  };

  const handleItemClick = (item: any) => {
    if (activeTab === "images" && item.linkTo) {
      navigate(item.linkTo);
    } else if (activeTab === "designers" && item.slug) {
      navigate(`/DesignerWorld?slug=${item.slug}`);
    } else if (activeTab === "products" && item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    } else if (activeTab === "styles" && item.slug) {
      if (item.type === "trend") {
        navigate(`/TrendDetail?slug=${item.slug}`);
      } else if (item.type === "era") {
        navigate(`/EraGallery?slug=${item.designerSlug}&era=${item.eraIndex}`);
      } else {
        navigate(`/TagDiscovery?slug=${item.slug}`);
      }
    }
  };

  if (isLoadingAuth || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
        <p className="font-serif text-2xl text-black mb-2">Save your favourites</p>
        <p className="text-sm text-gray-400 mb-6">Sign in to keep your bookmarks across devices.</p>
        <button
          onClick={() => navigate("/Login")}
          className="px-6 py-3 bg-black text-white text-sm rounded-full tracking-wider hover:bg-gray-900 transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] pb-20">
      <div className="px-5 md:px-8 pt-8 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl text-black mb-6">Saved</h1>

        <div className="flex gap-1 border-b border-gray-100">
          {TABS.map(({ key, label }) => {
            const count = getItems(key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  activeTab === key ? "text-black" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">({count})</span>
                )}
                {activeTab === key && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 md:px-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">Nothing saved yet.</p>
            <p className="text-xs text-gray-300 mt-1">
              Tap the bookmark icon on any image, designer, or product.
            </p>
          </div>
        ) : (
          <div
            className={
              activeTab === "designers" || activeTab === "styles"
                ? "grid grid-cols-1 gap-2"
                : "grid grid-cols-2 md:grid-cols-3 gap-4"
            }
          >
            {items.map((item: any) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group relative"
              >
                {activeTab === "designers" ? (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {item.imageUrl ? (
                        <img src={cdnUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-serif text-xl text-gray-300">{item.name?.[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base text-black">{item.name}</p>
                      {item.phonetic && <p className="text-xs text-gray-400 italic">/{item.phonetic}/</p>}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.id, item); }}
                      className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                    >
                      <X className="w-3 h-3 text-gray-500" strokeWidth={2} />
                    </button>
                  </div>
                ) : activeTab === "styles" ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl && (
                        <div className="w-10 h-14 rounded-md overflow-hidden shrink-0">
                          <img src={cdnUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-serif text-base text-black">{item.name}</p>
                        <p className="text-[11px] tracking-wider uppercase text-gray-400">{item.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.id, item); }}
                      className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                    >
                      <X className="w-3 h-3 text-gray-500" strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div className="cursor-pointer" onClick={() => handleItemClick(item)}>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                      {item.imageUrl ? (
                        <img
                          src={cdnUrl(item.imageUrl)}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-serif text-2xl text-gray-300">
                            {(item.title || item.name)?.[0]}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(item.id, item); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <X className="w-3 h-3 text-gray-600" strokeWidth={2} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-black mt-2 leading-tight line-clamp-2">
                      {item.title || item.name}
                    </p>
                    {(item.subtitle || item.brand) && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.subtitle || item.brand}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
