import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bookmark, User, X, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export default function TopBar({ currentPageName }: { currentPageName?: string }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: designers = [] } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  const filteredDesigners = (designers as any[]).filter((d: any) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDesignerClick = (designer: any) => {
    setShowSearch(false);
    setSearchQuery("");
    navigate(createPageUrl(`DesignerWorld?slug=${designer.slug}`));
  };

  return (
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

          <Link
            to={createPageUrl("Profile")}
            className="p-2.5 rounded-full hover:bg-gray-50 transition-colors active:bg-gray-100"
            aria-label="Profile"
          >
            <User className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
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
                    placeholder="Search designers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="flex-1 text-[15px] outline-none placeholder:text-gray-300"
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  </button>
                </div>

                {searchQuery.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {filteredDesigners.length > 0 ? (
                      filteredDesigners.map((designer: any) => (
                        <button
                          key={designer.id}
                          onClick={() => handleDesignerClick(designer)}
                          className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <div>
                            <span className="text-[15px] font-medium text-black">
                              {designer.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-400 italic font-light">
                              /{designer.phonetic}/
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300" strokeWidth={1.5} />
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-8">
                        No designers found
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
  );
}
