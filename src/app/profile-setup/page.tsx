"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import Logo from "@/components/brand/Logo"
import { useToast } from "@/hooks/use-toast"
import { Phone, User as UserIcon, GraduationCap } from "lucide-react"

export default function ProfileSetup() {
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    targetExam: "",
    state: "Punjab"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.displayName) {
      setFormData(prev => ({ ...prev, name: user.displayName || "" }))
    }
  }, [user])

  const handleSubmit = async () => {
    if (!user || !formData.name || !formData.targetExam || !formData.phone) {
      toast({
        variant: "destructive",
        title: "Incomplete Profile",
        description: "Please fill in all details to proceed."
      })
      return
    }

    setIsSubmitting(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        id: user.uid,
        name: formData.name,
        email: user.email,
        phone: formData.phone,
        targetExam: formData.targetExam,
        state: "Punjab",
        createdAt: serverTimestamp(),
        status: 'Free' // Default status
      }, { merge: true })

      toast({
        title: "Profile Updated",
        description: "Your preparation journey starts now!"
      })
      router.push("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Something went wrong while saving your profile."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      
      <div className="mb-10 z-10">
        <Logo variant="dark" />
      </div>

      <Card className="w-full max-w-lg border-none shadow-2xl rounded-[2rem] overflow-hidden z-10">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="text-center pt-10 pb-6">
          <CardTitle className="font-headline font-black text-3xl text-[#0F172A]">Almost There!</CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4">
            Personalise your experience to get the most accurate mock tests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-10 pb-12">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name (as per ID)</Label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Arsh Grewal" 
                className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                type="tel"
                placeholder="+91 98XXX XXXXX" 
                className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50/50"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">State</Label>
              <Input value="Punjab" disabled className="h-12 rounded-xl bg-slate-100/50 border-slate-100 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Board</Label>
              <div className="relative">
                <Select onValueChange={(val) => setFormData(prev => ({ ...prev, targetExam: val }))}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder="Target Board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PSSSB">PSSSB</SelectItem>
                    <SelectItem value="PPSC">PPSC</SelectItem>
                    <SelectItem value="Punjab Police">Punjab Police</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="High Court">High Court</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 rounded-xl mt-4"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.targetExam || !formData.phone}
          >
            {isSubmitting ? "Initialising Journey..." : "Start My Journey"}
          </Button>
          
          <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest leading-relaxed">
            By continuing, you agree to receive exam alerts and platform updates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
