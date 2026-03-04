import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useBookmarks } from "@/lib/BookmarksContext";
import type { BookmarkCategory } from "@/lib/bookmarks";

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
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { isSaved, toggle } = useBookmarks();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const saved = isSaved(category, id);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/Login");
      return;
    }

    if (pending) return;
    setPending(true);
    try {
      await toggle(category, id, item);
    } finally {
      setPending(false);
    }
  };

  const colorClass =
    iconColor === "white"
      ? saved
        ? "text-white bg-white/30"
        : "text-white/70 bg-black/25 hover:bg-black/45"
      : saved
      ? "text-black bg-gray-100"
      : "text-gray-400 bg-white/80 hover:bg-gray-100";

  if (isLoadingAuth) return null;

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`p-2 rounded-full backdrop-blur-sm transition-all ${colorClass} ${className}`}
      aria-label={saved ? "Remove bookmark" : "Save"}
    >
      <Bookmark
        className="w-4 h-4"
        strokeWidth={1.5}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
