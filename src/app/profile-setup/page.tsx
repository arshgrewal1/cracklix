"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import Logo from "@/components/brand/Logo"
import { useToast } from "@/hooks/use-toast"
import { Phone, User as UserIcon, GraduationCap, Calendar, MapPin, ChevronLeft, Loader2 } from "lucide-react"
import { Gender } from "@/types"

/**
 * @file Overview Student Profile Setup v14.4 (Logo Sizing).
 * UPDATED: Further reduced logo size for a cleaner onboarding experience.
 */
export default function ProfileSetup() {
  const router = useRouter()
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "" as Gender | "",
    dob: "",
    address: "",
    targetExam: "",
    state: "Punjab" as const
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.displayName && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.displayName || "" }))
    }
    if (profile) {
       setFormData(prev => ({
          ...prev,
          name: profile.name || prev.name,
          phone: profile.phone?.replace('+91 ', '') || "",
          gender: profile.gender || "",
          dob: profile.dob || "",
          address: profile.address || "",
          targetExam: profile.targetExam || ""
       }));
    }
  }, [user, profile, formData.name]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const payload = {
        id: user.uid,
        name: formData.name.trim(),
        email: user.email,
        phone: formData.phone ? (formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`) : "",
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address.trim(),
        targetExam: formData.targetExam,
        state: "Punjab",
        updatedAt: serverTimestamp(),
      }

      // Purge undefined
      Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

      await setDoc(userRef, payload, { merge: true })

      toast({
        title: "Profile Saved",
        description: "Your information has been updated."
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Please try again later."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-xl flex items-center justify-between mb-8 z-10">
         <button onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
         </button>
         <Logo variant="light" align="center" imgClassName="h-[40px] md:h-[56px]" />
         <div className="w-10 md:w-12" />
      </div>

      <Card className="w-full max-w-xl border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] overflow-hidden z-10 bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center pt-8 md:pt-12 pb-6">
          <CardTitle className="font-headline font-black text-2xl md:text-4xl text-[#0F172A] uppercase tracking-tight">Personalize Experience</CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4 text-xs md:text-base">
            Add your details to get localized preparation nodes and merit rankings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 md:px-12 pb-12">
          <div className="space-y-2 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="e.g. Arsh Grewal" 
                className="pl-12 h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs md:text-sm">+91</span>
                  <Input 
                    type="tel"
                    placeholder="10-digit number" 
                    className="pl-14 md:pl-16 h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</Label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="date"
                    className="pl-12 h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</Label>
                <Select value={formData.gender} onValueChange={(val: Gender) => setFormData(prev => ({ ...prev, gender: val }))}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Board</Label>
              <Select value={formData.targetExam} onValueChange={(val) => setFormData(prev => ({ ...prev, targetExam: val }))}>
                <SelectTrigger className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50 font-bold">
                  <SelectValue placeholder="Select Board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSSSB">PSSSB</SelectItem>
                  <SelectItem value="PPSC">PPSC</SelectItem>
                  <SelectItem value="Punjab Police">Punjab Police</SelectItem>
                  <SelectItem value="Army">Indian Army</SelectItem>
                  <SelectItem value="High Court">High Court</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 text-left">
             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</Label>
             <div className="relative group">
                <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Textarea 
                   placeholder="Enter your home address..." 
                   className="pl-12 min-h-[100px] rounded-xl border-slate-100 bg-slate-50 font-medium"
                   value={formData.address}
                   onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
             </div>
          </div>

          <div className="space-y-4 pt-4">
             <Button 
               className="w-full h-14 md:h-18 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl rounded-2xl transition-all active:scale-95"
               onClick={handleSubmit}
               disabled={isSubmitting}
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Profile Details"}
             </Button>
             
             <Button 
               variant="ghost"
               className="w-full h-12 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:text-[#0F172A]"
               onClick={() => router.push("/dashboard")}
               disabled={isSubmitting}
             >
               Skip for now
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
