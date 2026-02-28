import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import ImageWithSkeleton from "@/components/swankk/ImageWithSkeleton";

function DesignerRow({ designer }: { designer: any }) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!designer.audio_url) return;
    const audio = new Audio(designer.audio_url);
    setIsPlaying(true);
    audio.play();
    audio.onended = () => setIsPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(createPageUrl(`DesignerWorld?slug=${designer.slug}`))}
      className="flex items-center gap-4 px-5 md:px-8 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
        <ImageWithSkeleton
          src={cdnUrl(designer.hero_image_url)}
          alt={designer.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-serif text-base text-black leading-tight">{designer.name}</p>
        {designer.phonetic && (
          <p className="text-xs text-gray-400 italic font-light">/{designer.phonetic}/</p>
        )}
      </div>

      {designer.audio_url && (
        <button
          onClick={handleListen}
          className={`p-2 rounded-full border transition-all shrink-0 ${
            isPlaying
              ? "border-black bg-black text-white"
              : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
          aria-label="Listen to pronunciation"
        >
          <Volume2
            className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      )}
    </motion.div>
  );
}

export default function AllDesigners() {
  const { data: designers = [], isLoading } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const sorted = [...(designers as any[])].sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );

  // Group by first letter
  const groups: Record<string, any[]> = {};
  for (const d of sorted) {
    const letter = d.name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(d);
  }

  return (
    <div className="pb-20">
      <div className="px-5 md:px-8 pt-8 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-4xl font-medium text-black"
        >
          Designers
        </motion.h1>
      </div>

      <div>
        {Object.entries(groups).map(([letter, list]) => (
          <div key={letter}>
            <div className="px-5 md:px-8 py-2 bg-gray-50 border-y border-gray-100">
              <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">
                {letter}
              </span>
            </div>
            {list.map((designer: any) => (
              <DesignerRow key={designer.id} designer={designer} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
