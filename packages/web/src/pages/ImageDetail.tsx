import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SaveButton from "@/components/swankk/SaveButton";

export default function ImageDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "";
  const eraIndex = parseInt(urlParams.get("era") || "0");
  const imageIndex = parseInt(urlParams.get("image") || "0");
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, eraIndex, imageIndex]);

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designer", slug],
    queryFn: () => api.designers.filter({ slug }),
  });

  const designer = designers[0] as any;
  const era = designer?.eras?.[eraIndex];
  const eraImages: string[] = era?.images || [];
  const currentImageUrl = eraImages[imageIndex];

  const relatedImages = designer?.eras?.flatMap((e: any, idx: number) =>
    (e.images || []).map((url: string, imgIdx: number) => ({
      image_url: url,
      eraTitle: e.title,
      eraIndex: idx,
      imageIndex: imgIdx,
    }))
  ).filter((_: any, i: number) => i !== imageIndex) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!designer || !era || !currentImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="font-serif text-2xl text-black mb-2">Image not found</p>
        <Link
          to={createPageUrl("Home")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const handleRelatedImageClick = (img: any) => {
    navigate(createPageUrl(`ImageDetail?slug=${slug}&era=${img.eraIndex}&image=${img.imageIndex}`));
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen pb-20">
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
          <div className="aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden mb-6 max-w-2xl mx-auto">
            <img
              src={currentImageUrl}
              alt={era.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-medium text-black mb-1">
                  {era.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {era.year_range}
                </p>
              </div>
              <SaveButton
                itemType="era_image"
                designerId={designer.id}
                title={era.title}
                imageUrl={currentImageUrl}
                subtitle={`${designer.name} · ${era.year_range}`}
                iconColor="black"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <Link
                to={createPageUrl(`DesignerWorld?slug=${designer.slug}`)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {designer.name}
              </Link>
              {(designer.known_for_tags || []).map((tag: any, i: number) => (
                <Link
                  key={i}
                  to={createPageUrl(`TagDiscovery?tag=${encodeURIComponent(tag.name || tag)}`)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {tag.name || tag}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {relatedImages.length > 0 && (
        <div className="px-5 md:px-8 border-t border-gray-100 pt-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
            More from {era.title}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {relatedImages.slice(0, 9).map((img: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => handleRelatedImageClick(img)}
              >
                <img
                  src={img.image_url}
                  alt={img.eraTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
