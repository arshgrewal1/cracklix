
'use client';

import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";

/**
 * @fileOverview Institutional Session Guard v1.0.
 * Enforces "1 Account = 1 Active Device" policy via real-time Firestore listeners.
 */

export default function SessionGuard() {
  const { user, currentDeviceId, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    // 1. Stability Guard: Only listen if user is authenticated and local device ID is ready
    if (loading || !user || !db || !currentDeviceId || conflict) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      // 2. Conflict Detection: If Firestore active ID differs from local ID, session was stolen/moved
      if (data.activeDeviceId && data.activeDeviceId !== currentDeviceId) {
        setConflict(true);
        // 3. Instant Invalidation
        try {
          await signOut(auth);
        } catch (e) {
          console.error("[SESSION_GUARD_SIGNOUT_FAIL]:", e);
        }
      }
    });

    return () => unsub();
  }, [user, db, currentDeviceId, auth, loading, conflict]);

  if (!conflict) return null;

  return (
    <Dialog open={conflict} onOpenChange={() => {}}>
      <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[3rem] max-w-md p-10 shadow-5xl text-center z-[5000]">
        <div className="space-y-6">
          <div className="h-20 w-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-500/20">
            <ShieldAlert className="h-10 w-10" />
          </div>
          
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-headline font-black uppercase text-white">Session Terminated</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm leading-relaxed">
              Your account was logged in on another device. For security reasons, this session has been terminated instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Node Policy</p>
             <p className="text-[11px] text-slate-300 font-medium">1 Account = 1 Active Session. Re-login to this device to regain access.</p>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              onClick={() => {
                setConflict(false);
                router.replace("/login?reason=device-conflict");
              }}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-3xl border-none transition-all active:scale-95"
            >
              <LogOut className="h-4 w-4 mr-2" /> Re-Login to Secure Node
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
