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
import { Phone, User as UserIcon, GraduationCap, Calendar, MapPin } from "lucide-react"
import { Gender } from "@/types"

/**
 * @fileOverview Student Profile Setup v13.0 (UI Fixes).
 * FIXED: Increased phone input padding to prevent overlap with +91.
 */
export default function ProfileSetup() {
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
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
    if (user?.displayName) {
      setFormData(prev => ({ ...prev, name: user.displayName || "" }))
    }
  }, [user])

  const handleSubmit = async () => {
    if (!user) return;

    const requiredFields = [
      { key: 'name', label: 'Full Name' },
      { key: 'phone', label: 'Mobile Number' },
      { key: 'gender', label: 'Gender' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'address', label: 'Home Address' },
      { key: 'targetExam', label: 'Target Board' }
    ];

    const missing = requiredFields.find(f => !formData[f.key as keyof typeof formData]?.trim());

    if (missing) {
      toast({
        variant: "destructive",
        title: "Setup Blocked",
        description: `${missing.label} is required to continue.`
      })
      return
    }

    if (formData.phone.length < 10) {
      toast({ variant: "destructive", title: "Invalid Number", description: "Mobile number must be 10 digits." })
      return
    }

    setIsSubmitting(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const payload = {
        id: user.uid,
        name: formData.name.trim(),
        email: user.email,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address.trim(),
        targetExam: formData.targetExam,
        state: "Punjab",
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        status: 'Free',
        role: 'STUDENT',
        pinnedExams: []
      }

      await setDoc(userRef, payload, { merge: true })

      toast({
        title: "Profile Created",
        description: "Welcome to Cracklix! Your setup is complete."
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Please try again later."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      
      <div className="mb-10 z-10">
        <Logo variant="dark" align="center" />
      </div>

      <Card className="w-full max-w-xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden z-10">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="font-headline font-black text-3xl text-[#0F172A] uppercase">Set Up Your Profile</CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4">
            Finish setting up your student profile to access personalized mock tests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-10 pb-12">
          <div className="space-y-2 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="e.g. Arsh Grewal" 
                className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</span>
                  <Input 
                    type="tel"
                    placeholder="10-digit number" 
                    className="pl-20 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="date"
                    className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</Label>
                <Select onValueChange={(val: Gender) => setFormData(prev => ({ ...prev, gender: val }))}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold">
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Exam Board</Label>
              <Select onValueChange={(val) => setFormData(prev => ({ ...prev, targetExam: val }))}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold">
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
             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Residential Address</Label>
             <div className="relative">
                <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <Textarea 
                   placeholder="Enter your full home address..." 
                   className="pl-12 min-h-[100px] rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                   value={formData.address}
                   onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
             </div>
          </div>

          <div className="space-y-4 pt-4">
             <Button 
               className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl rounded-2xl transition-all active:scale-95"
               onClick={handleSubmit}
               disabled={isSubmitting}
             >
               {isSubmitting ? "Saving Profile..." : "Complete My Profile"}
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
          
          <p className="text-[9px] text-center text-slate-400 uppercase font-bold tracking-widest leading-relaxed">
            Your details are used only for generating accurate state-level rankings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
