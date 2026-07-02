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
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { HelpArticle } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Knowledge Base Hub Management v10.0 (PWA Hardened).
 * FIXED: Removed syntax error. Standardized to Title Case and Primary Blue.
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
       toast({ variant: "destructive", title: "Audit Blocked", description: "Title and Content are mandatory." })
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
      toast({ title: "Help Hub Synced" })
      setEditingArticle(null)
    } catch (e: any) {
      console.error('[HELP_ARTICLE_SAVE_ERROR]:', e);
      toast({ variant: "destructive", title: "Sync Failed", description: e?.message || "Could not save article." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Permanently purge this help article?")) return
    await deleteDoc(doc(db, "help_articles", id))
    toast({ title: "Article Removed" })
  }

  const filteredArticles = useMemo(() => {
    if (!articles) return []
    return articles.filter(a => 
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [articles, searchTerm])

  return (
    <div className="space-y-6 md:space-y-10 text-[#0F172A] text-left animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black text-slate-400">Knowledge Base Hub</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">Help Center</h1>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium">Manage support articles, tutorials and global FAQs.</p>
        </div>
        <Button 
          onClick={() => setEditingArticle({ title: "", category: "FAQ", content: "", published: true, displayOrder: (articles?.length || 0) + 1 })} 
          className="w-full md:w-auto bg-primary hover:bg-blue-700 h-11 md:h-14 px-8 rounded-full font-black text-[10px] tracking-widest shadow-xl border-none active:scale-95 gap-2"
        >
          <Plus className="h-4 w-4" /> Add Knowledge Node
        </Button>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search knowledge base..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Article Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black text-slate-400">Category</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black text-slate-400">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-8"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
              ) : filteredArticles.map((a) => (
                <TableRow key={a.id} className="hover:bg-slate-50 border-slate-50 transition-colors group">
                  <TableCell className="px-6 md:px-12 py-5 md:py-8 text-left">
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105">
                           <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate max-w-[200px] md:max-w-md">{a.title}</p>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] md:text-[9px] px-2.5 py-0.5 rounded uppercase tracking-widest">{a.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditingArticle(a)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(a.id)} className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingArticle} onOpenChange={o => !o && setEditingArticle(null)}>
         <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-primary shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Knowledge Node Architect</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold text-[9px] md:text-sm mt-1">Modify help article or FAQ content.</DialogDescription>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Category</Label>
                     <select value={editingArticle?.category || "FAQ"} onChange={e => setEditingArticle({...editingArticle, category: e.target.value})} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none shadow-inner">
                        <option value="FAQ">General FAQ</option>
                        <option value="PAYMENTS">Payments Hub</option>
                        <option value="PASS">Elite Pass</option>
                        <option value="PWA">App Setup</option>
                        <option value="TECHNICAL">CBT/Technical</option>
                        <option value="ACCOUNT">Account Hub</option>
                     </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1">Display Order</Label>
                     <Input type="number" value={editingArticle?.displayOrder || ""} onChange={e => setEditingArticle({...editingArticle, displayOrder: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Article Headline</Label>
                  <Input value={editingArticle?.title || ""} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className="h-12 md:h-14 rounded-xl border-slate-200 bg-slate-50 font-bold" placeholder="e.g. How to activate Quarterly Pass?" />
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-500 ml-1">Response / Content</Label>
                  <Textarea value={editingArticle?.content || ""} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} className="min-h-[200px] rounded-xl border-slate-200 bg-slate-50 font-medium leading-relaxed" placeholder="Type help content here..." />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4">
               <Button variant="ghost" onClick={() => setEditingArticle(null)} className="h-11 md:h-12 px-6 font-black uppercase text-[10px] text-slate-400">Discard</Button>
               <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-blue-700 text-white h-11 md:h-12 rounded-full font-black text-[10px] tracking-widest shadow-xl gap-2 active:scale-95 border-none">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Commit Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
