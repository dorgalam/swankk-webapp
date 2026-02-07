import React, { useState } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PronunciationCard({ designer }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => designer.audio_url ? new Audio(designer.audio_url) : null);

  const handlePlay = () => {
    if (audio) {
      setIsPlaying(true);
      audio.currentTime = 0;
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm"
    >
      <div className="text-center">
        <h2 className="font-serif text-[2rem] md:text-4xl font-medium text-black mb-2">
          {designer.name}
        </h2>
        <p className="text-gray-400 text-[13px] mb-5 font-light italic">
          /{designer.phonetic}/
        </p>

        <button
          onClick={handlePlay}
          className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
            isPlaying
              ? "border-gray-300 bg-gray-50 text-gray-700"
              : "border-gray-200 hover:border-gray-300 text-gray-500"
          }`}
        >
          <Volume2
            className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse" : ""}`}
            strokeWidth={1.5}
          />
          <span className="text-[11px] tracking-wide font-medium">
            {isPlaying ? "Playing…" : "Listen"}
          </span>
        </button>

        {designer.origin_meaning && (
          <p className="mt-6 text-[13px] text-gray-500 leading-relaxed px-2">
            {designer.origin_meaning}
          </p>
        )}

        <Link
          to={createPageUrl(`DesignerWorld?slug=${designer.slug}`)}
          className="mt-8 block w-full py-3.5 bg-black text-white text-[13px] tracking-wider font-medium rounded-full hover:bg-gray-900 transition-colors"
        >
          Enter {designer.name}'s world
        </Link>
      </div>
    </motion.div>
  );
}