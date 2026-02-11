import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Era {
  title: string;
  year_range: string;
  image_url: string;
  caption: string;
  credit: string;
  [key: string]: string;
}

interface SignaturePiece {
  name: string;
  image_url: string;
  brand: string;
  price: string;
  farfetch_url: string;
  [key: string]: string;
}

interface Designer {
  id?: number;
  name: string;
  slug: string;
  phonetic: string;
  audio_url: string;
  origin_meaning: string;
  hero_image_url: string;
  founder: string;
  founded_year: string;
  origin_location: string;
  creative_director: string;
  known_for_tags: string[];
  eras: Era[];
  signature_pieces: SignaturePiece[];
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export default function ContentEditor() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: designers = [], isLoading } = useQuery<Designer[]>({
    queryKey: ["designers-admin"],
    queryFn: () => api.designers.list(),
  });

  const emptyDesigner: Designer = {
    name: "", slug: "", phonetic: "", audio_url: "", origin_meaning: "",
    hero_image_url: "", founder: "", founded_year: "", origin_location: "",
    creative_director: "", known_for_tags: [],
    eras: [], signature_pieces: [],
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...editingDesigner };
    const id = data.id;
    delete data.id;
    delete data.created_at;
    delete data.updated_at;

    if (id) {
      await api.designers.update(id, data);
    } else {
      await api.designers.create(data);
    }
    setSaving(false);
    setEditingDesigner(null);
    queryClient.invalidateQueries({ queryKey: ["designers-admin"] });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this designer?")) return;
    await api.designers.delete(id);
    queryClient.invalidateQueries({ queryKey: ["designers-admin"] });
  };

  const updateField = (field: string, value: any) => {
    setEditingDesigner({ ...editingDesigner!, [field]: value });
  };

  const updateEra = (index: number, field: string, value: string) => {
    const eras = [...(editingDesigner!.eras || [])];
    eras[index] = { ...eras[index], [field]: value };
    updateField("eras", eras);
  };

  const updatePiece = (index: number, field: string, value: string) => {
    const pieces = [...(editingDesigner!.signature_pieces || [])];
    pieces[index] = { ...pieces[index], [field]: value };
    updateField("signature_pieces", pieces);
  };

  if (editingDesigner) {
    return (
      <div className="min-h-screen pb-20 px-5 md:px-8 pt-6 max-w-3xl mx-auto">
        <button
          onClick={() => setEditingDesigner(null)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-serif text-2xl mb-6">
          {editingDesigner.id ? `Edit ${editingDesigner.name}` : "New Designer"}
        </h1>

        <div className="space-y-6">
          {/* Basic fields */}
          <div className="space-y-3">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">Basic Info</p>
            {["name", "slug", "phonetic", "audio_url", "origin_meaning", "hero_image_url"].map((field) => (
              <div key={field}>
                <label className="text-xs text-gray-500 mb-1 block capitalize">
                  {field.replace(/_/g, " ")}
                </label>
                <input
                  type="text"
                  value={editingDesigner[field] || ""}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
              </div>
            ))}
          </div>

          {/* Facts */}
          <div className="space-y-3">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">Facts</p>
            {["founder", "founded_year", "origin_location", "creative_director"].map((field) => (
              <div key={field}>
                <label className="text-xs text-gray-500 mb-1 block capitalize">
                  {field.replace(/_/g, " ")}
                </label>
                <input
                  type="text"
                  value={editingDesigner[field] || ""}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Known For Tags (comma separated)</label>
              <input
                type="text"
                value={(editingDesigner.known_for_tags || []).join(", ")}
                onChange={(e) => updateField("known_for_tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Eras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">Eras</p>
              <button
                onClick={() => updateField("eras", [...(editingDesigner.eras || []), { title: "", year_range: "", image_url: "", caption: "", credit: "" }])}
                className="text-xs text-black flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Era
              </button>
            </div>
            {(editingDesigner.eras || []).map((era, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-500">Era {i + 1}</span>
                  <button onClick={() => updateField("eras", editingDesigner.eras.filter((_, j) => j !== i))} className="text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {["title", "year_range", "image_url", "caption", "credit"].map((f) => (
                  <input
                    key={f}
                    type="text"
                    placeholder={f.replace(/_/g, " ")}
                    value={era[f] || ""}
                    onChange={(e) => updateEra(i, f, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Signature Pieces */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">Signature Pieces</p>
              <button
                onClick={() => updateField("signature_pieces", [...(editingDesigner.signature_pieces || []), { name: "", image_url: "", brand: "", price: "", farfetch_url: "" }])}
                className="text-xs text-black flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Piece
              </button>
            </div>
            {(editingDesigner.signature_pieces || []).map((piece, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-500">Piece {i + 1}</span>
                  <button onClick={() => updateField("signature_pieces", editingDesigner.signature_pieces.filter((_, j) => j !== i))} className="text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {["name", "image_url", "brand", "price", "farfetch_url"].map((f) => (
                  <input
                    key={f}
                    type="text"
                    placeholder={f.replace(/_/g, " ")}
                    value={piece[f] || ""}
                    onChange={(e) => updatePiece(i, f, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                ))}
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-black text-white text-sm tracking-wider font-medium rounded-full hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Designer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-5 md:px-8 pt-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-black">Content Editor</h1>
        <button
          onClick={() => setEditingDesigner({ ...emptyDesigner })}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs tracking-wider font-medium rounded-full"
        >
          <Plus className="w-4 h-4" /> New Designer
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="space-y-3">
          {designers.map((d) => (
            <div
              key={d.id}
              className="border border-gray-100 rounded-xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === d.id ? null : d.id ?? null)}
              >
                <div className="flex items-center gap-3">
                  {d.hero_image_url && (
                    <img src={d.hero_image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="font-serif text-base text-black">{d.name}</p>
                    <p className="text-xs text-gray-400">/{d.phonetic}/</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDesigner({ ...d });
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(d.id!);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                  </button>
                  {expandedId === d.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              </div>
              <AnimatePresence>
                {expandedId === d.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 text-xs text-gray-500 space-y-1 border-t border-gray-50 pt-3">
                      <p><strong>Founder:</strong> {d.founder}</p>
                      <p><strong>Founded:</strong> {d.founded_year}</p>
                      <p><strong>Origin:</strong> {d.origin_location}</p>
                      <p><strong>Creative Director:</strong> {d.creative_director}</p>
                      <p><strong>Tags:</strong> {d.known_for_tags?.join(", ")}</p>
                      <p><strong>Eras:</strong> {d.eras?.length || 0}</p>
                      <p><strong>Signature Pieces:</strong> {d.signature_pieces?.length || 0}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
