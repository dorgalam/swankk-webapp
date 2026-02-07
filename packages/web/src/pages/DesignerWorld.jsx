import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Volume2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import QuickFacts from "@/components/swankk/QuickFacts";
import ErasCarousel from "@/components/swankk/ErasCarousel";
import SignaturePieces from "@/components/swankk/SignaturePieces";
import SaveButton from "@/components/swankk/SaveButton";

export default function DesignerWorld() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designer", slug],
    queryFn: () => api.designers.filter({ slug }),
  });

  const designer = designers[0];
  const [audio, setAudio] = useState(null);

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
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={designer.hero_image_url}
          alt={designer.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4">
          <Link
            to={createPageUrl("Home")}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="absolute top-4 right-4">
          <SaveButton
            itemType="designer"
            designerId={designer.id}
            title={designer.name}
            imageUrl={designer.hero_image_url}
            subtitle={designer.phonetic}
            iconColor="white"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl text-white font-medium">
              {designer.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Pronunciation */}
      <div className="px-5 md:px-8 pt-6">
        <div className="flex items-center gap-4 mb-2">
          <p className="text-gray-400 text-sm italic font-light">
            /{designer.phonetic}/
          </p>
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
        </div>
        {designer.origin_meaning && (
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mb-8">
            {designer.origin_meaning}
          </p>
        )}

        <div className="h-px bg-gray-100 mb-8" />
      </div>

      {/* Content sections */}
      <div className="px-5 md:px-8 space-y-10">
        <QuickFacts designer={designer} />
        <div className="h-px bg-gray-100" />
        <ErasCarousel designer={designer} />
        <div className="h-px bg-gray-100" />
        <SignaturePieces designer={designer} />
      </div>
    </div>
  );
}
