import { useState } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";

export default function IconicProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || "";
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["iconic-product", id],
    queryFn: () => api.products.get(id),
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="font-serif text-2xl text-black mb-2">Product not found</p>
        <Link to={createPageUrl("Shop")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full tracking-wider">
          Back to Shop
        </Link>
      </div>
    );
  }

  const p = product as any;
  const allImages: string[] = [
    ...(p.image_url ? [p.image_url] : []),
    ...(p.images || []),
  ].filter(Boolean);
  const retailers: any[] = p.retailers || [];

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-6">
        <button
          onClick={() => { navigate(-1); setTimeout(() => window.scrollTo(0, 0), 0); }}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
      </div>

      <div className="px-5 md:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            {allImages.length > 0 && (
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 mb-3">
                <ImageWithSkeleton
                  src={cdnUrl(allImages[activeImage])}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {allImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? "border-black" : "border-transparent"
                    }`}
                  >
                    <ImageWithSkeleton
                      src={cdnUrl(img)}
                      alt={`${p.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pt-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {p.resolved_designer_name && (
                <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-2">
                  {p.resolved_designer_name}
                </p>
              )}
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-black mb-2">
                {p.name}
              </h1>
              {p.brand && <p className="text-gray-500 text-sm mb-4">{p.brand}</p>}
              {p.cheapest_price && (
                <p className="text-xl font-medium text-black mb-8">
                  From {p.cheapest_price}
                </p>
              )}

              {retailers.length > 0 && (
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
                    Buy from
                  </p>
                  <div className="space-y-3">
                    {retailers.map((r: any, i: number) => (
                      <a
                        key={i}
                        href={r.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {r.image_url && (
                            <img
                              src={cdnUrl(r.image_url)}
                              alt={r.name}
                              className="w-8 h-8 object-contain rounded"
                            />
                          )}
                          <span className="text-sm font-medium text-black">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {r.price && <span className="text-sm text-gray-500">{r.price}</span>}
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition-colors" strokeWidth={1.5} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
