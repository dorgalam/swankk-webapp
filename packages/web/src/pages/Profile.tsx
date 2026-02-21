import React, { useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";

export default function Profile() {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate("/Login");
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-[60vh] px-5 md:px-8 pt-8 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-serif text-xl text-black">{user.full_name || "User"}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            to={createPageUrl("Saved")}
            className="block w-full text-left px-4 py-3.5 border border-gray-100 rounded-xl text-sm hover:border-gray-200 transition-colors"
          >
            My Collections
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate("/Login");
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-3.5 border border-gray-100 rounded-xl text-sm text-red-500 hover:border-red-100 hover:bg-red-50/50 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
