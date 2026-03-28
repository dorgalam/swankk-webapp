import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";
import { analytics } from "@/lib/analytics";

function ProductCard({ product, contextType, contextSlug }: { product: any; contextType: 'trend' | 'designer'; contextSlug: string }) {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.product_click(product.name, contextType, contextSlug)}
      className="flex-shrink-0 w-[160px] group"
    >
      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 relative mb-2">
        <ImageWithSkeleton
          src={cdnUrl(product.image_url)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-xs text-black font-medium line-clamp-2 leading-tight">{product.name}</p>
    </a>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto scrollbar-hide pl-5 md:pl-8">
      <div className="flex gap-3 pb-2 pr-5 md:pr-8">{children}</div>
    </div>
  );
}

export default function Shop() {
  const navigate = useNavigate();

  const { data: trends = [], isLoading: trendsLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.trends.list(),
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  const { data: collabProducts = [], isLoading: collabLoading } = useQuery({
    queryKey: ["products-collaborations"],
    queryFn: () => api.products.filter({ section: "collaborations" }),
  });

  const { data: iconicProducts = [], isLoading: iconicLoading } = useQuery({
    queryKey: ["products-iconic"],
    queryFn: () => api.products.filter({ section: "iconic" }),
  });

  const isLoading = trendsLoading || designersLoading || collabLoading || iconicLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const trendsWithProducts = (trends as any[])
    .filter((t: any) => (t.products || []).length > 0)
    .slice(0, 4);

  const designersWithProducts = (designers as any[])
    .filter((d: any) => (d.signature_pieces || []).length > 0)
    .slice(0, 4);

  const collabs = collabProducts as any[];
  const iconics = iconicProducts as any[];

  const hasContent = trendsWithProducts.length > 0 || designersWithProducts.length > 0
    || collabs.length > 0 || iconics.length > 0;

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-4xl font-medium text-black"
        >
          Shop
        </motion.h1>
      </div>

      {/* Shop by Trends */}
      {trendsWithProducts.length > 0 && (
        <div className="mb-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-8 px-5 md:px-8">
            Shop by Trends
          </p>

          <div className="space-y-10">
            {trendsWithProducts.map((trend: any) => (
              <div key={trend.id}>
                <h2
                  className="font-serif text-xl font-medium text-black mb-4 px-5 md:px-8 cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() =>
                    navigate(createPageUrl(`TrendDetail?slug=${trend.slug}`))
                  }
                >
                  {trend.name}
                </h2>

                <HorizontalScroll>
                  {(trend.products || []).map((product: any, i: number) => (
                    <ProductCard key={i} product={product} contextType="trend" contextSlug={trend.slug} />
                  ))}
                </HorizontalScroll>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop by Designers */}
      {designersWithProducts.length > 0 && (
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-8 px-5 md:px-8">
            Shop by Designer
          </p>

          <div className="space-y-10">
            {designersWithProducts.map((designer: any) => (
              <div key={designer.id}>
                <h2
                  className="font-serif text-xl font-medium text-black mb-4 px-5 md:px-8 cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() =>
                    navigate(createPageUrl(`DesignerWorld?slug=${designer.slug}`))
                  }
                >
                  {designer.name}
                </h2>

                <HorizontalScroll>
                  {(designer.signature_pieces || []).map((piece: any, i: number) => (
                    <ProductCard key={i} product={{ name: piece.name, image_url: piece.image_url, link: piece.link }} contextType="designer" contextSlug={designer.slug} />
                  ))}
                </HorizontalScroll>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collaborations */}
      {collabs.length > 0 && (
        <div className="mb-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-8 px-5 md:px-8">
            Collaborations
          </p>
          <HorizontalScroll>
            {collabs.map((p: any) => (
              <ProductCard key={p.id} product={{ name: p.name, image_url: p.image_url, link: p.image_url }} contextType="trend" contextSlug="collaborations" />
            ))}
          </HorizontalScroll>
        </div>
      )}

      {/* Iconic Pieces */}
      {iconics.length > 0 && (
        <div className="mb-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-8 px-5 md:px-8">
            Iconic Pieces
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-5 md:px-8">
            {iconics.map((p: any) => (
              <div
                key={p.id}
                className="cursor-pointer group"
                onClick={() => navigate(createPageUrl(`IconicProduct?id=${p.id}`))}
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 mb-2 relative">
                  <ImageWithSkeleton
                    src={cdnUrl(p.image_url)}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-xs text-black font-medium line-clamp-2 leading-tight">{p.name}</p>
                {p.resolved_designer_name && (
                  <p className="text-xs text-gray-400 mt-0.5">{p.resolved_designer_name}</p>
                )}
                {p.cheapest_price && (
                  <p className="text-xs text-gray-500 mt-0.5">From {p.cheapest_price}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasContent && (
        <div className="text-center py-16 px-5">
          <p className="text-sm text-gray-400">No products available yet.</p>
        </div>
      )}
    </div>
  );
}
