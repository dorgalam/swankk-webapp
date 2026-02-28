import React, { useState, useRef, useEffect } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import SaveButton from "@/components/swankk/SaveButton";

const SWIPE_THRESHOLD = 50;

export default function TrendImageDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const trendSlug = urlParams.get("trendSlug") || "";
  const imageIndex = parseInt(urlParams.get("imageIndex") || "0");
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(imageIndex);
  const [direction, setDirection] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentIdx(imageIndex);
    setShowInfo(false);
  }, [trendSlug, imageIndex]);

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ["trend", trendSlug],
    queryFn: () => api.trends.filter({ slug: trendSlug }),
  });

  const trend = (trends as any[])[0];
  const images: any[] = trend?.images || [];

  useEffect(() => {
    if (!thumbsRef.current || !images.length) return;
    const thumb = thumbsRef.current.children[currentIdx] as HTMLElement;
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentIdx, images.length]);

  const goTo = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= images.length) return;
    setDirection(newIdx > currentIdx ? 1 : -1);
    setCurrentIdx(newIdx);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const currentImage = images[currentIdx];

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

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
      </div>

      <div className="px-5 md:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Main swipeable image */}
          <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden mb-3">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={currentIdx}
                src={cdnUrl(currentImage)}
                alt={trend.name}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%" }),
                  center: { x: 0 },
                  exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%" }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_THRESHOLD) goTo(currentIdx + 1);
                  else if (info.offset.x > SWIPE_THRESHOLD) goTo(currentIdx - 1);
                }}
                className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing select-none"
              />
            </AnimatePresence>
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none">
                {currentIdx + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              ref={thumbsRef}
              className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-5"
            >
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`flex-shrink-0 w-10 h-14 rounded-md overflow-hidden transition-all duration-200 ${
                    i === currentIdx
                      ? "ring-1 ring-gray-400 ring-offset-1 opacity-100"
                      : "opacity-35 hover:opacity-65"
                  }`}
                >
                  <img
                    src={cdnUrl(img)}
                    alt={`${trend.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title + info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="font-serif text-xl md:text-2xl font-medium text-black">
                  {trend.name}
                </h2>
                {trend.context && (
                  <button
                    onClick={() => setShowInfo((v) => !v)}
                    className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                  </button>
                )}
              </div>
              {showInfo && trend.context && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 mb-2 leading-relaxed"
                >
                  {trend.context}
                </motion.p>
              )}
            </div>
            <SaveButton
              itemType="era_image"
              title={trend.name}
              imageUrl={currentImage}
              iconColor="black"
            />
          </div>

          <div className="flex flex-wrap gap-2">
          </div>
        </motion.div>
      </div>
    </div>
  );
}
