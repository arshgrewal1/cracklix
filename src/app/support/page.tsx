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
  Loader2,
  AlertCircle
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
 * @fileOverview Institutional Support Ticket Management Console v6.0.
 * FIXED: Missing imports Link, Loader2, and AlertCircle added.
 */

export default function SupportPage() {
  const { user, profile } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [isRaising, setIsRaising] = useState(false)
  const [raisingLoading, setRaisingLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    type: "PAYMENT",
    message: "",
    priority: "MEDIUM",
  })

  const ticketsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "support_tickets"), where("userId", "==", user.uid))
  }, [db, user])

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
        title: "Wait",
        description: "Subject and message are required.",
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
        title: "Ticket Raised",
        description: "Our team will review your issue shortly.",
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
        title: "Error",
        description: "Could not raise ticket.",
      })
    } finally {
      setRaisingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/30 text-left font-body">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-6 md:space-y-10">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Support Center
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-[#0F172A] tracking-tight leading-[0.9] break-words antialiased">
              Support <br /> <span className="text-primary">Center</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-xl leading-tight tracking-tight">
              Raise tickets for institutional issues or pass activation assistance.
            </p>
          </div>
          <button
            onClick={() => setIsRaising(true)}
            className="h-16 px-10 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-3xl flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" /> Raise New Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <History className="h-4 w-4 text-slate-400" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                My Support Tickets
              </h3>
            </div>

            {ticketsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton className="h-32 w-full rounded-[2rem]" key={i} />
                ))}
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((t: any) => (
                  <Card
                    key={t.id}
                    className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all border border-slate-100"
                  >
                    <CardContent className="p-8 space-y-6">
                      <div className="justify-between items-start flex">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={cn(
                                "border-none text-[8px] font-black uppercase tracking-widest px-3",
                                t.status === "OPEN"
                                  ? "bg-blue-50 text-blue-600"
                                  : t.status === "IN_PROGRESS"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-emerald-50 text-emerald-600"
                              )}
                            >
                              {t.status}
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                              #{t.id.slice(-6)}
                            </span>
                          </div>
                          <h4 className="text-xl font-black text-[#0F172A] mt-2">
                            {t.subject}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {t.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>

                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {t.message}
                        </p>
                      </div>

                      {t.adminReply && (
                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                          </div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest">
                            Team Response
                          </p>
                          <p className="text-sm text-blue-900 font-semibold leading-relaxed italic">
                            "{t.adminReply}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-30">
                <MessageCircle className="h-16 w-16 mb-4 text-slate-300" />
                <p className="text-xl font-bold uppercase tracking-widest">
                  No Active Tickets
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-3xl rounded-[3rem] bg-[#0B1528] text-white p-10 md:p-12 space-y-6 md:space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <Zap className="h-48 w-48" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-2xl">
                  <HelpCircle className="h-8 w-8 fill-current" />
                </div>
                <h3 className="text-3xl font-black uppercase leading-tight">
                  Help Center
                </h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Browse help articles to solve your problems instantly.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-14 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest group"
                >
                  <Link href="/help/">
                    View Help Articles{" "}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={isRaising} onOpenChange={setIsRaising}>
        <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] bg-white rounded-3xl md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-primary shrink-0" />
          <DialogHeader className="p-6 md:p-10 pb-4 shrink-0">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">
                Raise Support Ticket
              </DialogTitle>
              <button
                onClick={() => setIsRaising(false)}
                className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1 uppercase tracking-widest">
              Our team will audit your issue.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">
                  Issue Type
                </Label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-semibold text-sm"
                >
                  <option value="PAYMENT">Payment Issue</option>
                  <option value="PASS">Pass Activation</option>
                  <option value="MOCK_TEST">Mock Test Error</option>
                  <option value="TECHNICAL">App/Technical</option>
                  <option value="ACCOUNT">Account Hub</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">
                  Priority
                </Label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as any })
                  }
                  className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-semibold text-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">
                Subject Headline
              </Label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold"
                placeholder="Brief subject"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">
                Statement of Issue
              </Label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 font-medium"
                placeholder="Describe your issue in detail"
              />
            </div>
          </div>
          <div className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 shrink-0">
            <button
              onClick={() => setIsRaising(false)}
              className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400 bg-transparent border-none cursor-pointer hover:text-slate-600 transition-colors"
            >
              Discard
            </button>
            <Button
              onClick={handleRaiseTicket}
              disabled={raisingLoading}
              className="flex-1 bg-primary hover:bg-blue-700 text-white h-11 md:h-12 rounded-full font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {raisingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
