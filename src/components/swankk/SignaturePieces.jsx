import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import SaveButton from "./SaveButton";

export default function SignaturePieces({ designer }) {
  if (!designer.signature_pieces?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
        Signature Pieces
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {designer.signature_pieces.map((piece, i) => (
          <div key={i} className="group">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
              <img
                src={piece.image_url}
                alt={piece.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-2.5 right-2.5">
                <SaveButton
                  itemType="product"
                  designerId={designer.id}
                  title={piece.name}
                  imageUrl={piece.image_url}
                  subtitle={piece.brand}
                  externalUrl={piece.farfetch_url}
                />
              </div>
            </div>
            <p className="text-sm font-medium text-black leading-tight">{piece.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{piece.brand}</p>
            {piece.price && (
              <p className="text-xs text-gray-500 mt-0.5">{piece.price}</p>
            )}
            {piece.farfetch_url && (
              <a
                href={piece.farfetch_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-medium text-black hover:text-gray-600 transition-colors"
              >
                Shop on Farfetch
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
              </a>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}