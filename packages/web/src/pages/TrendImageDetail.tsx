import React, { useState, useRef, useEffect } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import SaveButton from "@/components/swankk/SaveButton";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";

async function fetchSimilar(imageUrl: string, limit = 24) {
  const res = await fetch(`/api/images/similar?url=${encodeURIComponent(imageUrl)}&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json() as { images: any[] };
  return data.images || [];
}

function similarImageNav(img: any): string {
  if (img.entity_type === "trend") return createPageUrl(`TrendImageDetail?trendSlug=${img.entity_slug}&imageUrl=${encodeURIComponent(img.url)}`);
  if (img.entity_type === "designer") return createPageUrl(`ImageDetail?slug=${img.entity_slug}&imageUrl=${encodeURIComponent(img.url)}`);
  if (img.entity_type === "color") return createPageUrl(`ColorDetail?slug=${img.entity_slug}`);
  return createPageUrl("Home");
}

const SWIPE_THRESHOLD = 40;

export default function TrendImageDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const trendSlug = urlParams.get("trendSlug") || "";
  const imageIndex = parseInt(urlParams.get("imageIndex") || "0");
  const imageUrl = urlParams.get("imageUrl") || "";
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(imageIndex);
  const [direction, setDirection] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [similarLimit, setSimilarLimit] = useState(10);
  const [zoomOpen, setZoomOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const dragOccurred = useRef(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentIdx(imageIndex);
    setShowInfo(false);
  }, [trendSlug, imageIndex, imageUrl]);

  // Escape key closes zoom
  useEffect(() => {
    if (!zoomOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomOpen]);

  // Lock body scroll when zoom is open
  useEffect(() => {
    document.body.style.overflow = zoomOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [zoomOpen]);

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ["trend", trendSlug],
    queryFn: () => api.trends.filter({ slug: trendSlug }),
  });

  const { data: allStyles = [] } = useQuery({
    queryKey: ["styles"],
    queryFn: () => api.styles.list(),
  });

  const trend = (trends as any[])[0];
  const images: string[] = trend?.images || [];

  useEffect(() => {
    if (!imageUrl || !images.length) return;
    const idx = images.findIndex((img) => img === imageUrl || cdnUrl(img) === imageUrl);
    if (idx >= 0) setCurrentIdx(idx);
  }, [imageUrl, images.length]);

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

  const currentImage = images[currentIdx];
  const currentCdnUrl = currentImage ? cdnUrl(currentImage) : "";

  const { data: similarImages = [] } = useQuery({
    queryKey: ["similar", currentCdnUrl],
    queryFn: () => fetchSimilar(currentCdnUrl),
    enabled: !!currentCdnUrl,
  });

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

  const imageBookmarkId = `trend_${trendSlug}_${currentIdx}`;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%" }),
  };

  const trendSimilarImages = similarImages as any[];

  // Style keywords from trend's related_tags
  const styleKeywords = (trend.related_tags || [])
    .filter((t: string) => t.startsWith('style:'))
    .map((entry: string) => {
      const styleSlug = entry.slice('style:'.length);
      const style = (allStyles as any[]).find((s: any) => s.slug === styleSlug);
      return style ? { slug: styleSlug, name: style.name } : null;
    })
    .filter(Boolean);

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
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                dragMomentum={false}
                onDragStart={() => { dragOccurred.current = true; }}
                onDragEnd={(_, info) => {
                  const swipe = Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > 400;
                  if (swipe) {
                    if (info.offset.x < 0 || info.velocity.x < -400) goTo(currentIdx + 1);
                    else goTo(currentIdx - 1);
                  }
                  setTimeout(() => { dragOccurred.current = false; }, 150);
                }}
                onClick={() => { if (!dragOccurred.current) setZoomOpen(true); }}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer select-none"
                style={{ touchAction: 'pan-y' }}
              />
            </AnimatePresence>

            {/* Save button overlaid on image — top right */}
            <div className="absolute top-3 right-3 z-10">
              <SaveButton
                category="images"
                id={imageBookmarkId}
                item={{
                  imageUrl: currentImage,
                  title: trend.name,
                  linkTo: `/TrendImageDetail?trendSlug=${trendSlug}&imageIndex=${currentIdx}`,
                }}
                iconColor="white"
              />
            </div>

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
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{ touchAction: 'manipulation' }}
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
                    <Info className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
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
          </div>

          {/* Style keywords */}
          {styleKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {styleKeywords.map((style: any) => (
                <Link
                  key={style.slug}
                  to={createPageUrl(`TagDiscovery?slug=${style.slug}`)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {style.name}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Similar images */}
      {trendSimilarImages.length > 0 && (
        <div className="px-5 md:px-8 border-t border-gray-100 pt-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
            You may also like
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {trendSimilarImages.slice(0, similarLimit).map((img: any, i: number) => (
              <motion.div
                key={img.url_hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group cursor-pointer"
                onClick={() => navigate(similarImageNav(img))}
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden relative">
                  <ImageWithSkeleton
                    src={cdnUrl(img.url)}
                    alt={img.entity_slug}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          {trendSimilarImages.length > similarLimit && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setSimilarLimit((v) => v + 10)}
                className="px-6 py-2.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-gray-400 transition-colors"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            onClick={() => setZoomOpen(false)}
          >
            {/* X button */}
            <button
              onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }}
              className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {/* Navigation arrows */}
            {currentIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goTo(currentIdx - 1); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors"
              >
                <span className="text-2xl font-thin leading-none">‹</span>
              </button>
            )}
            {currentIdx < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goTo(currentIdx + 1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors"
              >
                <span className="text-2xl font-thin leading-none">›</span>
              </button>
            )}

            {/* Swipeable image */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={`zoom-${currentIdx}`}
                src={cdnUrl(currentImage)}
                alt={trend.name}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  const swipe = Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > 400;
                  if (swipe) {
                    if (info.offset.x < 0 || info.velocity.x < -400) goTo(currentIdx + 1);
                    else goTo(currentIdx - 1);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-screen max-w-full object-contain select-none cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'pan-y' }}
                draggable={false}
              />
            </AnimatePresence>

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
                {currentIdx + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
