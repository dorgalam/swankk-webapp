import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, shuffle } from "@/utils";
import RelatedTags from "@/components/swankk/RelatedTags";

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

  const { data: allDesigners = [] } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
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

  const images = shuffle(trend.images || []);

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
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-black mb-3">
            {trend.name}
          </h1>
          {trend.context && (
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
              {trend.context}
            </p>
          )}
        </motion.div>
      </div>

      <div className="px-5 md:px-8">
        <div className="grid grid-cols-2 gap-3 mb-12">
          {images.map((img: any, index: number) => (
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
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <img
                  src={img.image_url}
                  alt={`${trend.name} ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <RelatedTags
          relatedTags={trend.related_tags || []}
          allDesigners={allDesigners as any[]}
          allStyles={allStyles as any[]}
          allTrends={allTrends as any[]}
        />
      </div>
    </div>
  );
}
