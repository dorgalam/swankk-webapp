import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";

export default function AllColors() {
  const navigate = useNavigate();

  const { data: colors = [], isLoading } = useQuery({
    queryKey: ["colors"],
    queryFn: () => api.colors.list(),
  });

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
          className="font-serif text-3xl md:text-4xl font-medium text-black"
        >
          Colors
        </motion.h1>
      </div>

      <div className="px-5 md:px-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        {(colors as any[]).map((color: any, index: number) => {
          const previewImage = (color.images || [])[0] || color.main_image_url;
          return (
            <motion.div
              key={color.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="cursor-pointer group"
              onClick={() => navigate(createPageUrl(`ColorDetail?slug=${color.slug}`))}
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                {previewImage ? (
                  <ImageWithSkeleton
                    src={cdnUrl(previewImage)}
                    alt={color.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: color.hex || "#e5e5e5" }}
                  />
                )}
                {color.hex && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-[10px] font-mono text-gray-700 tracking-wide">
                      <span
                        className="w-3 h-3 rounded-full border border-white/60 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.hex.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-serif text-base text-black group-hover:opacity-70 transition-opacity">
                {color.name}
              </p>
              {color.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {color.description}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {(colors as any[]).length === 0 && (
        <div className="px-5 md:px-8 py-16 text-center">
          <p className="text-gray-400 text-sm">No colors added yet.</p>
        </div>
      )}
    </div>
  );
}
