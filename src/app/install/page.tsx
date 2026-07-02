'use client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { CheckCircle, Download, ShieldCheck, Smartphone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PLATFORM_VERSION } from "@/lib/version";

// Real build/version data from the global versioning registry.
const CURRENT_BUILD_VERSION = `v${PLATFORM_VERSION.version}`;
const BUILD_DATE = PLATFORM_VERSION.releaseDate;
// The signed APK is published as a GitHub Release asset by the CI workflow.
const APK_DOWNLOAD_URL = "https://github.com/arshgrewal1/cracklix/releases/latest/download/cracklix.apk";

export default function InstallPwaPage() {
   const [buildProgress, setBuildProgress] = useState(10);
   const [apkFound, setApkFound] = useState(false);

   const handleDownload = () => {
      window.open(APK_DOWNLOAD_URL, '_blank');
   };

   useEffect(() => {
      let active = true;
      // Verify the release APK is actually reachable before enabling download.
      const timer = setInterval(() => {
         setBuildProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      fetch(APK_DOWNLOAD_URL, { method: 'HEAD' })
         .then(res => {
            if (!active) return;
            setBuildProgress(100);
            if (res.ok) {
               setApkFound(true);
               // Automatically start the download once the build is confirmed.
               window.open(APK_DOWNLOAD_URL, '_blank');
            }
         })
         .catch(() => {
            if (active) setBuildProgress(100);
         });

      return () => {
         active = false;
         clearInterval(timer);
      };
   }, []);
   
   return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side: Feature highlights */}
            <div className="text-slate-800">
               <h1 className="text-4xl md:text-5xl font-bold leading-tight">Get the Full <span className="text-sky-500">Cracklix</span> Experience</h1>
               <p className="mt-4 text-lg text-slate-600">Install the official Android app for exclusive features and a seamless learning environment.</p>
               <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                     <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 mt-1" />
                     <div>
                        <h3 className="font-bold">Secure Native App</h3>
                        <p className="text-slate-600">A signed, Play Protect–verified Android build for a safe and trusted experience.</p>
                     </div>
                  </li>
                  <li className="flex items-start">
                     <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 mt-1" />
                     <div>
                        <h3 className="font-bold">Full-Screen Experience</h3>
                        <p className="text-slate-600">A distraction-free, full-screen interface built for focused test practice.</p>
                     </div>
                  </li>
                  <li className="flex items-start">
                     <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 mt-1" />
                     <div>
                        <h3 className="font-bold">Faster Performance</h3>
                        <p className="text-slate-600">Enjoy a smoother, more responsive experience optimized for your device.</p>
                     </div>
                  </li>
               </ul>
            </div>

            {/* Right side: Download card */}
            <div>
               <Card className="p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-col items-center text-center">
                     <Smartphone className="h-16 w-16 text-sky-500" />
                     <h2 className="mt-4 text-2xl font-bold">Install Cracklix App</h2>
                     <p className="text-slate-500 mt-1">Build {CURRENT_BUILD_VERSION} ({BUILD_DATE})</p>
                     
                     <div className="w-full mt-8">
                        {!apkFound ? (
                           <div className="w-full">
                              <p className="text-sm font-medium">Syncing latest build...</p>
                              <Progress value={buildProgress} className="mt-2" />
                              <p className="text-xs text-slate-400 mt-2">{buildProgress}% complete</p>
                           </div>
                        ) : (
                           <div className="flex flex-col items-center gap-4">
                              <div className="text-center">
                                 <p className="font-bold text-emerald-600">Latest build ready!</p>
                                 <p className="text-sm text-slate-500">Signed Android release</p>
                              </div>
                              <Button 
                                 size="lg" 
                                 className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                                 onClick={handleDownload}
                                 disabled={!apkFound}
                              >
                                 <Download className="h-5 w-5" />
                                 {apkFound ? 'Download APK Now' : 'Syncing Build...'}
                              </Button>
                              <div className="flex items-center justify-center gap-6 text-slate-500 font-bold text-[10px] tracking-widest">
                                 <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Play Protect Verified</span>
                                 <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Version Control Active</span>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
}
