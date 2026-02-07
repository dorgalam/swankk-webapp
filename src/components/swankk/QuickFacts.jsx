import React from "react";
import { motion } from "framer-motion";

export default function QuickFacts({ designer }) {
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
        Quick Facts
      </h3>
      <div className="space-y-0 border-t border-gray-100">
        {facts.map((fact, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-3.5 border-b border-gray-100"
          >
            <span className="text-xs text-gray-400 tracking-wide">
              {fact.label}
            </span>
            <span className="text-sm text-black font-medium">
              {fact.value}
            </span>
          </div>
        ))}
      </div>

      {designer.known_for_tags?.length > 0 && (
        <div className="mt-4">
          <span className="text-xs text-gray-400 tracking-wide">Known for</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {designer.known_for_tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-700 tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}