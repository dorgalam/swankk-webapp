import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, shuffle, cdnUrl } from "@/utils";
import RelatedTags from "@/components/swankk/RelatedTags";
import SaveButton from "@/components/swankk/SaveButton";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";
import { productBookmarkId } from "@/lib/bookmarks";

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
      (designer.eras || []).map((era: any, eraIdx: number) => ({
        ...era,
        eraIndex: eraIdx,
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

        <div className="flex items-start justify-between gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl text-black font-medium mb-3"
          >
            {tagName}
          </motion.h1>
          {currentStyle && (
            <SaveButton
              category="styles"
              id={`style_${currentStyle.slug}`}
              item={{
                name: currentStyle.name,
                slug: currentStyle.slug,
                type: "style",
              }}
              iconColor="black"
            />
          )}
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
          {currentStyle?.description || "Explore designers, eras, and pieces that embody this aesthetic"}
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
              {matchingDesigners.map((designer: any) => (
                <Link
                  key={designer.id}
                  to={createPageUrl(`DesignerWorld?slug=${designer.slug}`)}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                    <ImageWithSkeleton
                      src={cdnUrl(designer.hero_image_url)}
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

        {(() => {
          const matchingTrends = (allTrends as any[]).filter((t: any) =>
            currentStyle && (t.related_tags || []).includes(`style:${currentStyle.slug}`)
          );
          if (!matchingTrends.length) return null;
          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
                Trends
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {matchingTrends.map((trend: any) => (
                  <Link
                    key={trend.slug}
                    to={createPageUrl(`TrendDetail?slug=${trend.slug}`)}
                    className="group"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
                      <ImageWithSkeleton
                        src={cdnUrl((trend.preview_images || [])[0])}
                        alt={trend.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-sm font-medium text-black">{trend.name}</p>
                  </Link>
                ))}
              </div>
            </motion.section>
          );
        })()}

        {allEras.length > 0 && (() => {
          // Seeded shuffle so different slugs with the same designer pool show different images
          const seed = tagSlug || tagName || "";
          let h = 0;
          for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
          const allImgs = allEras.flatMap((era: any) =>
            (era.images || []).map((imgUrl: string, imgIdx: number) => ({
              imgUrl,
              designerSlug: era.designer_slug,
              eraIndex: era.eraIndex,
              imageIndex: imgIdx,
            }))
          );
          const seeded = [...allImgs];
          for (let i = seeded.length - 1; i > 0; i--) {
            h = (Math.imul(1664525, h) + 1013904223) | 0;
            const j = Math.abs(h) % (i + 1);
            [seeded[i], seeded[j]] = [seeded[j], seeded[i]];
          }
          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
                Visual Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {seeded.slice(0, 12).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() =>
                      navigate(
                        createPageUrl(
                          `ImageDetail?slug=${item.designerSlug}&era=${item.eraIndex}&image=${item.imageIndex}`
                        )
                      )
                    }
                  >
                    <ImageWithSkeleton
                      src={cdnUrl(item.imgUrl)}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })()}

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
                  href={piece.link || piece.farfetch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50">
                    <ImageWithSkeleton
                      src={cdnUrl(piece.image_url)}
                      alt={piece.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-2 right-2 z-10">
                      <SaveButton
                        category="products"
                        id={productBookmarkId(piece.name, piece.image_url)}
                        item={{
                          imageUrl: piece.image_url,
                          name: piece.name,
                          brand: piece.designer_name,
                          link: piece.link || piece.farfetch_url,
                        }}
                        iconColor="white"
                      />
                    </div>
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
