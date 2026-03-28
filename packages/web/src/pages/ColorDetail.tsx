import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import SaveButton from "@/components/swankk/SaveButton";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";
import { productBookmarkId } from "@/lib/bookmarks";

export default function ColorDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "";
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: colors = [], isLoading } = useQuery({
    queryKey: ["color", slug],
    queryFn: () => api.colors.filter({ slug }),
  });

  const { data: allColors = [] } = useQuery({
    queryKey: ["colors"],
    queryFn: () => api.colors.list(),
  });

  const color = (colors as any[])[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!color) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="font-serif text-2xl text-black mb-2">Color not found</p>
        <Link
          to={createPageUrl("Home")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full tracking-wider"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const images: string[] = color.images || [];
  const otherColors = (allColors as any[]).filter((c: any) => c.slug !== slug).slice(0, 4);

  return (
    <div className="pb-20">
      {/* Hero — color swatch + main image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {color.main_image_url ? (
          <ImageWithSkeleton
            src={cdnUrl(color.main_image_url)}
            alt={color.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: color.hex || "#e5e5e5" }} />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => {
              navigate(-1);
              setTimeout(() => window.scrollTo(0, 0), 0);
            }}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" strokeWidth={1.5} />
          </button>
        </div>

        {/* Color swatch badge */}
        {color.hex && (
          <div className="absolute bottom-4 left-5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-mono text-gray-800 tracking-wide">
              <span
                className="w-4 h-4 rounded-full border border-white/60 shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              {color.hex.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-5 md:px-8 pt-6 pb-2">
        <div className="flex items-start justify-between gap-3 mb-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl text-black font-medium"
          >
            {color.name}
          </motion.h1>
          <SaveButton
            category="colors"
            id={color.slug}
            item={{
              imageUrl: color.main_image_url || (images[0] || ""),
              name: color.name,
              hex: color.hex,
              slug: color.slug,
            }}
            iconColor="black"
          />
        </div>

        {color.description && (
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mb-6">
            {color.description}
          </p>
        )}

        <div className="h-px bg-gray-100" />
      </div>

      <div className="px-5 md:px-8 space-y-10 mt-6">
        {/* Images grid */}
        {images.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              Gallery
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img: string, i: number) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl overflow-hidden relative"
                >
                  <ImageWithSkeleton
                    src={cdnUrl(img)}
                    alt={`${color.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Products */}
        {(color.products || []).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              Shop the Look
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(color.products as any[]).map((product: any, i: number) => (
                <a
                  key={i}
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50">
                    <ImageWithSkeleton
                      src={cdnUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 z-10">
                      <SaveButton
                        category="products"
                        id={productBookmarkId(product.name, product.image_url)}
                        item={{
                          imageUrl: product.image_url,
                          name: product.name,
                          link: product.link,
                        }}
                        iconColor="white"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-black font-medium line-clamp-2">{product.name}</p>
                </a>
              ))}
            </div>
          </motion.section>
        )}

        {/* More Colors */}
        {otherColors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              More Colors
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {otherColors.map((c: any) => {
                const thumb = (c.images || [])[0] || c.main_image_url;
                return (
                  <Link
                    key={c.slug}
                    to={createPageUrl(`ColorDetail?slug=${c.slug}`)}
                    className="group"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
                      {thumb ? (
                        <ImageWithSkeleton
                          src={cdnUrl(thumb)}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: c.hex || "#e5e5e5" }}
                        />
                      )}
                    </div>
                    <p className="text-sm font-medium text-black">{c.name}</p>
                    {c.hex && (
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                        {c.hex.toUpperCase()}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
