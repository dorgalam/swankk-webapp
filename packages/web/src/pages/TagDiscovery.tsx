import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, shuffle } from "@/utils";
import RelatedTags from "@/components/swankk/RelatedTags";

export default function TagDiscovery() {
  const urlParams = new URLSearchParams(window.location.search);
  const tagSlug = urlParams.get("slug");
  const navigate = useNavigate();

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  const { data: styles = [], isLoading: stylesLoading } = useQuery({
    queryKey: ["styles"],
    queryFn: () => api.styles.list(),
  });

  const { data: allTrends = [] } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.trends.list(),
  });

  // Support both ?tag=Name (legacy) and ?slug=slug (new)
  const tagName = urlParams.get("tag")
    ?? (tagSlug ? (styles as any[]).find((s: any) => s.slug === tagSlug)?.name ?? tagSlug : null);

  const currentStyle = tagSlug
    ? (styles as any[]).find((s: any) => s.slug === tagSlug)
    : (styles as any[]).find((s: any) => s.name?.toLowerCase() === tagName?.toLowerCase());

  const matchingDesigners = shuffle(
    (designers as any[]).filter((d: any) =>
      d.known_for_tags?.some((t: any) => (t.name || t).toLowerCase() === tagName?.toLowerCase())
    )
  );

  const allEras = shuffle(
    matchingDesigners.flatMap((designer: any) =>
      (designer.eras || []).map((era: any) => ({
        ...era,
        designer_name: designer.name,
        designer_slug: designer.slug,
        designer_id: designer.id,
      }))
    )
  );

  const allSignaturePieces = shuffle(
    matchingDesigners.flatMap((designer: any) =>
      (designer.signature_pieces || []).map((piece: any) => ({
        ...piece,
        designer_name: designer.name,
      }))
    )
  );

  if (isLoading || stylesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!tagName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="text-gray-400 mb-4">No tag specified</p>
        <Link to={createPageUrl("Home")} className="text-sm text-black underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-6 pb-8">
        <button
          onClick={() => {
            navigate(-1);
            setTimeout(() => window.scrollTo(0, 0), 0);
          }}
          className="p-2.5 rounded-full hover:bg-gray-50 transition-colors mb-4 -ml-2.5"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl md:text-5xl text-black font-medium mb-3"
        >
          {tagName}
        </motion.h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
          Explore designers, eras, and pieces that embody this aesthetic
        </p>
      </div>

      <div className="px-5 md:px-8 space-y-12">
        {matchingDesigners.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              Designers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {matchingDesigners.map((designer: any, i: number) => (
                <Link
                  key={designer.id}
                  to={createPageUrl(`DesignerWorld?slug=${designer.slug}`)}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                    <img
                      src={designer.hero_image_url}
                      alt={designer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <p className="font-serif text-lg text-black">{designer.name}</p>
                  <p className="text-xs text-gray-400 italic">/{designer.phonetic}/</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {allEras.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              Defining Moments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allEras.slice(0, 6).map((era: any, i: number) => (
                <Link
                  key={i}
                  to={createPageUrl(`DesignerWorld?slug=${era.designer_slug}`)}
                  className="group"
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2">
                    <img
                      src={era.image_url}
                      alt={era.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium">{era.title}</p>
                      <p className="text-white/60 text-xs mt-0.5">
                        {era.designer_name} · {era.year_range}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {allEras.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              Visual Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {shuffle(allEras.flatMap((era: any) => (era.images || [])))
                .slice(0, 12)
                .map((imgUrl: string, i: number) => (
                  <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden">
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
            </div>
          </motion.section>
        )}

        {allSignaturePieces.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              Signature Pieces
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allSignaturePieces.slice(0, 6).map((piece: any, i: number) => (
                <a
                  key={i}
                  href={piece.farfetch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50">
                    <img
                      src={piece.image_url}
                      alt={piece.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <p className="text-sm text-black font-medium">{piece.name}</p>
                  <p className="text-xs text-gray-400">{piece.designer_name}</p>
                </a>
              ))}
            </div>
          </motion.section>
        )}

        {matchingDesigners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No content found for this tag yet</p>
            <Link to={createPageUrl("Home")} className="text-sm text-black underline">
              Explore other designers
            </Link>
          </div>
        )}

        {currentStyle && (currentStyle.related_tags || []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-px bg-gray-100 my-4" />
            <RelatedTags
              relatedTags={currentStyle.related_tags || []}
              allDesigners={designers as any[]}
              allStyles={styles as any[]}
              allTrends={allTrends as any[]}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
