
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
 * @fileOverview High-Fidelity Aspirant Onboarding v10.0.
 * Mandatory Fields: Name, Phone, Gender, DOB, Address, Target Board.
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

    // Strict Validation Node
    const requiredFields = [
      { key: 'name', label: 'Full Name' },
      { key: 'phone', label: 'Mobile Number' },
      { key: 'gender', label: 'Gender Identity' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'address', label: 'Full Address' },
      { key: 'targetExam', label: 'Target Board' }
    ];

    const missing = requiredFields.find(f => !formData[f.key as keyof typeof formData]?.trim());

    if (missing) {
      toast({
        variant: "destructive",
        title: "Audit Blocked",
        description: `${missing.label} is mandatory for institutional registration.`
      })
      return
    }

    if (formData.phone.length < 10) {
      toast({ variant: "destructive", title: "Invalid Contact", description: "Mobile number must be exactly 10 digits." })
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
        title: "Registry Synced",
        description: "Your preparation journey has been initialized."
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message || "Cloud registry rejection."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      
      <div className="mb-10 z-10">
        <Logo variant="dark" />
      </div>

      <Card className="w-full max-w-xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden z-10">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="font-headline font-black text-3xl text-[#0F172A] uppercase">Aspirant Onboarding</CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4">
            Initialize your identity node to access the high-fidelity mock registry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-10 pb-12">
          <div className="space-y-2 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Identity Name</Label>
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Contact</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="tel"
                    placeholder="10-digit number" 
                    className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender Node</Label>
                <Select onValueChange={(val: Gender) => setFormData(prev => ({ ...prev, gender: val }))}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male Student</SelectItem>
                    <SelectItem value="Female">Female Student</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Target Hub</Label>
              <Select onValueChange={(val) => setFormData(prev => ({ ...prev, targetExam: val }))}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold">
                  <SelectValue placeholder="Select Board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSSSB">PSSSB Boards</SelectItem>
                  <SelectItem value="PPSC">PPSC Gazetted</SelectItem>
                  <SelectItem value="Punjab Police">Punjab Police</SelectItem>
                  <SelectItem value="Army">Indian Army</SelectItem>
                  <SelectItem value="High Court">High Court Clerk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 text-left">
             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correspondence Address</Label>
             <div className="relative">
                <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <Textarea 
                   placeholder="Enter your complete residential address for records..." 
                   className="pl-12 min-h-[100px] rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                   value={formData.address}
                   onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
             </div>
          </div>

          <Button 
            className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl rounded-2xl mt-4 transition-all active:scale-95"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Syncing Identity..." : "Initialize Registry Node"}
          </Button>
          
          <p className="text-[9px] text-center text-slate-400 uppercase font-bold tracking-widest leading-relaxed">
            By initializing, you authorize Arsh Grewal Management to verify your institutional audit nodes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
