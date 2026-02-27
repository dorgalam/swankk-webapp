import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Volume2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import QuickFacts from "@/components/swankk/QuickFacts";
import ErasCarousel from "@/components/swankk/ErasCarousel";
import SignaturePieces from "@/components/swankk/SignaturePieces";
import SaveButton from "@/components/swankk/SaveButton";
import RelatedTags from "@/components/swankk/RelatedTags";

export default function DesignerWorld() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "";
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designer", slug],
    queryFn: () => api.designers.filter({ slug }),
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

  const designer = (designers as any[])[0];
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (designer?.audio_url) {
      setAudio(new Audio(designer.audio_url));
    }
  }, [designer]);

  const handlePlay = () => {
    if (audio) {
      setIsPlaying(true);
      audio.currentTime = 0;
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="font-serif text-2xl text-black mb-2">Designer not found</p>
        <p className="text-sm text-gray-400 mb-6">
          This designer doesn't exist yet.
        </p>
        <Link
          to={createPageUrl("Home")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full tracking-wider"
        >
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={cdnUrl(designer.hero_image_url)}
          alt={designer.name}
          className="w-full h-full object-cover"
        />

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
      </div>

      <div className="px-5 md:px-8 pt-6">
        <div className="flex items-start justify-between mb-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl text-black font-medium"
          >
            {designer.name}
          </motion.h1>
          <SaveButton
            itemType="designer"
            designerId={designer.id}
            title={designer.name}
            imageUrl={designer.hero_image_url}
            subtitle={designer.phonetic}
            iconColor="black"
          />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handlePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs tracking-wider font-medium transition-all ${
              isPlaying
                ? "border-black bg-black text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            <Volume2
              className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`}
              strokeWidth={1.5}
            />
            {isPlaying ? "Playing…" : "Listen"}
          </button>
          <p className="text-gray-400 text-sm italic font-light">
            /{designer.phonetic}/
          </p>
        </div>

        <div className="h-px bg-gray-100 mb-8" />
      </div>

      <div className="px-5 md:px-8 space-y-10">
        <QuickFacts designer={designer} />
        <div className="h-px bg-gray-100" />
        <SignaturePieces designer={designer} />
        <div className="h-px bg-gray-100" />
        <ErasCarousel designer={designer} />
        {(designer.related_tags || []).length > 0 && (
          <>
            <div className="h-px bg-gray-100" />
            <RelatedTags
              relatedTags={designer.related_tags || []}
              allDesigners={allDesigners as any[]}
              allStyles={allStyles as any[]}
              allTrends={allTrends as any[]}
            />
          </>
        )}
      </div>
    </div>
  );
}
