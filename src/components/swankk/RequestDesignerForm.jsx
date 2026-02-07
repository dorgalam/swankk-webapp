import React, { useState } from "react";
import { api } from "@/api/client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function RequestDesignerForm({ designerName }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.designerRequests.create({
      designer_name: designerName,
      email: email || undefined,
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 px-6"
      >
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <p className="font-serif text-lg text-black mb-1">Thank you</p>
        <p className="text-sm text-gray-400">
          We'll notify you when it's live.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto px-6"
    >
      <p className="text-center text-sm text-gray-500 mb-1">
        Can't find your designer?
      </p>
      <p className="text-center text-xs text-gray-400 mb-5">
        Request it and we'll add it to the collection.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={designerName}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
        />
        <input
          type="email"
          placeholder="Your email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
        />
        <p className="text-[11px] text-gray-400 px-1">
          Add your email to get notified when it's live.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white text-sm tracking-wider font-medium rounded-full hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Request this designer"}
        </button>
      </form>
    </motion.div>
  );
}
