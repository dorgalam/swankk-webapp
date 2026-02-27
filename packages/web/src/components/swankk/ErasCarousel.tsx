import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";

export default function ErasCarousel({ designer }: { designer: any }) {
  const navigate = useNavigate();

  if (!designer.eras?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-8"
    >
      <h3 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">
        Defining Eras
      </h3>

      {designer.eras.map((era: any, eraIndex: number) => {
        const allImages: string[] = era.images || [];

        return (
          <motion.div
            key={eraIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: eraIndex * 0.1 }}
          >
            <div className="mb-4">
              <h4 className="font-serif text-xl md:text-2xl font-medium text-black">
                {era.title}
              </h4>
              <p className="text-gray-400 text-sm mt-1">{era.year_range}</p>
            </div>

            <div className="overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
              <div className="flex gap-3 pb-2">
                {allImages.map((imageUrl: string, imgIndex: number) => (
                  <motion.div
                    key={imgIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: imgIndex * 0.05 }}
                    className="flex-shrink-0 w-40 h-56 md:w-48 md:h-64 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() =>
                      navigate(createPageUrl(`EraGallery?slug=${designer.slug}&era=${eraIndex}`))
                    }
                  >
                    <img
                      src={cdnUrl(imageUrl)}
                      alt={`${era.title} ${imgIndex + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
