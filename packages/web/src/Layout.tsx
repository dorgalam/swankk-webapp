import React from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/swankk/TopBar";

export default function Layout({ children, currentPageName }: { children: React.ReactNode; currentPageName?: string }) {
  const isLandingPage = currentPageName === "Landing";

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --font-serif: 'Playfair Display', Georgia, serif;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .font-serif {
          font-family: var(--font-serif);
        }

        /* Hide scrollbar for carousel */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {!isLandingPage && <TopBar currentPageName={currentPageName} />}
      <main>{children}</main>
      {!isLandingPage && (
        <footer className="px-5 md:px-8 py-6 border-t border-gray-100">
          <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Terms & Conditions
          </Link>
        </footer>
      )}
    </div>
  );
}