import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SignaturePieces({ designer }: { designer: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!designer.signature_pieces?.length) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">
          Signature Pieces
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
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-5 px-5 md:-mx-8 md:px-8"
      >
        {designer.signature_pieces.map((piece: any, i: number) => (
          <a
            key={i}
            href={piece.link || piece.farfetch_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-56 group cursor-pointer"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
              <img
                src={piece.image_url}
                alt={piece.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <p className="text-sm font-medium text-black leading-tight line-clamp-2">{piece.name}</p>
          </a>
        ))}
      </div>
    </motion.section>
  );
}
