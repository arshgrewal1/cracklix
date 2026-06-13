"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Save, Search, Sparkles, FileText, Zap, TrendingUp, FileStack, Loader2, X, Link as LinkIcon, Newspaper } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Free Hub CMS v5.1.
 * ACCESSIBILITY: Added DialogDescription for ARIA compliance.
 */

export default function AdminFreeContent() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const contentQuery = useMemo(() => (db ? query(collection(db, "free_content"), orderBy("updatedAt", "desc")) : null), [db])
  const { data: content, loading } = useCollection<any>(contentQuery)

  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (editingItem && !editingItem.id && editingItem.title) {
       const slug = editingItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
       if (editingItem.slug !== slug) {
          setEditingItem({ ...editingItem, slug });
       }
    }
  }, [editingItem]);

  const handleSave = async () => {
    if (!db || !editingItem) return
    if (!editingItem.title || !editingItem.type) {
       toast({ variant: "destructive", title: "Audit Blocked", description: "Title and Type are mandatory." })
       return
    }

    const id = editingItem.id || `free-${Date.now()}`
    const docRef = doc(db, "free_content", id)
    
    const payload = {
      ...editingItem,
      id,
      updatedAt: serverTimestamp(),
      createdAt: editingItem.createdAt || serverTimestamp()
    }

    try {
      await setDoc(docRef, payload, { merge: true })
      toast({ title: "Registry Synced", description: "Content successfully updated in Free Hub." })
      setEditingItem(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Failed", description: e.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this item from Free Hub?")) return
    await deleteDoc(doc(db!, "free_content", id))
    toast({ title: "Removed", description: "Item purged from cloud registry." })
  }

  const filteredContent = useMemo(() => {
    if (!content) return []
    return content.filter(c => 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [content, searchTerm])

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Free Content Master Registry</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-[#0F172A] uppercase tracking-tight leading-none">Free Hub CMS</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Coordinate Mocks, Notes, and Analysis for the public feed.</p>
        </div>
        <Button onClick={() => setEditingItem({ title: "", description: "", slug: "", type: "note", link: "", fileUrl: "" })} className="bg-primary hover:bg-orange-600 gap-3 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95">
          <Plus className="h-5 w-5" /> Initialize Free Content
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden mx-4">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
           <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-16 h-16 rounded-[1.5rem] bg-white border-none shadow-inner text-lg font-medium text-[#0F172A]" 
                placeholder="Search free repository..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase text-slate-500">Asset Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Hub Type</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">URL / Slug</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase text-slate-500">Audit Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredContent.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 border-slate-50 transition-all group">
                  <TableCell className="px-10 py-8 text-left">
                    <div className="flex items-center gap-6">
                       <div className={cn(
                         "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105",
                         item.type === 'mock' ? 'bg-orange-50 text-primary' : 
                         item.type === 'ca' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                       )}>
                          {item.type === 'mock' ? <Zap className="h-6 w-6" /> : 
                           item.type === 'ca' ? <Newspaper className="h-6 w-6" /> : 
                           item.type === 'pyq' ? <FileStack className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                       </div>
                       <div>
                          <p className="font-black text-[#0F172A] text-xl uppercase tracking-tight leading-none">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase truncate max-w-xs">{item.description}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 text-[9px] font-black uppercase px-3 py-1 rounded-lg">
                       {item.type?.toUpperCase()} HUB
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                     <code className="text-[10px] font-mono text-primary font-bold">/{item.slug || 'no-slug'}</code>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-white hover:text-primary shadow-sm" onClick={() => setEditingItem(item)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(item.id)}>
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

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left flex flex-col">
          <div className="h-2 w-full bg-[#0F172A] shrink-0" />
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A]">Free Asset Registry</DialogTitle>
            <DialogDescription className="sr-only">Add or edit public study materials and mock tests.</DialogDescription>
          </DialogHeader>
          
          <div className="p-10 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Headline</Label>
              <Input value={editingItem?.title || ""} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-lg text-[#0F172A]" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Slug (SEO URL)</Label>
              <Input value={editingItem?.slug || ""} onChange={e => setEditingItem({...editingItem, slug: e.target.value})} className="h-12 rounded-xl border-slate-100 bg-slate-50 font-mono text-xs text-primary" placeholder="e.g. punjab-gk-mock-1" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Marketing Abstract (Description)</Label>
              <Textarea value={editingItem?.description || ""} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="rounded-xl border-slate-100 bg-slate-50 h-24 font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Thematic Type</Label>
                <select value={editingItem?.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-black uppercase text-[10px] outline-none">
                  <option value="mock">FREE MOCK</option>
                  <option value="note">STUDY NOTE</option>
                  <option value="ca">CURRENT AFFAIRS</option>
                  <option value="pyq">OFFICIAL PYQ</option>
                  <option value="pdf">BLUEPRINT PDF</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">State Registry</Label>
                <Input value="PUNJAB" disabled className="h-14 rounded-xl border-none bg-slate-50 font-black uppercase text-[10px] tracking-[0.2em]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                 <LinkIcon className="h-3 w-3" /> Asset Link (Test Path or PDF URL)
              </Label>
              <Input 
                value={editingItem?.link || ""} 
                onChange={e => setEditingItem({...editingItem, link: e.target.value})} 
                className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold text-primary" 
                placeholder="e.g. /mocks/mock-id-here or https://..." 
              />
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Tip: Use '/mocks/ID' for internal tests or 'https://' for external files.</p>
            </div>
          </div>

          <DialogFooter className="p-10 pt-0 flex gap-4">
            <button onClick={() => setEditingItem(null)} className="rounded-xl h-14 px-8 font-black uppercase text-[10px] text-slate-400 hover:text-[#0F172A]">Cancel Draft</button>
            <Button onClick={handleSave} className="bg-[#0F172A] hover:bg-black h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl transition-all active:scale-95">
              Commit to Registry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
