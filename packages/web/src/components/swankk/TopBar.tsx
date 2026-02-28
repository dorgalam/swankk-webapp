import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bookmark, Menu, X, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import Sidebar from "./Sidebar";

const TYPE_LABELS: Record<string, string> = {
  designer: "Designer",
  trend: "Trend",
  style: "Style",
};

export default function TopBar({ currentPageName }: { currentPageName?: string }) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: designers = [] } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  const { data: trends = [] } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.trends.list(),
  });

  const { data: styles = [] } = useQuery({
    queryKey: ["styles"],
    queryFn: () => api.styles.list(),
  });

  const q = searchQuery.toLowerCase();

  const results: { type: string; id: string; name: string; sub?: string; slug: string }[] =
    searchQuery.length < 1
      ? []
      : [
          ...(designers as any[])
            .filter((d: any) => d.name.toLowerCase().includes(q))
            .map((d: any) => ({ type: "designer", id: `d_${d.id}`, name: d.name, sub: `/${d.phonetic}/`, slug: d.slug })),
          ...(trends as any[])
            .filter((t: any) => t.name.toLowerCase().includes(q))
            .map((t: any) => ({ type: "trend", id: `t_${t.id}`, name: t.name, slug: t.slug })),
          ...(styles as any[])
            .filter((s: any) => s.name.toLowerCase().includes(q))
            .map((s: any) => ({ type: "style", id: `s_${s.id}`, name: s.name, slug: s.slug })),
        ];

  const handleResultClick = (result: typeof results[number]) => {
    setShowSearch(false);
    setSearchQuery("");
    if (result.type === "designer") {
      navigate(createPageUrl(`DesignerWorld?slug=${result.slug}`));
    } else if (result.type === "trend") {
      navigate(createPageUrl(`TrendDetail?slug=${result.slug}`));
    } else {
      navigate(createPageUrl(`TagDiscovery?slug=${result.slug}`));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 pointer-events-auto">
        <div className="flex items-center justify-between px-5 md:px-8 h-14">
          <Link to={createPageUrl("Home")} className="flex items-center py-2 z-10 relative">
            <span className="font-serif text-[17px] tracking-[0.15em] font-medium text-black">
              SWANKK
            </span>
          </Link>

          <div className="flex items-center gap-0.5 z-10 relative">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2.5 rounded-full hover:bg-gray-50 transition-colors active:bg-gray-100"
              aria-label="Search"
            >
              <Search className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
            </button>

            <Link
              to={createPageUrl("Saved")}
              className="p-2.5 rounded-full hover:bg-gray-50 transition-colors active:bg-gray-100"
              aria-label="Saved"
            >
              <Bookmark className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
            </Link>

            <button
              onClick={() => setShowSidebar(true)}
              className="p-2.5 rounded-full hover:bg-gray-50 transition-colors active:bg-gray-100"
              aria-label="Menu"
            >
              <Menu className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
              onClick={() => { setShowSearch(false); setSearchQuery(""); }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-lg"
              >
                <div className="w-full px-5 md:px-8 py-4 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <Search className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder="Search designers, trends, styles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="flex-1 text-[15px] outline-none placeholder:text-gray-300"
                    />
                    <button
                      onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                      className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    </button>
                  </div>

                  {searchQuery.length > 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      {results.length > 0 ? (
                        results.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-[11px] font-medium tracking-wider uppercase text-gray-300 w-16 shrink-0">
                                {TYPE_LABELS[result.type]}
                              </span>
                              <span className="text-[15px] font-medium text-black truncate">
                                {result.name}
                              </span>
                              {result.sub && (
                                <span className="text-xs text-gray-400 italic font-light shrink-0">
                                  {result.sub}
                                </span>
                              )}
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0 ml-2" strokeWidth={1.5} />
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-8">
                          No results found
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
}
