'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Redirect Node. 
 * Converging all installation traffic to the primary /install PWA hub.
 */
export default function DownloadRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/install');
  }, [router]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Syncing App Hub...</p>
    </div>
  );
}
