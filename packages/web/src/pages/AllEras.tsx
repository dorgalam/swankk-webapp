import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";
import { SlidersHorizontal, X } from "lucide-react";
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
  const [filterDecade, setFilterDecade] = useState<string | null>(null);
  const [filterDesigner, setFilterDesigner] = useState<string | null>(null);
  const [showDesignerPanel, setShowDesignerPanel] = useState(false);

  const { data: allDesigners = [], isLoading } = useQuery({
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
    .filter((e) => !filterDecade || decadeLabel(e.startYear) === filterDecade)
    .filter((e) => !filterDesigner || e.designer.slug === filterDesigner);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
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

        {/* Decade filter + designer filter toggle */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
            <button
              onClick={() => { analytics.era_decade_filter(null); setFilterDecade(null); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                filterDecade === null
                  ? "bg-black text-white border-black"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              All
            </button>
            {decades.map((decade) => (
              <button
                key={decade}
                onClick={() => { const next = filterDecade === decade ? null : decade; analytics.era_decade_filter(next); setFilterDecade(next); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  filterDecade === decade
                    ? "bg-black text-white border-black"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {decade}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDesignerPanel(true)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filterDesigner
                ? "bg-black text-white border-black"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" strokeWidth={1.5} />
            {filterDesigner
              ? designersWithEras.find((d) => d.slug === filterDesigner)?.name
              : "Designer"}
          </button>
        </div>
      </div>

      {/* Era list */}
      <div className="px-5 md:px-8 space-y-10">
        {filtered.map((era, index) => (
          <motion.div
            key={`${era.designer.slug}-${era.eraIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
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
                {era.year_range} · {era.designer.name}
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
                <button
                  onClick={() => setShowDesignerPanel(false)}
                  className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <button
                  onClick={() => {
                    analytics.era_designer_filter(null);
                    setFilterDesigner(null);
                    setShowDesignerPanel(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                    filterDesigner === null
                      ? "text-black font-medium bg-gray-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Designers
                </button>
                {designersWithEras.map((d) => (
                  <button
                    key={d.slug}
                    onClick={() => {
                      analytics.era_designer_filter(d.slug);
                      setFilterDesigner(d.slug);
                      setShowDesignerPanel(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                      filterDesigner === d.slug
                        ? "text-black font-medium bg-gray-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
