import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { X, Plus, Check, Loader2 } from "lucide-react";

interface ItemData {
  item_type: string;
  designer_id: number;
  title: string;
  image_url: string;
  subtitle?: string;
  external_url?: string;
}

interface SaveToCollectionModalProps {
  onClose: () => void;
  onSaved: () => void;
  itemData: ItemData;
}

interface Collection {
  id: number;
  name: string;
}

const DEFAULT_COLLECTIONS = [
  "Designers to remember",
  "Styles I like",
  "Wishlist",
  "Research for later",
];

export default function SaveToCollectionModal({ onClose, onSaved, itemData }: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const cols = await api.collections.filter({
      owner_email: user!.email,
    });
    if (cols.length === 0) {
      const created = await api.collections.bulkCreate(
        DEFAULT_COLLECTIONS.map((name) => ({
          name,
          owner_email: user!.email,
        }))
      );
      setCollections(created);
    } else {
      setCollections(cols);
    }
    setLoading(false);
  };

  const handleCreateNew = async () => {
    if (!newName.trim()) return;
    const col = await api.collections.create({
      name: newName.trim(),
      owner_email: user!.email,
    });
    setCollections([...collections, col]);
    setSelectedId(col.id);
    setShowNew(false);
    setNewName("");
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    await api.savedItems.create({
      ...itemData,
      collection_id: selectedId,
      owner_email: user!.email,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="font-serif text-lg text-black">Save to collection</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 pb-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedId(col.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                    selectedId === col.id
                      ? "bg-black text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>{col.name}</span>
                  {selectedId === col.id && (
                    <Check className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100">
          {showNew ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Collection name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNew()}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
              />
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-black text-white text-xs rounded-xl tracking-wider font-medium"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              New collection
            </button>
          )}
        </div>

        <div className="px-5 pb-5 pt-1">
          <button
            onClick={handleSave}
            disabled={!selectedId || saving}
            className="w-full py-3 bg-black text-white text-sm tracking-wider font-medium rounded-full hover:bg-gray-900 transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
