import React from "react";
import { Link } from "react-router-dom";
import { Search, Bookmark, User } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";

export default function TopBar(): React.JSX.Element {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-5 md:px-8 h-12">
        <Link to={createPageUrl("Home")} className="flex items-center">
          <span className="font-serif text-[17px] tracking-[0.15em] font-medium text-black">
            SWANKK
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <Link
            to={createPageUrl("Home")}
            className="p-2 rounded-full hover:bg-gray-50 transition-colors"
            aria-label="Search"
          >
            <Search className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={createPageUrl("Saved")}
                className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Saved"
              >
                <Bookmark className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
              </Link>
              <Link
                to={createPageUrl("Profile")}
                className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Profile"
              >
                <User className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
              </Link>
            </>
          ) : (
            <>
              <Link
                to={createPageUrl("Saved")}
                className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Saved"
              >
                <Bookmark className="w-[17px] h-[17px] text-gray-700" strokeWidth={1.5} />
              </Link>
              <Link
                to="/Login"
                className="ml-1 px-3.5 py-1.5 text-[11px] tracking-wider font-medium border border-black rounded-full hover:bg-black hover:text-white transition-all"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
