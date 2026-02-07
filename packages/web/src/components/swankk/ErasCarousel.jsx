import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import SaveButton from "./SaveButton";

export default function ErasCarousel({ designer }) {
  const scrollRef = useRef(null);
  const [selectedEra, setSelectedEra] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  if (!designer.eras?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">
          Defining Eras
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5 md:-mx-8 md:px-8 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {designer.eras.map((era, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 md:w-72 snap-start cursor-pointer group"
            onClick={() => setSelectedEra(era)}
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
              <img
                src={era.image_url}
                alt={era.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-medium">{era.title}</p>
                <p className="text-white/60 text-xs mt-0.5">{era.year_range}</p>
              </div>
              <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                <SaveButton
                  itemType="era_image"
                  designerId={designer.id}
                  title={`${designer.name} — ${era.title}`}
                  imageUrl={era.image_url}
                  subtitle={era.year_range}
                  iconColor="white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {selectedEra && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={() => setSelectedEra(null)}
          >
            <div className="flex justify-end p-4">
              <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" strokeWidth={1.5} />
              </button>
            </div>
            <div
              className="flex-1 flex flex-col items-center justify-center px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedEra.image_url}
                alt={selectedEra.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
              <div className="mt-6 text-center max-w-md">
                <p className="text-white font-serif text-lg">{selectedEra.title}</p>
                <p className="text-white/40 text-xs mt-1 mb-3">{selectedEra.year_range}</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {selectedEra.caption}
                </p>
                {selectedEra.credit && (
                  <p className="text-white/30 text-[10px] tracking-wider mt-3 uppercase">
                    {selectedEra.credit}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}