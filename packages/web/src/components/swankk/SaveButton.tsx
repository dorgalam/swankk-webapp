import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import SaveToCollectionModal from "./SaveToCollectionModal";

interface SaveButtonProps {
  itemType: string;
  designerId: number;
  title: string;
  imageUrl: string;
  subtitle?: string;
  externalUrl?: string;
  iconColor?: string;
}

export default function SaveButton({
  itemType,
  designerId,
  title,
  imageUrl,
  subtitle,
  externalUrl,
  iconColor = "gray",
}: SaveButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/Login");
      return;
    }
    setShowModal(true);
  };

  const handleSaved = () => {
    setIsSaved(true);
    setShowModal(false);
  };

  const colorClass =
    iconColor === "white"
      ? isSaved
        ? "text-white bg-white/30"
        : "text-white/80 bg-black/20 hover:bg-black/40"
      : isSaved
      ? "text-black bg-gray-100"
      : "text-gray-400 bg-white/80 hover:bg-gray-100";

  return (
    <>
      <button
        onClick={handleClick}
        className={`p-2 rounded-full backdrop-blur-sm transition-all ${colorClass}`}
        aria-label="Save"
      >
        <Bookmark
          className="w-4 h-4"
          strokeWidth={1.5}
          fill={isSaved ? "currentColor" : "none"}
        />
      </button>

      {showModal && (
        <SaveToCollectionModal
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
          itemData={{
            item_type: itemType,
            designer_id: designerId,
            title,
            image_url: imageUrl,
            subtitle,
            external_url: externalUrl,
          }}
        />
      )}
    </>
  );
}
