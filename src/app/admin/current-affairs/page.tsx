
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Save, Calendar, Search, Newspaper, Globe, Landmark, TrendingUp, Zap, Award } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"

export default function AdminCurrentAffairs() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const caQuery = useMemo(() => (db ? query(collection(db, "current_affairs"), orderBy("date", "desc")) : null), [db])
  const { data: currentAffairs, loading } = useCollection<any>(caQuery)

  const [editingCA, setEditingCA] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = () => {
    if (!db || !editingCA) return
    const caId = editingCA.id || `ca-${Date.now()}`
    const caRef = doc(db, "current_affairs", caId)
    
    const payload = {
      ...editingCA,
      id: caId,
      updatedAt: serverTimestamp(),
      createdAt: editingCA.createdAt || serverTimestamp()
    }

    setDoc(caRef, payload, { merge: true })
      .then(() => {
        toast({ title: "Content Published", description: "Article successfully updated in analysis feed." })
        setEditingCA(null)
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: caRef.path,
          operation: 'write',
          requestResourceData: payload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this analysis article?")) return
    const caRef = doc(db, "current_affairs", id)
    deleteDoc(caRef)
      .then(() => {
        toast({ title: "Deleted", description: "Article removed from cloud." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: caRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const filteredCA = useMemo(() => {
    if (!currentAffairs) return []
    return currentAffairs.filter(ca => 
      ca.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ca.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [currentAffairs, searchTerm])

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Content Hub</span>
           </div>
          <h1 className="text-4xl font-black font-headline text-primary uppercase tracking-tight">Analysis Feed</h1>
          <p className="text-muted-foreground mt-1">Manage institutional news and daily strategic analysis for Punjab aspirants.</p>
        </div>
        <Button onClick={() => setEditingCA({ title: "", category: "Punjab", date: new Date().toLocaleDateString('en-GB'), summary: "", content: "", featured: false })} className="bg-primary hover:bg-primary/90 gap-2 h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20">
          <Plus className="h-5 w-5" /> New Analysis
        </Button>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 bg-muted/20 border-b border-white/5">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-background border-none shadow-inner text-white" 
                placeholder="Search analysis feed..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5">
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Category</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Article Title</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={3} className="px-8"><Skeleton className="h-14 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : filteredCA.map((ca) => (
                <TableRow key={ca.id} className="hover:bg-white/5 group border-white/5 transition-colors">
                  <TableCell className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {ca.date}</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black px-2 py-0.5 uppercase rounded-lg">{ca.category}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-100 text-base leading-snug">{ca.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">ID: {ca.id.slice(-6)}</p>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={() => setEditingCA(ca)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(ca.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingCA} onOpenChange={(open) => !open && setEditingCA(null)}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] bg-[#0F172A] text-white border-white/10 shadow-3xl">
          <DialogHeader className="px-2">
            <DialogTitle className="text-2xl font-black font-headline uppercase">{editingCA?.id ? "Update Analysis" : "Institutional News Composition"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6 custom-scrollbar max-h-[70vh] overflow-y-auto px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Article Date</Label>
                <Input value={editingCA?.date || ""} onChange={e => setEditingCA({...editingCA, date: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="e.g. 24 Oct 2026" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Thematic Category</Label>
                <select value={editingCA?.category || "Punjab"} onChange={e => setEditingCA({...editingCA, category: e.target.value})} className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white text-sm px-4 outline-none">
                  {["Punjab", "India", "International", "Sports", "Economy", "Schemes", "Awards", "Science"].map(cat => (
                    <option key={cat} value={cat} className="bg-[#0F172A]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Headline Statement</Label>
              <Input value={editingCA?.title || ""} onChange={e => setEditingCA({...editingCA, title: e.target.value})} className="bg-white/5 border-white/10 text-lg font-bold rounded-xl h-14" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Abstract Summary</Label>
              <Textarea value={editingCA?.summary || ""} onChange={e => setEditingCA({...editingCA, summary: e.target.value})} className="bg-white/5 border-white/10 min-h-[100px] rounded-2xl p-4 leading-relaxed" placeholder="Brief summary for listing cards..." />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Deep Dive Analysis (Markdown Support)</Label>
              <Textarea value={editingCA?.content || ""} onChange={e => setEditingCA({...editingCA, content: e.target.value})} className="bg-white/5 border-white/10 min-h-[250px] rounded-2xl p-6 font-medium leading-relaxed" placeholder="Institutional analysis body..." />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Image Reference URL</Label>
              <Input value={editingCA?.imageUrl || ""} onChange={e => setEditingCA({...editingCA, imageUrl: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="Unsplash/Picsum URL..." />
            </div>
          </div>
          <DialogFooter className="border-t border-white/5 pt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setEditingCA(null)} className="text-slate-400 hover:text-white rounded-xl">Cancel Draft</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 px-10 font-bold rounded-xl shadow-2xl shadow-primary/20 h-12">
              <Save className="h-5 w-5 mr-3" /> {editingCA?.id ? "Update Feed" : "Commit to Live Feed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
