import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Search } from "lucide-react";

interface TasteEditModalProps {
  currentHouses: string[];
  onSave: (houses: string[]) => void;
  onClose: () => void;
  designers: { name: string; slug: string }[];
}

export default function TasteEditModal({ currentHouses, onSave, onClose, designers }: TasteEditModalProps) {
  const [selectedHouses, setSelectedHouses] = useState<string[]>(currentHouses || []);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleHouse = (name: string) => {
    setSelectedHouses((prev) =>
      prev.includes(name) ? prev.filter((h) => h !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    if (selectedHouses.length >= 1) {
      onSave(selectedHouses);
    }
  };

  const filtered = designers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-serif text-xl font-medium text-black">Your taste</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Search className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designers..."
              className="flex-1 bg-transparent text-sm text-black placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map((d) => {
            const selected = selectedHouses.includes(d.name);
            return (
              <button
                key={d.name}
                onClick={() => toggleHouse(d.name)}
                style={{ touchAction: 'manipulation' }}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                  selected ? "text-black font-medium bg-gray-50" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{d.name}</span>
                {selected && <Check className="w-4 h-4 text-black" strokeWidth={2} />}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No designers found</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={selectedHouses.length < 1}
            className={`w-full py-3 rounded-full text-sm font-medium transition-all ${
              selectedHouses.length >= 1
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {selectedHouses.length >= 1 ? `Save (${selectedHouses.length} selected)` : "Select at least 1"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
