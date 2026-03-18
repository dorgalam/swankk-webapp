import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface EraEntry {
  title: string;
  year_range: string;
  description?: string;
  images: string[];
  startYear: number;
  designer: { id: number; name: string; slug: string };
  eraIndex: number;
}

function parseStartYear(yearRange: string): number {
  const match = yearRange?.match(/\d{4}/);
  return match ? parseInt(match[0]) : 9999;
}

function decadeLabel(year: number): string {
  const d = Math.floor(year / 10) * 10;
  return `${String(d).slice(-2)}s`;
}

function decadeSortKey(label: string): number {
  const n = parseInt(label);
  return n >= 40 ? 1900 + n : 2000 + n;
}

export default function AllEras() {
  const navigate = useNavigate();
  const [filterDecades, setFilterDecades] = useState<string[]>([]);
  const [filterDesigners, setFilterDesigners] = useState<string[]>([]);
  const [showYearPanel, setShowYearPanel] = useState(false);
  const [showDesignerPanel, setShowDesignerPanel] = useState(false);

  const { data: allDesigners = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  const allEras: EraEntry[] = (allDesigners as any[])
    .flatMap((designer: any) =>
      (designer.eras || []).map((era: any, idx: number) => ({
        title: era.title,
        year_range: era.year_range,
        description: era.description,
        images: era.images || [],
        startYear: parseStartYear(era.year_range),
        designer: { id: designer.id, name: designer.name, slug: designer.slug },
        eraIndex: idx,
      }))
    )
    .filter((e: EraEntry) => e.images.length > 0)
    .sort((a: EraEntry, b: EraEntry) => a.startYear - b.startYear);

  const decades = Array.from(new Set(allEras.map((e) => decadeLabel(e.startYear)))).sort(
    (a, b) => decadeSortKey(a) - decadeSortKey(b)
  );

  const designersWithEras = Array.from(
    new Map(allEras.map((e) => [e.designer.slug, e.designer])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const filtered = allEras
    .filter((e) => filterDecades.length === 0 || filterDecades.includes(decadeLabel(e.startYear)))
    .filter((e) => filterDesigners.length === 0 || filterDesigners.includes(e.designer.slug));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 gap-4">
        <p className="text-gray-500 text-sm">Failed to load eras.</p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2 bg-black text-white text-sm rounded-full"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-4xl font-medium text-black mb-6"
        >
          Eras
        </motion.h1>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowYearPanel(true)}
            style={{ touchAction: 'manipulation' }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filterDecades.length > 0
                ? "bg-black text-white border-black"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" strokeWidth={1.5} />
            {filterDecades.length === 0
              ? "Year"
              : filterDecades.length === 1
              ? filterDecades[0]
              : filterDecades.length <= 3
              ? filterDecades.join(" · ")
              : `${filterDecades.slice(0, 2).join(" · ")} +${filterDecades.length - 2}`}
          </button>

          <button
            onClick={() => setShowDesignerPanel(true)}
            style={{ touchAction: 'manipulation' }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filterDesigners.length > 0
                ? "bg-black text-white border-black"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" strokeWidth={1.5} />
            {filterDesigners.length === 0
              ? "Designer"
              : filterDesigners.length <= 2
              ? filterDesigners.map((s) => designersWithEras.find((d) => d.slug === s)?.name).join(" · ")
              : `${filterDesigners.map((s) => designersWithEras.find((d) => d.slug === s)?.name).slice(0, 2).join(" · ")} +${filterDesigners.length - 2}`}
          </button>
        </div>
      </div>

      {/* Era list */}
      <div className="px-5 md:px-8 space-y-10">
        {filtered.map((era, index) => (
          <motion.div
            key={`${era.designer.slug}-${era.eraIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.6) }}
          >
            <div
              className="mb-3 cursor-pointer"
              onClick={() =>
                navigate(
                  createPageUrl(`EraGallery?slug=${era.designer.slug}&era=${era.eraIndex}`)
                )
              }
            >
              <h2 className="font-serif text-xl md:text-2xl font-medium text-black">
                {era.title}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {era.year_range} ·{" "}
                <Link
                  to={createPageUrl(`DesignerWorld?slug=${era.designer.slug}`)}
                  className="hover:text-black transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {era.designer.name}
                </Link>
              </p>
            </div>

            <div className="relative -mx-5 md:-mx-8">
              <div className="overflow-x-auto scrollbar-hide px-5 md:px-8">
                <div className="flex gap-3 pb-2">
                  {era.images.slice(0, 6).map((img, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[200px] group cursor-pointer"
                      onClick={() =>
                        navigate(
                          createPageUrl(
                            `ImageDetail?slug=${era.designer.slug}&era=${era.eraIndex}&image=${i}`
                          )
                        )
                      }
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden">
                        <ImageWithSkeleton
                          src={cdnUrl(img)}
                          alt={`${era.title} ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-12 text-center">No eras found.</p>
        )}
      </div>

      {/* Year filter side panel */}
      <AnimatePresence>
        {showYearPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/30"
              onClick={() => setShowYearPanel(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-[61] w-72 bg-white shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-medium text-black">Filter by Year</p>
                <div className="flex items-center gap-2">
                  {filterDecades.length > 0 && (
                    <button
                      onClick={() => { analytics.era_decade_filter(null); setFilterDecades([]); }}
                      className="text-xs text-gray-400 hover:text-black transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowYearPanel(false)}
                    className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {decades.map((decade) => {
                  const selected = filterDecades.includes(decade);
                  return (
                    <button
                      key={decade}
                      style={{ touchAction: 'manipulation' }}
                      onClick={() => {
                        analytics.era_decade_filter(decade);
                        setFilterDecades((prev) =>
                          selected ? prev.filter((d) => d !== decade) : [...prev, decade]
                        );
                      }}
                      className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                        selected ? "text-black font-medium bg-gray-50" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{decade}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-black" strokeWidth={2} />}
                    </button>
                  );
                })}
              </div>
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={() => setShowYearPanel(false)}
                  className="w-full py-2.5 bg-black text-white text-sm rounded-full"
                >
                  {filterDecades.length === 0 ? "Show All" : "Show Results"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Designer filter side panel */}
      <AnimatePresence>
        {showDesignerPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/30"
              onClick={() => setShowDesignerPanel(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-[61] w-72 bg-white shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-medium text-black">Filter by Designer</p>
                <div className="flex items-center gap-2">
                  {filterDesigners.length > 0 && (
                    <button
                      onClick={() => { setFilterDesigners([]); }}
                      className="text-xs text-gray-400 hover:text-black transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowDesignerPanel(false)}
                    className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {designersWithEras.map((d) => {
                  const selected = filterDesigners.includes(d.slug);
                  return (
                    <button
                      key={d.slug}
                      onClick={() => {
                        analytics.era_designer_filter(d.slug);
                        setFilterDesigners((prev) =>
                          selected ? prev.filter((s) => s !== d.slug) : [...prev, d.slug]
                        );
                      }}
                      className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                        selected ? "text-black font-medium bg-gray-50" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{d.name}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-black" strokeWidth={2} />}
                    </button>
                  );
                })}
              </div>
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDesignerPanel(false)}
                  className="w-full py-2.5 bg-black text-white text-sm rounded-full"
                >
                  {filterDesigners.length === 0 ? "Show All" : `Show Results`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
