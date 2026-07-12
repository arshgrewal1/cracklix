"use client";

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save, HelpCircle, Search, Loader2, X, Layers, BookOpen } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { HelpArticle } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Knowledge Base Hub Management v11.0 (Spatial Balance Fix).
 * FIXED: Refined header spacing and table density for professional admin look.
 * FIXED: Standardized button labels and high-fidelity iconography.
 */

export default function HelpCenterManagement() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const helpQuery = useMemo(() => (db ? collection(db, "help_articles") : null), [db])
  const { data: rawArticles, loading } = useCollection<HelpArticle>(helpQuery as any)

  const articles = useMemo(() => {
    if (!rawArticles) return [];
    return [...rawArticles].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawArticles]);

  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = async () => {
    if (!db || !editingArticle) return
    if (!editingArticle.title || !editingArticle.content) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Title and Content are mandatory nodes." })
       return
    }

    setIsSaving(true)
    const id = editingArticle.id || `help-${Date.now()}`
    try {
      await setDoc(doc(db, "help_articles", id), {
        ...editingArticle,
        id,
        updatedAt: serverTimestamp(),
        createdAt: editingArticle.createdAt || serverTimestamp(),
        displayOrder: parseInt(editingArticle.displayOrder) || 1
      }, { merge: true })
      toast({ title: "Registry Synced", description: "Knowledge node successfully updated." })
      setEditingArticle(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this help article?")) return
    await deleteDoc(doc(db, "help_articles", id))
    toast({ title: "Removed from Registry" })
  }

  const filteredArticles = useMemo(() => {
    if (!articles) return []
    return articles.filter(a => 
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [articles, searchTerm])

  return (
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-700 pb-20 pt-2">
      
      {/* 1. HEADER HUB - BALANCED SPACING */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-1">
        <div className="space-y-2">
           <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Knowledge Base Hub</span>
           </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tight text-[#0F172A] leading-none">Help Center</h1>
          <p className="text-slate-500 text-[13px] md:text-lg font-medium leading-tight">Manage support articles, tutorials and global FAQs.</p>
        </div>
        <Button 
          onClick={() => setEditingArticle({ title: "", category: "FAQ", content: "", published: true, displayOrder: (articles?.length || 0) + 1 })} 
          className="w-full md:w-auto h-12 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none active:scale-95 transition-all gap-3 shrink-0"
        >
          <Plus className="h-5 w-5" /> Add Knowledge Node
        </Button>
      </div>

      {/* 2. SEARCH ENGINE */}
      <div className="relative group px-1 max-w-2xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-18 pl-14 rounded-2xl md:rounded-[2rem] bg-white border-slate-100 shadow-xl text-base md:text-lg font-bold" 
           placeholder="Search knowledge registry..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      {/* 3. DATA LEDGER */}
      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Article Identity</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Category Node</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-8 py-8 md:py-12 md:px-12"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>)
              ) : filteredArticles.length > 0 ? filteredArticles.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-12 text-left">
                     <div className="flex items-center gap-4 md:gap-8">
                        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110">
                           <BookOpen className="h-5 w-5 md:h-7 md:w-7 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-black text-[#0F172A] text-sm md:text-xl leading-tight truncate max-w-[250px] md:max-w-md">{a.title}</p>
                           <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Order: {a.displayOrder} • ID: {a.id.slice(-6)}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] md:text-[10px] px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                        {a.category} HUB
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingArticle(a)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(a.id)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={3} className="h-80 md:h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-6">
                         <Layers className="h-20 w-20 md:h-32 md:w-32 text-slate-400" />
                         <p className="font-black text-sm md:text-2xl uppercase tracking-widest">Registry Empty</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. MODAL HUB */}
      <Dialog open={!!editingArticle} onOpenChange={o => !o && !isSaving && setEditingArticle(null)}>
         <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-14 pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">Knowledge Node</DialogTitle>
                  <button onClick={() => setEditingArticle(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"><X className="h-6 w-6 text-slate-400" /></button>
               </div>
               <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-2">Modify help article or official FAQ.</DialogDescription>
            </DialogHeader>

            <div className="px-6 md:px-14 pb-8 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Archive Category</Label>
                     <select value={editingArticle?.category || "FAQ"} onChange={e => setEditingArticle({...editingArticle, category: e.target.value})} className="w-full h-12 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-bold text-sm shadow-inner appearance-none cursor-pointer">
                        <option value="FAQ">General FAQ</option>
                        <option value="PAYMENTS">Payments Hub</option>
                        <option value="PASS">Elite Pass</option>
                        <option value="PWA">App Setup</option>
                        <option value="TECHNICAL">CBT/Technical</option>
                        <option value="ACCOUNT">Account Hub</option>
                     </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Display Order</Label>
                     <Input type="number" value={editingArticle?.displayOrder || ""} onChange={e => setEditingArticle({...editingArticle, displayOrder: e.target.value})} className="h-12 md:h-16 rounded-2xl border-none bg-slate-50 font-black text-center shadow-inner" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Article Headline</Label>
                  <Input value={editingArticle?.title || ""} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className="h-14 md:h-18 rounded-2xl border-none bg-slate-50 font-black text-lg md:text-2xl px-6 shadow-inner" placeholder="e.g. How to activate Quarterly Pass?" />
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Response Content (Official Statement)</Label>
                  <Textarea value={editingArticle?.content || ""} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} className="min-h-[250px] rounded-[1.5rem] md:rounded-[2.5rem] border-none bg-slate-50 p-6 md:p-10 font-medium leading-relaxed shadow-inner" placeholder="Type verified help content here..." />
               </div>
            </div>

            <DialogFooter className="p-6 md:p-14 pt-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingArticle(null)} className="w-full sm:w-auto h-12 md:h-14 px-8 font-black uppercase text-[10px] md:text-[11px] text-slate-400">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-blue-700 text-white h-12 md:h-16 rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl gap-3 active:scale-95 border-none">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit Knowledge Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
