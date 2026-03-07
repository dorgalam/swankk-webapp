import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, cdnUrl } from "@/utils";
import TasteOnboarding from "@/components/swankk/TasteOnboarding";
import TasteEditModal from "@/components/swankk/TasteEditModal";
import { Pencil } from "lucide-react";

export default function Home() {
  
  const navigate = useNavigate();

  const hasSeenLanding = localStorage.getItem("swankk_seen_landing");

  useEffect(() => {
    if (!hasSeenLanding) {
      navigate(createPageUrl("Landing"), { replace: true });
    }
  }, [hasSeenLanding, navigate]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userTaste, setUserTaste] = useState<string[] | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const savedTaste = localStorage.getItem("swankk_taste");
    const hasSeenOnboarding = localStorage.getItem("swankk_onboarding_seen");

    if (hasSeenLanding && !hasSeenOnboarding && !savedTaste) {
      setShowOnboarding(true);
    }

    if (savedTaste) {
      setUserTaste(JSON.parse(savedTaste));
    }
  }, [hasSeenLanding]);

  const handleOnboardingComplete = (selectedHouses: string[]) => {
    setUserTaste(selectedHouses);
    localStorage.setItem("swankk_taste", JSON.stringify(selectedHouses));
    localStorage.setItem("swankk_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("swankk_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  const handleEditTaste = (selectedHouses: string[]) => {
    setUserTaste(selectedHouses);
    localStorage.setItem("swankk_taste", JSON.stringify(selectedHouses));
    setShowEditModal(false);
  };

  const { data: allDesigners = [], isLoading: designersLoading } = useQuery({
    queryKey: ["designers"],
    queryFn: () => api.designers.list(),
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: () => api.trends.list(),
  });

  // All eras across all designers (API already parses JSON fields)
  const allEras = (allDesigners as any[]).flatMap((designer: any) => {
    const eras: any[] = designer.eras || [];
    return eras.map((era: any, index: number) => ({
      ...era,
      designer,
      eraIndex: index,
    }));
  });

  const getFilteredContent = () => {
    const trendsList = trends as any[];

    if (!userTaste || userTaste.length === 0) {
      return {
        trends: trendsList.slice(0, 3),
        eras: allEras.slice(0, 6),
      };
    }

    // Match taste selection to designer names
    const selectedDesignerSlugs = (allDesigners as any[])
      .filter((d: any) => userTaste.some((house) => d.name?.toLowerCase().includes(house.toLowerCase())))
      .map((d: any) => d.slug);

    const relevantEras = selectedDesignerSlugs.length > 0
      ? allEras.filter((era: any) => selectedDesignerSlugs.includes(era.designer?.slug))
      : allEras;

    return {
      trends: trendsList.slice(0, 3),
      eras: relevantEras.slice(0, 6),
    };
  };

  const isLoading = trendsLoading || designersLoading;

  const { trends: filteredTrends, eras: filteredEras } = getFilteredContent();

if (!hasSeenLanding) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showOnboarding && (
          <TasteOnboarding
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
            designers={allDesigners as any[]}
          />
        )}
        {showEditModal && (
          <TasteEditModal
            currentHouses={userTaste || []}
            onSave={handleEditTaste}
            onClose={() => setShowEditModal(false)}
            designers={allDesigners as any[]}
          />
        )}
      </AnimatePresence>

      <div className="px-5 md:px-8 py-8 pb-20">
        {userTaste && userTaste.length > 0 && (
          <button
            onClick={() => setShowEditModal(true)}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-gray-400 hover:text-black transition-colors group"
          >
            <span>Tuned to: {userTaste.join(" • ")}</span>
            <Pencil className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" strokeWidth={1.5} />
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-black mb-2">
            The Fashion Index
          </h1>
          <p className="text-sm text-gray-400">
            Trends to save. Eras to understand.
          </p>
        </motion.div>

        {filteredTrends.length > 0 && (
          <div className="mb-16">
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-8">
              Current Trends
            </p>

            <div className="space-y-10">
              {filteredTrends.map((trend: any) => {
                const previewImages = trend.preview_images || [];

                return (
                  <div key={trend.id}>
                    <Link
                      to={createPageUrl(`TrendDetail?slug=${trend.slug}`)}
                      className="font-serif text-2xl md:text-3xl font-medium text-black mb-4 hover:underline inline-block"
                    >
                      {trend.name}
                    </Link>

                    <div className="relative -mx-5 md:-mx-8">
                      <div className="overflow-x-auto scrollbar-hide px-5 md:px-8">
                        <div className="flex gap-3 pb-2">
                          {previewImages.map((img: string, i: number) => (
                            <Link
                              key={i}
                              to={createPageUrl(`TrendDetail?slug=${trend.slug}`)}
                              className="flex-shrink-0 w-[280px] group"
                            >
                              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                                <img
                                  src={cdnUrl(img)}
                                  alt={`${trend.name} ${i + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredEras.length > 0 && (
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-8">
              Fashion Through Time
            </p>

            <div className="space-y-10">
              {filteredEras.filter((era: any) => (era.images?.length ?? 0) > 0)
              .map((era: any) => {
                const eraImages: string[] = era.images || [];

                return (
                  <div key={`${era.designer.id}-${era.eraIndex}`}>
                    <div className="mb-4">
                      <Link
                        to={createPageUrl(`EraGallery?slug=${era.designer.slug}&era=${era.eraIndex}`)}
                        className="font-serif text-2xl md:text-3xl font-medium text-black hover:underline inline-block"
                      >
                        {era.title}
                      </Link>
                      <p className="text-sm text-gray-400 mt-1">
                        {era.year_range} · {era.designer.name}
                      </p>
                    </div>

                    <div className="relative -mx-5 md:-mx-8">
                      <div className="overflow-x-auto scrollbar-hide px-5 md:px-8">
                        <div className="flex gap-3 pb-2">
                          {eraImages.slice(0, 8).map((img: string, i: number) => (
                            <Link
                              key={i}
                              to={createPageUrl(`EraGallery?slug=${era.designer.slug}&era=${era.eraIndex}`)}
                              className="flex-shrink-0 w-[280px] group"
                            >
                              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                                <img
                                  src={cdnUrl(img)}
                                  alt={`${era.title} ${i + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
