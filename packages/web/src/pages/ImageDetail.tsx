import React, { useState, useRef, useEffect } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, Loader2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import SaveButton from "@/components/swankk/SaveButton";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";

async function fetchImageTags(url: string): Promise<string[]> {
  const res = await fetch(`/api/images/tags?url=${encodeURIComponent(url)}`);
  if (!res.ok) return [];
  const data = await res.json() as { tags: string[] };
  return data.tags || [];
}

const SWIPE_THRESHOLD = 40;

export default function ImageDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "";
  const eraIndex = parseInt(urlParams.get("era") || "0");
  const imageIndex = parseInt(urlParams.get("image") || "0");
  const imageUrl = urlParams.get("imageUrl") || "";
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(imageIndex);
  const [direction, setDirection] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [moreImagesLimit, setMoreImagesLimit] = useState(10);
  const [zoomOpen, setZoomOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const dragOccurred = useRef(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentIdx(imageIndex);
    setShowInfo(false);
  }, [slug, eraIndex, imageIndex, imageUrl]);

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

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designer", slug],
    queryFn: () => api.designers.filter({ slug }),
  });

  const designer = designers[0] as any;

  // If imageUrl param is set, navigate to the correct era/image once designer loads
  useEffect(() => {
    if (!imageUrl || !designer) return;
    for (let ei = 0; ei < (designer.eras || []).length; ei++) {
      const imgs: string[] = designer.eras[ei].images || [];
      const ii = imgs.findIndex((u: string) => u === imageUrl || cdnUrl(u) === imageUrl);
      if (ii >= 0 && (ei !== eraIndex || ii !== imageIndex)) {
        navigate(createPageUrl(`ImageDetail?slug=${slug}&era=${ei}&image=${ii}`), { replace: true });
        return;
      }
    }
  }, [imageUrl, designer]);

  const era = designer?.eras?.[eraIndex];
  const eraImages: string[] = era?.images || [];

  const otherEraImages = designer?.eras?.flatMap((e: any, idx: number) => {
    if (idx === eraIndex) return [];
    return (e.images || []).map((url: string, imgIdx: number) => ({
      image_url: url,
      eraTitle: e.title,
      eraIndex: idx,
      imageIndex: imgIdx,
    }));
  }) || [];

  useEffect(() => {
    if (!thumbsRef.current || !eraImages.length) return;
    const thumb = thumbsRef.current.children[currentIdx] as HTMLElement;
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentIdx]);

  const goTo = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= eraImages.length) return;
    setDirection(newIdx > currentIdx ? 1 : -1);
    setCurrentIdx(newIdx);
  };

  const currentImageUrl = eraImages[currentIdx];
  const imageBookmarkId = `era_${slug}_${eraIndex}_${currentIdx}`;

  const { data: imageTags = [] } = useQuery({
    queryKey: ["imageTags", currentImageUrl],
    queryFn: () => fetchImageTags(cdnUrl(currentImageUrl)),
    enabled: !!currentImageUrl,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!designer || !era || !eraImages.length) {
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

  const slideVariants = {
    enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%" }),
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 md:px-8 pt-6 pb-4">
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
      </div>

      {/* Swipeable main image */}
      <div className="relative max-w-2xl mx-auto px-5 md:px-8 mb-3">
        <div className="aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden relative">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIdx}
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
              className="absolute inset-0 w-full h-full cursor-pointer select-none"
              style={{ touchAction: 'pan-y' }}
            >
              <img
                src={cdnUrl(currentImageUrl)}
                alt={`${era.title} ${currentIdx + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Save button overlaid on image — top right */}
          <div className="absolute top-3 right-3 z-10">
            <SaveButton
              category="images"
              id={imageBookmarkId}
              item={{
                imageUrl: currentImageUrl,
                title: era.title,
                subtitle: `${designer.name} · ${era.year_range}`,
                linkTo: `/ImageDetail?slug=${slug}&era=${eraIndex}&image=${currentIdx}`,
              }}
              iconColor="white"
            />
          </div>

          {/* Counter */}
          {eraImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none">
              {currentIdx + 1} / {eraImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {eraImages.length > 1 && (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-5 md:px-8 pb-5 max-w-2xl mx-auto"
        >
          {eraImages.map((url, i) => (
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
                src={cdnUrl(url)}
                alt={`${era.title} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="px-5 md:px-8 max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="font-serif text-xl md:text-2xl font-medium text-black">
                {era.title}
              </h2>
              {era.description && (
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Info className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </button>
              )}
            </div>
            {showInfo && era.description && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 mb-2 leading-relaxed"
              >
                {era.description}
              </motion.p>
            )}
            <p className="text-sm text-gray-500">{era.year_range}</p>
          </div>
        </div>

        {(() => {
          const knownTagNames = new Set<string>(
            (designer.known_for_tags || []).map((tag: any) => (tag.name || tag).toLowerCase())
          );
          const uniqueImageTags = Array.from(
            new Set((imageTags as string[]).filter((tag) => !knownTagNames.has(tag.toLowerCase())))
          );
          return (
            <div className="flex flex-wrap gap-2 mb-4">
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
              {uniqueImageTags.map((tag: string, i: number) => (
                <Link
                  key={`img-${i}`}
                  to={createPageUrl(`TagDiscovery?tag=${encodeURIComponent(tag)}`)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          );
        })()}
      </div>

      {/* More from designer (other eras) */}
      {otherEraImages.length > 0 && (
        <div className="px-5 md:px-8 border-t border-gray-100 pt-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-4">
            More of {designer.name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {otherEraImages.slice(0, moreImagesLimit).map((img: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group relative"
                onClick={() => {
                  navigate(createPageUrl(`ImageDetail?slug=${slug}&era=${img.eraIndex}&image=${img.imageIndex}`));
                  window.scrollTo(0, 0);
                }}
              >
                <ImageWithSkeleton
                  src={cdnUrl(img.image_url)}
                  alt={img.eraTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
          {otherEraImages.length > moreImagesLimit && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setMoreImagesLimit((v) => v + 10)}
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
            {currentIdx < eraImages.length - 1 && (
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
                src={cdnUrl(currentImageUrl)}
                alt={`${era.title} ${currentIdx + 1}`}
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
            {eraImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
                {currentIdx + 1} / {eraImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
