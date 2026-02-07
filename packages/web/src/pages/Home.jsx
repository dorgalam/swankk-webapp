import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import PronunciationCard from "@/components/swankk/PronunciationCard";
import RequestDesignerForm from "@/components/swankk/RequestDesignerForm";

export default function Home() {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const inputRef = useRef(null);

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  const filtered = designers.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = query.length > 0 && filtered.length > 0;
  const noResults = query.length > 1 && filtered.length === 0;

  const handleSelect = (designer) => {
    setSelectedDesigner(designer);
    setQuery(designer.name);
    setShowDropdown(false);
    setShowRequest(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
    setSelectedDesigner(null);
    setShowRequest(false);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-light mb-3"
            >
              The Little Book Of
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-serif text-[2.5rem] md:text-5xl font-medium text-black leading-[1.15] mb-3"
            >
              How do you
              <br />
              <em className="font-light italic">pronounce…</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-[13px] text-gray-400 mb-6 font-light leading-relaxed"
            >
              Your pocket guide to fashion's most iconic houses
            </motion.p>
          </div>

          {/* Search input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative mb-6"
          >
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
                strokeWidth={1.5}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search a designer…"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-11 pr-4 py-3.5 text-[15px] border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-300 transition-colors bg-white placeholder:text-gray-300"
              />
            </div>

            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {showDropdown && query.length > 0 && !selectedDesigner && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-20"
                >
                  {hasResults ? (
                    filtered.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(d)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div>
                          <span className="text-[15px] font-medium text-black">
                            {d.name}
                          </span>
                          <span className="ml-2 text-xs text-gray-400 italic font-light">
                            /{d.phonetic}/
                          </span>
                        </div>
                        <ArrowRight
                          className="w-3.5 h-3.5 text-gray-300"
                          strokeWidth={1.5}
                        />
                      </button>
                    ))
                  ) : noResults ? (
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowRequest(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm text-gray-500">
                        Can't find "{query}"?
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tap to request this designer →
                      </p>
                    </button>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {selectedDesigner && (
              <PronunciationCard
                key={selectedDesigner.id}
                designer={selectedDesigner}
              />
            )}
            {showRequest && (
              <RequestDesignerForm key="request" designerName={query} />
            )}
          </AnimatePresence>
        </div>
      </div>


    </div>
  );
}
