import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";

export default function AllTrends() {
  const navigate = useNavigate();

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.trends.list(),
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
          Trends
        </motion.h1>
      </div>

      <div className="px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(trends as any[]).map((trend: any, index: number) => {
            const previewImg = (trend.images || trend.preview_images || [])[0];
            return (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group cursor-pointer"
                onClick={() => navigate(createPageUrl(`TrendDetail?slug=${trend.slug}`))}
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-2">
                  <ImageWithSkeleton
                    src={cdnUrl(previewImg)}
                    alt={trend.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="font-serif text-base text-black leading-tight">{trend.name}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
