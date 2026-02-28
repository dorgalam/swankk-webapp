import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { bookmarks, type BookmarkCategory } from "@/lib/bookmarks";

interface SaveButtonProps {
  category: BookmarkCategory;
  id: string;
  item: Record<string, any>;
  iconColor?: "black" | "white" | "gray";
  className?: string;
}

export default function SaveButton({
  category,
  id,
  item,
  iconColor = "gray",
  className = "",
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(() => bookmarks.has(category, id));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = bookmarks.toggle(category, { id, ...item });
    setIsSaved(nowSaved);
  };

  const colorClass =
    iconColor === "white"
      ? isSaved
        ? "text-white bg-white/30"
        : "text-white/70 bg-black/25 hover:bg-black/45"
      : isSaved
      ? "text-black bg-gray-100"
      : "text-gray-400 bg-white/80 hover:bg-gray-100";

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full backdrop-blur-sm transition-all ${colorClass} ${className}`}
      aria-label={isSaved ? "Remove bookmark" : "Save"}
    >
      <Bookmark
        className="w-4 h-4"
        strokeWidth={1.5}
        fill={isSaved ? "currentColor" : "none"}
      />
    </button>
  );
}
