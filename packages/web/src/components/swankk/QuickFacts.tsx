import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";

export default function QuickFacts({ designer }: { designer: any }) {
  if (!designer) return null;

  const facts = [
    { label: "Founder", value: designer.founder },
    { label: "Founded", value: designer.founded_year },
    { label: "Origin", value: designer.origin_location },
    { label: "Creative Director", value: designer.creative_director },
  ].filter((f) => f.value);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
        House profile
      </h3>
      <div className="space-y-0 border-t border-gray-100">
        {facts.map((fact, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-3.5 border-b border-gray-100"
          >
            <span className="text-xs text-gray-400 tracking-wide">{fact.label}</span>
            <span className="text-black text-sm font-medium text-right">{fact.value}</span>
          </div>
        ))}
      </div>

      {Array.isArray(designer.known_for_tags) && designer.known_for_tags.length > 0 && (
        <div className="mt-4">
          <span className="text-[10px] text-gray-400 tracking-wide">Known for</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {designer.known_for_tags.map((tag: any, i: number) => (
              <Link
                key={i}
                to={createPageUrl(`TagDiscovery?tag=${encodeURIComponent(tag.name || tag)}`)}
                className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] text-gray-700 tracking-wide hover:border-gray-400 transition-colors"
              >
                {tag.name || tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
