import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const AVAILABLE_HOUSES = [
  "Prada", "Gucci", "Balenciaga", "Valentino", "Versace",
  "Bottega Veneta", "Saint Laurent", "Fendi", "Miu Miu", "Louis Vuitton",
];

interface TasteEditModalProps {
  currentHouses: string[];
  onSave: (houses: string[]) => void;
  onClose: () => void;
}

export default function TasteEditModal({ currentHouses, onSave, onClose }: TasteEditModalProps) {
  const [selectedHouses, setSelectedHouses] = useState<string[]>(currentHouses || []);

  const toggleHouse = (house: string) => {
    if (selectedHouses.includes(house)) {
      setSelectedHouses(selectedHouses.filter((h) => h !== house));
    } else if (selectedHouses.length < 10) {
      setSelectedHouses([...selectedHouses, house]);
    }
  };

  const handleSave = () => {
    if (selectedHouses.length >= 1) {
      onSave(selectedHouses);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-medium text-black">Edit your taste</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {AVAILABLE_HOUSES.map((house) => (
            <button
              key={house}
              onClick={() => toggleHouse(house)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedHouses.includes(house)
                  ? "bg-black text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {house}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={selectedHouses.length < 1}
          className={`w-full py-3 rounded-full text-sm font-medium transition-all ${
            selectedHouses.length >= 1
              ? "bg-black text-white hover:bg-gray-900"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save
          {selectedHouses.length < 1 && ` (select ${1 - selectedHouses.length} more)`}
        </button>
      </motion.div>
    </motion.div>
  );
}
