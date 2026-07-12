"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

const publicPaths = ["/login", "/register"];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = publicPaths.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.replace("/login");
    if (user && isPublic) router.replace("/");
  }, [loading, user, pathname, router, isPublic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isPublic) return null;
  if (user && isPublic) return null;

  if (isPublic) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 px-8 py-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}