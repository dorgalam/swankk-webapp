import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, shuffle, cdnUrl } from "@/utils";
import SaveButton from "@/components/swankk/SaveButton";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";
import { productBookmarkId } from "@/lib/bookmarks";
import { analytics } from "@/lib/analytics";

export default function TrendDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "";
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ["trend", slug],
    queryFn: () => api.trends.filter({ slug }),
  });

  const { data: allStyles = [] } = useQuery({
    queryKey: ["styles"],
    queryFn: () => api.styles.list(),
  });

  const { data: allTrends = [] } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.trends.list(),
  });

  const trend = (trends as any[])[0];

  React.useEffect(() => {
    if (trend) analytics.trend_view(slug, trend.name);
  }, [slug, trend?.name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!trend) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="font-serif text-2xl text-black mb-2">Trend not found</p>
        <Link
          to={createPageUrl("Home")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full tracking-wider"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const images: string[] = trend.images || [];

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-6 pb-8">
        <button
          onClick={() => {
            navigate(-1);
            setTimeout(() => window.scrollTo(0, 0), 0);
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-black">
              {trend.name}
            </h1>
            <SaveButton
              category="styles"
              id={`trend_${slug}`}
              item={{
                name: trend.name,
                slug,
                type: "trend",
                imageUrl: images[0] || "",
              }}
              iconColor="black"
            />
          </div>
          {trend.context && (
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
              {trend.context}
            </p>
          )}
        </motion.div>
      </div>

      <div className="px-5 md:px-8">
        <div className="grid grid-cols-2 gap-3 mb-12">
          {images.map((img: string, index: number) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() =>
                  navigate(
                    createPageUrl(`TrendImageDetail?trendSlug=${slug}&imageIndex=${index}`)
                  )
                }
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden relative">
                  <ImageWithSkeleton
                    src={cdnUrl(img)}
                    alt={`${trend.name} ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Style keywords */}
        {(trend.related_tags || []).some((t: string) => t.startsWith('style:')) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-3">
              Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {(trend.related_tags as string[])
                .filter((t: string) => t.startsWith('style:'))
                .map((entry: string) => {
                  const styleSlug = entry.slice('style:'.length);
                  const style = (allStyles as any[]).find((s: any) => s.slug === styleSlug);
                  if (!style) return null;
                  return (
                    <Link
                      key={entry}
                      to={createPageUrl(`TagDiscovery?slug=${styleSlug}`)}
                      onClick={() => analytics.style_tag_click(styleSlug, style.name, `trend:${slug}`)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      {style.name}
                    </Link>
                  );
                })}
            </div>
          </motion.section>
        )}

        {/* Products */}
        {(trend.products || []).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
              Shop the Trend
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(trend.products as any[]).map((product: any, i: number) => (
                <a
                  key={i}
                  href={product.link || product.url || product.farfetch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => analytics.product_click(product.name, 'trend', slug)}
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
                          brand: product.brand,
                          price: product.price,
                          link: product.link || product.url || product.farfetch_url,
                        }}
                        iconColor="white"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-black font-medium line-clamp-2">{product.name}</p>
                  {product.brand && <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>}
                  {product.price && <p className="text-xs text-gray-500 mt-0.5">{product.price}</p>}
                </a>
              ))}
            </div>
          </motion.section>
        )}

        {/* Explore More — 4 other trends */}
        {(() => {
          const others = shuffle(
            (allTrends as any[]).filter((t: any) => t.slug !== slug)
          ).slice(0, 4);
          if (!others.length) return null;
          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
                Explore More
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {others.map((t: any) => (
                  <Link
                    key={t.slug}
                    to={createPageUrl(`TrendDetail?slug=${t.slug}`)}
                    className="group"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
                      <ImageWithSkeleton
                        src={cdnUrl((t.preview_images || [])[0])}
                        alt={t.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-sm font-medium text-black">{t.name}</p>
                  </Link>
                ))}
              </div>
            </motion.section>
          );
        })()}
      </div>
    </div>
  );
}
