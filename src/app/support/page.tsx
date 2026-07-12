"use client"

import React, { useState, useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, where } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageCircle,
  Send,
  History,
  HelpCircle,
  ChevronRight,
  Zap,
  ShieldCheck,
  Plus,
  X,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import Link from "next/link"

/**
 * @fileOverview Official Student Support Hub v5.1.
 * FIXED: Refined spacing and typography to ensure balanced layouts.
 */

export default function SupportPage() {
  const { user, profile } = useUser()
  const db = useFirestore();
  const { toast } = useToast()

  const [isRaising, setIsRaising] = useState(false)
  const [raisingLoading, setRaisingLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    type: "PAYMENT" as const,
    message: "",
    priority: "MEDIUM" as const,
  })

  const ticketsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "support_tickets"), where("userId", "==", user.uid))
  }, [user, db])

  const { data: rawTickets, loading: ticketsLoading } = useCollection<any>(
    ticketsQuery
  )

  const tickets = useMemo(() => {
    if (!rawTickets) return []
    return [...rawTickets].sort((a: any, b: any) => {
      const tA = a.createdAt?.seconds || 0
      const tB = b.createdAt?.seconds || 0
      return tB - tA
    })
  }, [rawTickets])

  const handleRaiseTicket = async () => {
    if (!user || !db) return
    if (!formData.subject || !formData.message) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Subject and message are required nodes.",
      })
      return
    }

    setRaisingLoading(true)
    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        userName: profile?.name || "Student",
        userEmail: user.email,
        ...formData,
        status: "OPEN",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      toast({
        title: "Ticket raised",
        description: "Our team will audit your issue shortly.",
      })
      setIsRaising(false)
      setFormData({
        subject: "",
        type: "PAYMENT",
        message: "",
        priority: "MEDIUM",
      })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Transmission failure",
        description: "Could not sync ticket to registry.",
      })
    } finally {
      setRaisingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/30 text-left font-body">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-6xl space-y-16 pb-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-14">
          <div className="space-y-6 md:space-y-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Support Desk
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-[#0F172A] tracking-tight leading-[0.9] break-words antialiased">
              Support Center
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-xl leading-snug tracking-tight">
              Raise tickets for institutional issues or pass activation assistance.
            </p>
          </div>
          <button
            onClick={() => setIsRaising(true)}
            className="h-16 md:h-20 px-10 md:px-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-2xl md:rounded-[2rem] shadow-4xl flex items-center gap-3 transition-all active:scale-95 border-none"
          >
            <Plus className="h-5 w-5 md:h-6 md:w-6" /> Raise New Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <div className="flex items-center gap-3 px-2">
              <History className="h-4 w-4 text-slate-400" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                My support history
              </h3>
            </div>

            {ticketsLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton className="h-40 w-full rounded-[2.5rem] bg-white" key={i} />
                ))}
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-6 md:space-y-10">
                {tickets.map((t: any) => (
                  <Card
                    key={t.id}
                    className="border-none shadow-xl hover:shadow-4xl rounded-[2.5rem] md:rounded-[3rem] bg-white overflow-hidden group transition-all duration-500 border border-slate-100"
                  >
                    <CardContent className="p-8 md:p-12 space-y-8">
                      <div className="justify-between items-start flex flex-col md:flex-row gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={cn(
                                "border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                t.status === "OPEN"
                                  ? "bg-blue-50 text-blue-600"
                                  : t.status === "IN_PROGRESS"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-emerald-50 text-emerald-600"
                              )}
                            >
                              {t.status}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                              #{t.id.slice(-6)}
                            </span>
                          </div>
                          <h4 className="text-xl md:text-3xl font-black text-[#0F172A] leading-tight">
                            {t.subject}
                          </h4>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums bg-slate-50 px-3 py-1 rounded-lg">
                          {t.createdAt?.toDate().toLocaleDateString('en-GB')}
                        </span>
                      </div>

                      <div className="p-6 md:p-10 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <p className="text-sm md:text-lg text-slate-600 font-medium leading-relaxed italic">
                          &quot;{t.message}&quot;
                        </p>
                      </div>

                      {t.adminReply && (
                        <div className="p-6 md:p-10 bg-blue-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-blue-100 space-y-4 relative overflow-hidden shadow-sm">
                          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                            <ShieldCheck className="h-32 w-32 text-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                             <ShieldCheck className="h-4 w-4 text-primary" />
                             <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                                Institutional Response
                             </p>
                          </div>
                          <p className="text-base md:text-2xl font-black text-blue-900 leading-tight tracking-tight relative z-10">
                            &quot;{t.adminReply}&quot;
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-32 bg-white rounded-[3rem] md:rounded-[4rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-30 shadow-inner mx-2">
                <MessageCircle className="h-20 w-20 mb-6 text-slate-300" />
                <p className="text-xl font-bold tracking-[0.2em] uppercase">
                  No Support Nodes Found
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8 md:space-y-12">
            <Card className="border-none shadow-3xl rounded-[3rem] bg-[#0B1528] text-white p-8 md:p-14 space-y-8 md:space-y-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Zap className="h-64 w-64 text-primary" />
              </div>
              <div className="relative z-10 space-y-8 md:space-y-12">
                <div className="h-16 w-16 bg-primary/20 rounded-[1.5rem] flex items-center justify-center text-primary shadow-3xl border border-primary/20">
                  <HelpCircle className="h-8 w-8 fill-current" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black leading-none text-white tracking-tight uppercase">
                    Knowledge <br/> Hub
                  </h3>
                  <p className="text-slate-400 text-base md:text-xl font-medium leading-snug">
                    Browse verified help articles to solve problems instantly.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-16 md:h-20 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-full font-black uppercase text-[10px] md:text-xs tracking-[0.2em] group shadow-2xl transition-all"
                >
                  <Link href="/help">
                    Enter Help Center{" "}
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={isRaising} onOpenChange={setIsRaising}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] bg-white rounded-3xl md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-primary shrink-0" />
          <DialogHeader className="p-6 md:p-14 pb-4 shrink-0">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight uppercase leading-none">
                Audit Ticket
              </DialogTitle>
              <button
                onClick={() => setIsRaising(false)}
                className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            <DialogDescription className="text-slate-400 font-bold text-[10px] md:text-[11px] mt-2 tracking-widest uppercase">
              Initiate a verified support node.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 md:px-14 pb-8 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Issue type
                </Label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-xl px-5 font-bold text-sm outline-none shadow-inner"
                >
                  <option value="PAYMENT">Payment Hub</option>
                  <option value="PASS">Pass Activation</option>
                  <option value="MOCK_TEST">Mock Test Error</option>
                  <option value="TECHNICAL">App Performance</option>
                  <option value="ACCOUNT">Security / Identity</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Priority
                </Label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as any })
                  }
                  className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-xl px-5 font-bold text-sm outline-none shadow-inner"
                >
                  <option value="LOW">Low Hub</option>
                  <option value="MEDIUM">Standard</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Audit</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                Subject Headline
              </Label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="h-12 md:h-16 rounded-xl border-slate-100 bg-slate-50 font-black px-6 text-sm md:text-lg"
                placeholder="e.g. UPI verification failed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                Issue Narrative
              </Label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="min-h-[150px] rounded-[1.5rem] md:rounded-[2rem] border-slate-100 bg-slate-50 font-medium px-6 py-5 leading-relaxed text-sm md:text-lg resize-none shadow-inner"
                placeholder="Describe your issue in detail for our audit team..."
              />
            </div>
          </div>
          <div className="p-6 md:p-14 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 shrink-0">
            <button
              onClick={() => setIsRaising(false)}
              className="h-12 md:h-14 px-8 font-black text-[10px] md:text-[11px] text-slate-400 bg-transparent border-none cursor-pointer hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Discard
            </button>
            <Button
              onClick={handleRaiseTicket}
              disabled={raisingLoading}
              className="flex-1 h-12 md:h-16 lg:h-20 bg-primary hover:bg-blue-700 text-white font-black text-[10px] md:text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-none shadow-4xl uppercase rounded-full"
            >
              {raisingLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 md:h-6 md:w-6" />
              )}
              Transmit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
