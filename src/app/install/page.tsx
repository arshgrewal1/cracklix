'use client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Download, ShieldCheck, Smartphone } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Constants for build and version
const CURRENT_BUILD_VERSION = "v2.1.8-hotfix";
const BUILD_DATE = "2024-05-18";
const APK_SIZE_MB = 18.2;
const APK_DOWNLOAD_URL = "/downloads/app-release.apk";

// Mock build process
const useMockBuild = () => {
   const [buildProgress, setBuildProgress] = useState(0);
   const [apkFound, setApkFound] = useState(false);

   useEffect(() => {
      const interval = setInterval(() => {
         setBuildProgress(prev => {
            if (prev >= 100) {
               clearInterval(interval);
               setTimeout(() => setApkFound(true), 500);
               return 100;
            }
            return prev + 10;
         });
      }, 200);

      return () => clearInterval(interval);
   }, []);

   return { buildProgress, apkFound };
};

export default function InstallPwaPage() {
   const { buildProgress, apkFound } = useMockBuild();

   const handleDownload = () => {
      window.open(APK_DOWNLOAD_URL, '_blank');
   };
   
   return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side: Feature highlights */}
            <div className="text-slate-800">
               <h1 className="text-4xl md:text-5xl font-bold leading-tight">Get the Full <span className="text-sky-500">Cracklix</span> Experience</h1>
               <p className="mt-4 text-lg text-slate-600">Install the dedicated PWA for exclusive features and a seamless learning environment.</p>
               <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                     <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 mt-1" />
                     <div>
                        <h3 className="font-bold">Offline Mode</h3>
                        <p className="text-slate-600">Access your courses and materials even without an internet connection.</p>
                     </div>
                  </li>
                  <li className="flex items-start">
                     <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 mt-1" />
                     <div>
                        <h3 className="font-bold">Push Notifications</h3>
                        <p className="text-slate-600">Get timely updates on new content, test reminders, and important announcements.</p>
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
                     <h2 className="mt-4 text-2xl font-bold">Install Cracklix PWA</h2>
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
                                 <p className="font-bold text-emerald-600">Build synced successfully!</p>
                                 <p className="text-sm text-slate-500">{APK_SIZE_MB} MB</p>
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
                              <div className="flex items-center justify-center gap-6 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
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
