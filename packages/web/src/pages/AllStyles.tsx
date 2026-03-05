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

  // Build a map of style name → era images from matching designers
  function getStyleImages(styleName: string): string[] {
    const imgs: string[] = [];
    for (const designer of designers as any[]) {
      if (imgs.length >= 4) break;
      const match = (designer.known_for_tags || []).some(
        (t: any) => (t.name || t).toLowerCase() === styleName.toLowerCase()
      );
      if (match) {
        for (const era of designer.eras || []) {
          for (const img of era.images || []) {
            if (imgs.length >= 4) break;
            imgs.push(img);
          }
        }
      }
    }
    return imgs;
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
        {(styles as any[]).filter((style: any) => getStyleImages(style.name).length > 0).map((style: any, index: number) => {
          const images = getStyleImages(style.name);
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
