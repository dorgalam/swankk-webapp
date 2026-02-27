import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl, shuffle, cdnUrl } from "@/utils";

interface RelatedTagsProps {
  relatedTags: string[];
  allDesigners: any[];
  allStyles: any[];
  allTrends: any[];
}

interface ResolvedTag {
  type: "designer" | "style" | "trend";
  slug: string;
  name: string;
  imageUrl?: string;
  href: string;
}

export default function RelatedTags({
  relatedTags,
  allDesigners,
  allStyles,
  allTrends,
}: RelatedTagsProps) {
  if (!relatedTags || relatedTags.length === 0) return null;

  const resolved: ResolvedTag[] = relatedTags
    .map((entry) => {
      const colonIdx = entry.indexOf(":");
      if (colonIdx === -1) return null;
      const type = entry.slice(0, colonIdx) as "designer" | "style" | "trend";
      const slug = entry.slice(colonIdx + 1);

      if (type === "designer") {
        const d = allDesigners.find((x: any) => x.slug === slug);
        if (!d) return null;
        return {
          type,
          slug,
          name: d.name,
          imageUrl: d.hero_image_url,
          href: createPageUrl(`DesignerWorld?slug=${slug}`),
        };
      }
      if (type === "style") {
        const s = allStyles.find((x: any) => x.slug === slug);
        if (!s) return null;
        return {
          type,
          slug,
          name: s.name,
          href: createPageUrl(`TagDiscovery?slug=${slug}`),
        };
      }
      if (type === "trend") {
        const t = allTrends.find((x: any) => x.slug === slug);
        if (!t) return null;
        return {
          type,
          slug,
          name: t.name,
          imageUrl: (t.preview_images || [])[0],
          href: createPageUrl(`TrendDetail?slug=${slug}`),
        };
      }
      return null;
    })
    .filter(Boolean) as ResolvedTag[];

  if (resolved.length === 0) return null;

  const shuffled = shuffle(resolved);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
        Explore More
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {shuffled.map((tag) => (
          <Link
            key={tag.type + ":" + tag.slug}
            to={tag.href}
            className="flex-shrink-0"
          >
            {tag.imageUrl ? (
              <div className="relative w-28 group">
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-1.5">
                  <img
                    src={cdnUrl(tag.imageUrl)}
                    alt={tag.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
                </div>
                <p className="text-xs text-black font-medium truncate">{tag.name}</p>
                <p className="text-[10px] text-gray-400 capitalize">{tag.type}</p>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-full border border-gray-200 hover:border-gray-400 transition-colors">
                <p className="text-xs text-black whitespace-nowrap">{tag.name}</p>
                <p className="text-[10px] text-gray-400 capitalize text-center">{tag.type}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
