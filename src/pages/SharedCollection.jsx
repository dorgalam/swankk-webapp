import React from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SharedCollection() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get("id");

  const { data: collections = [], isLoading: colLoading } = useQuery({
    queryKey: ["sharedCollection", shareId],
    queryFn: () => api.collections.filterPublic({ share_id: shareId }),
    enabled: !!shareId,
  });

  const collection = collections[0];

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["sharedItems", collection?.id],
    queryFn: () => api.savedItems.filter({ collection_id: collection.id }),
    enabled: !!collection,
  });

  const isLoading = colLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
        <p className="font-serif text-2xl text-black mb-2">Collection not found</p>
        <p className="text-sm text-gray-400 mb-6">
          This collection may have been deleted or made private.
        </p>
        <Link
          to={createPageUrl("Home")}
          className="px-6 py-2.5 bg-black text-white text-sm rounded-full tracking-wider"
        >
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] pb-20">
      <div className="px-5 md:px-8 pt-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-2">
          Shared Collection
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-black mb-8">
          {collection.name}
        </h1>

        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            This collection is empty.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id}>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
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
                </div>
                <p className="text-sm font-medium text-black mt-2">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
