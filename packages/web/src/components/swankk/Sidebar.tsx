import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { analytics } from "@/lib/analytics";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Trends", page: "AllTrends" },
  { label: "Designers", page: "AllDesigners" },
  { label: "Styles", page: "AllStyles" },
  { label: "Eras", page: "AllEras" },
  { label: "Shop", page: "Shop" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleNav = (page: string, label: string) => {
    analytics.nav_click(label);
    onClose();
    navigate(createPageUrl(page));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-72 bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100">
              <span className="font-serif text-[16px] tracking-[0.15em] font-medium text-black">
                SWANKK
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {NAV_ITEMS.map(({ label, page }) => (
                <button
                  key={page}
                  onClick={() => handleNav(page, label)}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-gray-50 transition-colors group text-left"
                >
                  <span className="font-serif text-xl text-black">{label}</span>
                  <ArrowRight
                    className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </nav>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
