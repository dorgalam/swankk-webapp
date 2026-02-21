import React, { useEffect } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EraGallery() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "";
  const eraIndex = parseInt(urlParams.get("era") || "0");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, eraIndex]);

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designer", slug],
    queryFn: () => api.designers.filter({ slug }),
  });

  const designer = designers[0] as any;
  const era = designer?.eras?.[eraIndex];
  const eraImages: string[] = era?.images || [];

  const allDesignerImages = designer?.eras?.flatMap((e: any, idx: number) => {
    if (idx === eraIndex) return [];
    return (e.images || []).map((url: string, imgIdx: number) => ({
      image_url: url,
      eraTitle: e.title,
      eraIndex: idx,
      imageIndex: imgIdx,
    }));
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!designer || !era) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="font-serif text-2xl text-black mb-2">Era not found</p>
        <Link
          to={createPageUrl("Home")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const handleImageClick = (imageIndex: number) => {
    navigate(createPageUrl(`ImageDetail?slug=${slug}&era=${eraIndex}&image=${imageIndex}`));
  };

  const handleMoreImageClick = (img: any) => {
    navigate(createPageUrl(`ImageDetail?slug=${slug}&era=${img.eraIndex}&image=${img.imageIndex}`));
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 md:px-8 pt-6 pb-8">
        <button
          onClick={() => {
            navigate(-1);
            setTimeout(() => window.scrollTo(0, 0), 0);
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-black mb-2">
            {era.title}
          </h1>
          <p className="text-sm text-gray-400 mb-4">
            {era.year_range} · {designer.name}
          </p>
          {era.description && (
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
              {era.description}
            </p>
          )}
        </motion.div>
      </div>

      <div className="px-5 md:px-8">
        <div className="grid grid-cols-2 gap-3 mb-16">
          {eraImages.map((imgUrl: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => handleImageClick(index)}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <img
                  src={imgUrl}
                  alt={`${era.title} ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {allDesignerImages.length > 0 && (
        <div className="px-5 md:px-8 border-t border-gray-100 pt-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
            More of {designer.name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allDesignerImages.slice(0, 9).map((img: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => handleMoreImageClick(img)}
              >
                <img
                  src={img.image_url}
                  alt={img.eraTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
