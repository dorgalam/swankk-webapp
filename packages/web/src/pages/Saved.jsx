import React, { useState } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Share2,
  X,
  Check,
  Copy,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Saved() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: collections = [],
    isLoading: colLoading,
  } = useQuery({
    queryKey: ["collections", user?.email],
    queryFn: () => api.collections.filter({ owner_email: user.email }),
    enabled: !!user,
  });

  const {
    data: savedItems = [],
    isLoading: itemsLoading,
  } = useQuery({
    queryKey: ["savedItems", selectedCollection?.id],
    queryFn: () =>
      api.savedItems.filter({
        collection_id: selectedCollection.id,
      }),
    enabled: !!selectedCollection,
  });

  const handleDeleteCollection = async (col) => {
    await api.collections.delete(col.id);
    setSelectedCollection(null);
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  const handleRename = async (col) => {
    if (!newName.trim()) return;
    await api.collections.update(col.id, { name: newName.trim() });
    setEditingName(null);
    setNewName("");
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  const handleRemoveItem = async (item) => {
    await api.savedItems.delete(item.id);
    queryClient.invalidateQueries({ queryKey: ["savedItems"] });
  };

  const handleShare = async (col) => {
    const shareId =
      col.share_id || Math.random().toString(36).substring(2, 10);
    if (!col.share_id) {
      await api.collections.update(col.id, {
        is_public: 1,
        share_id: shareId,
      });
    }
    const url = `${window.location.origin}${createPageUrl(
      `SharedCollection?id=${shareId}`
    )}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
        <p className="font-serif text-2xl text-black mb-2">Your Collections</p>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          Sign in to save designers, eras, and signature pieces to your personal
          collections.
        </p>
        <Link
          to="/Login"
          className="px-8 py-3 bg-black text-white text-sm tracking-wider font-medium rounded-full hover:bg-gray-900 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // Collection detail view
  if (selectedCollection) {
    return (
      <div className="min-h-[60vh] pb-20">
        <div className="px-5 md:px-8 pt-6">
          <button
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            All collections
          </button>

          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-2xl md:text-3xl text-black">
              {selectedCollection.name}
            </h1>
            <div className="flex gap-1">
              <button
                onClick={() => handleShare(selectedCollection)}
                className="p-2.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                ) : (
                  <Share2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {itemsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400">
                No items saved yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group relative"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-serif text-2xl text-gray-300">
                          {item.title?.[0]}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <X className="w-3 h-3 text-gray-600" strokeWidth={2} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-black mt-2 leading-tight">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Collections list
  return (
    <div className="min-h-[60vh] pb-20">
      <div className="px-5 md:px-8 pt-8">
        <h1 className="font-serif text-3xl md:text-4xl text-black mb-8">
          Your Collections
        </h1>

        {colLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400 mb-2">
              No collections yet.
            </p>
            <p className="text-xs text-gray-300">
              Save items from designer pages to create your first collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {collections.map((col) => (
              <motion.div
                key={col.id}
                whileHover={{ y: -2 }}
                className="group relative border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setSelectedCollection(col)}
              >
                {editingName === col.id ? (
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleRename(col)
                      }
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                    />
                    <button
                      onClick={() => handleRename(col)}
                      className="px-3 py-1.5 bg-black text-white text-xs rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-serif text-lg text-black mb-1">
                      {col.name}
                    </h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingName(col.id);
                          setNewName(col.name);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Pencil
                          className="w-3.5 h-3.5 text-gray-400"
                          strokeWidth={1.5}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(col);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Share2
                          className="w-3.5 h-3.5 text-gray-400"
                          strokeWidth={1.5}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this collection?"))
                            handleDeleteCollection(col);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Trash2
                          className="w-3.5 h-3.5 text-red-400"
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
