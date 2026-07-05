
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

/**
 * @fileOverview Static Not Found Page.
 * FIXED: Removed dynamic 'headers' import to support static export (output: export).
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-black text-[#0F172A]">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0F172A]">Page Not Found</h2>
          <p className="text-slate-500 font-medium">
            The resource you are looking for has been moved or archived.
          </p>
        </div>
        <Button asChild className="bg-[#0F172A] hover:bg-black text-white h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3">
          <Link href="/"><Home className="h-4 w-4" /> Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
