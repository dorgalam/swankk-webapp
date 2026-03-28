import React, { useState } from "react";
import { motion } from "framer-motion";

interface TasteOnboardingProps {
  onComplete: (houses: string[]) => void;
  onSkip: () => void;
  designers: { name: string; slug: string }[];
}

export default function TasteOnboarding({ onComplete, onSkip, designers }: TasteOnboardingProps) {
  const [selectedHouses, setSelectedHouses] = useState<string[]>([]);

  const toggleHouse = (house: string) => {
    if (selectedHouses.includes(house)) {
      setSelectedHouses(selectedHouses.filter((h) => h !== house));
    } else {
      setSelectedHouses([...selectedHouses, house]);
    }
  };

  const handleContinue = () => {
    if (selectedHouses.length >= 1) {
      onComplete(selectedHouses);
    }
  };

  const names = designers.length > 0 ? designers.map((d) => d.name) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-black mb-3">
            Tune your taste
          </h1>
          <p className="text-base text-black mb-2">Pick a few houses you're into.</p>
          <p className="text-sm text-gray-400 mb-8">We'll use this to shape your Explore.</p>

          <div className="flex flex-wrap gap-2 mb-8 max-h-64 overflow-y-auto pr-1">
            {names.map((house) => (
              <button
                key={house}
                onClick={() => toggleHouse(house)}
                style={{ touchAction: 'manipulation' }}
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

          <div className="flex flex-col gap-3">
            <button
              onClick={handleContinue}
              disabled={selectedHouses.length < 1}
              className={`w-full py-3 rounded-full text-sm font-medium transition-all ${
                selectedHouses.length >= 1
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              {selectedHouses.length < 1 && ` (select at least 1)`}
            </button>

            <div className="flex gap-4 justify-center">
              <button
                onClick={onSkip}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
