import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const VIDEOS = [
  {
    id: "2d21ff_c795d21c3468406e98dd658cca4ab12e",
    name: "Chloé Summer 26 Campaign",
    url: "https://video.wixstatic.com/video/2d21ff_c795d21c3468406e98dd658cca4ab12e/1080p/mp4/file.mp4",
    poster: "https://video.wixstatic.com/video/2d21ff_c795d21c3468406e98dd658cca4ab12ef001.jpg"
  },
  {
    id: "2d21ff_f07fa4e1f1b5403281cca7db1abe2653",
    name: "Givenchy Winter 2025",
    url: "https://video.wixstatic.com/video/2d21ff_f07fa4e1f1b5403281cca7db1abe2653/1080p/mp4/file.mp4",
    poster: "https://video.wixstatic.com/video/2d21ff_f07fa4e1f1b5403281cca7db1abe2653f001.jpg"
  },
  {
    id: "2d21ff_3401ffafd1f04f9eb5031a28c9644907",
    name: "Bottega Veneta Winter 24",
    url: "https://video.wixstatic.com/video/2d21ff_3401ffafd1f04f9eb5031a28c9644907/1080p/mp4/file.mp4",
    poster: "https://video.wixstatic.com/video/2d21ff_3401ffafd1f04f9eb5031a28c9644907f001.jpg"
  },
  {
    id: "2d21ff_0cfcdbc023b543abba08e3e2c5a84b95",
    name: "Loewe Fall Winter 2025",
    url: "https://video.wixstatic.com/video/2d21ff_0cfcdbc023b543abba08e3e2c5a84b95/1080p/mp4/file.mp4",
    poster: "https://video.wixstatic.com/video/2d21ff_0cfcdbc023b543abba08e3e2c5a84b95f001.jpg"
  }
];

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenLanding = localStorage.getItem("swankk_seen_landing");
    if (hasSeenLanding) {
      navigate(createPageUrl("Home"), { replace: true });
    }
  }, [navigate]);

  const handleStartExploring = () => {
    localStorage.setItem("swankk_seen_landing", "true");
    navigate(createPageUrl("Home"));
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Video Grid Background - 2x2 on mobile, 1x4 on desktop */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1">
        {VIDEOS.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: idx * 0.15 }}
            className="relative w-full h-full"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={video.poster}
              className="w-full h-full object-cover"
              onLoadedData={(e) => (e.target as HTMLVideoElement).play()}
            >
              <source src={video.url} type="video/mp4" />
            </video>
          </motion.div>
        ))}
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 md:px-12 safe-area-inset">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="max-w-3xl w-full text-center backdrop-blur-sm bg-black/10 rounded-3xl p-8 md:p-12"
        >
          <h1
            className="font-serif text-[2.5rem] leading-[1.1] md:text-6xl lg:text-7xl font-medium text-white mb-6 tracking-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            Enter fashion,
            <br />
            tuned to you.
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-white/90 text-sm md:text-lg leading-relaxed mb-8 md:mb-10 font-light max-w-xl mx-auto"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}
          >
            Discover designers, decode eras, and explore the culture behind the clothes.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            onClick={handleStartExploring}
            className="px-10 py-3.5 bg-white text-black font-medium text-sm tracking-wider rounded-full hover:bg-white/95 active:scale-[0.98] transition-all duration-200 shadow-2xl mx-auto"
            style={{ minHeight: "48px", maxWidth: "300px" }}
          >
            Start Exploring
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        .safe-area-inset {
          padding-top: max(env(safe-area-inset-top), 1rem);
          padding-bottom: max(env(safe-area-inset-bottom), 1rem);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
      `}</style>
    </div>
  );
}
