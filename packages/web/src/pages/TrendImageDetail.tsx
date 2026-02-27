import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import SaveButton from "@/components/swankk/SaveButton";

export default function TrendImageDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const trendSlug = urlParams.get("trendSlug") || "";
  const imageIndex = parseInt(urlParams.get("imageIndex") || "0");
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [trendSlug, imageIndex]);

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ["trend", trendSlug],
    queryFn: () => api.trends.filter({ slug: trendSlug }),
  });

  const trend = (trends as any[])[0];
  const currentImage = trend?.images?.[imageIndex];
  const otherImages = trend?.images?.filter((_: any, i: number) => i !== imageIndex) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!trend || !currentImage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="font-serif text-2xl text-black mb-2">Image not found</p>
        <Link
          to={createPageUrl("Home")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full tracking-wider"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const images = trend?.images || [];

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-6">
        <button
          onClick={() => {
            navigate(-1);
            setTimeout(() => window.scrollTo(0, 0), 0);
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
      </div>

      <div className="px-5 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden mb-6">
            <img
              src={cdnUrl(currentImage.image_url)}
              alt={trend.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-start justify-between mb-6">
            <h2 className="font-serif text-xl md:text-2xl font-medium text-black">
              {trend.name}
            </h2>
            <SaveButton
              itemType="era_image"
              title={trend.name}
              imageUrl={currentImage.image_url}
              subtitle={currentImage.designer_name}
              iconColor="black"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {currentImage.designer_name && (
              <Link
                to={createPageUrl(`DesignerWorld?slug=${currentImage.designer_slug}`)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {currentImage.designer_name}
              </Link>
            )}
            {currentImage.season && (
              <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700">
                {currentImage.season}
              </span>
            )}
            {[...new Set<string>(currentImage.tags || [])].map((tag, i) => (
              <Link
                key={i}
                to={createPageUrl(`TagDiscovery?tag=${encodeURIComponent(tag)}`)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {otherImages.length > 0 && (
        <div className="px-5 md:px-8 border-t border-gray-100 pt-8">
          <h3 className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
            More from {trend.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {otherImages.slice(0, 8).map((img: any, i: number) => {
              const realIndex = images.findIndex(
                (trendImg: any) => trendImg.image_url === img.image_url
              );
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() =>
                    navigate(
                      createPageUrl(
                        `TrendImageDetail?trendSlug=${trendSlug}&imageIndex=${realIndex}`
                      )
                    )
                  }
                >
                  <img
                    src={cdnUrl(img.image_url)}
                    alt={`${trend.name} ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
