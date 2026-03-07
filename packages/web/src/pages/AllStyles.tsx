import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";

export default function AllStyles() {
  const navigate = useNavigate();

  const { data: styles = [], isLoading: stylesLoading } = useQuery({
    queryKey: ["styles"],
    queryFn: () => api.styles.list(),
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  if (stylesLoading || designersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // Build a map of style → images using a slug-seeded shuffle so each style
  // shows a distinct set even when designer pools overlap (e.g. Minimalist vs Modernist)
  function getStyleImages(styleName: string, styleSlug: string): string[] {
    // Collect ALL images from matching designers in a stable sorted order
    const pool: string[] = [...(designers as any[])]
      .sort((a: any, b: any) => a.slug.localeCompare(b.slug))
      .flatMap((designer: any) => {
        const match = (designer.known_for_tags || []).some(
          (t: any) => (t.name || t).toLowerCase() === styleName.toLowerCase()
        );
        if (!match) return [];
        return (designer.eras || []).flatMap((era: any) => era.images || []);
      });

    if (pool.length === 0) return [];

    // Slug-seeded Fisher-Yates shuffle for deterministic but style-specific ordering
    let h = 0;
    for (let i = 0; i < styleSlug.length; i++) h = (Math.imul(31, h) + styleSlug.charCodeAt(i)) | 0;
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      h = (Math.imul(1664525, h) + 1013904223) | 0;
      const j = Math.abs(h) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-4xl font-medium text-black"
        >
          Styles
        </motion.h1>
      </div>

      <div className="px-5 md:px-8 space-y-6">
        {(styles as any[]).filter((style: any) => getStyleImages(style.name, style.slug).length > 0).map((style: any, index: number) => {
          const images = getStyleImages(style.name, style.slug);
          return (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="cursor-pointer group"
              onClick={() => navigate(createPageUrl(`TagDiscovery?slug=${style.slug}`))}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-xl text-black group-hover:opacity-70 transition-opacity">
                  {style.name}
                </h2>
              </div>
              {images.length > 0 && (
                <div className="flex gap-1.5 overflow-hidden">
                  {images.map((imgUrl: string, i: number) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden relative"
                    >
                      <ImageWithSkeleton
                        src={cdnUrl(imgUrl)}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && style.description && (
                <p className="text-sm text-gray-400 leading-relaxed max-w-lg line-clamp-2">
                  {style.description}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
