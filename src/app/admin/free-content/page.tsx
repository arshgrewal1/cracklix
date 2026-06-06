
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Save, Search, LayoutGrid, FileText, Zap, Globe, FileStack, Loader2, X } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Institutional Free Content CMS Node.
 * Allows Admin to manage Mock Tests, PDFs, PYQs, and Analysis articles from one hub.
 */

export default function AdminFreeContent() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const contentQuery = useMemo(() => (db ? query(collection(db, "free_content"), orderBy("updatedAt", "desc")) : null), [db])
  const { data: content, loading } = useCollection<any>(contentQuery)

  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSave = async () => {
    if (!db || !editingItem) return
    const id = editingItem.id || `free-${Date.now()}`
    const docRef = doc(db, "free_content", id)
    
    const payload = {
      ...editingItem,
      id,
      category: "free",
      updatedAt: serverTimestamp(),
      createdAt: editingItem.createdAt || serverTimestamp()
    }

    try {
      await setDoc(docRef, payload, { merge: true })
      toast({ title: "Hub Synced", description: "Content successfully updated in Free Hub." })
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
    <div className="space-y-10 pb-20 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Free Content Registry</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Free Study Hub</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage Mocks, PDFs, and News for the public repository.</p>
        </div>
        <Button onClick={() => setEditingItem({ title: "", description: "", type: "pdf", link: "", fileUrl: "" })} className="bg-primary hover:bg-orange-600 gap-3 h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl">
          <Plus className="h-5 w-5" /> Initialize Content
        </Button>
      </div>

      <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
           <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-16 h-16 rounded-[1.5rem] bg-white border-none shadow-inner text-lg font-medium" 
                placeholder="Search free registry..." 
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
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Type Hub</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase text-slate-500">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={3} className="px-10 py-8"><Skeleton className="h-14 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredContent.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 border-slate-50 transition-all">
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          {item.type === 'mock' ? <Zap className="text-primary" /> : <FileText className="text-blue-500" />}
                       </div>
                       <div>
                          <p className="font-black text-[#0F172A] text-lg uppercase tracking-tight leading-none">{item.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase truncate max-w-xs">{item.description}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                       {item.type?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-white shadow-sm" onClick={() => setEditingItem(item)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-rose-50 hover:text-rose-600 shadow-sm" onClick={() => handleDelete(item.id)}>
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
        <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
          <div className="h-2 w-full bg-[#0F172A]" />
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A]">Content Node Config</DialogTitle>
          </DialogHeader>
          
          <div className="p-10 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Asset Headline</Label>
              <Input value={editingItem?.title || ""} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="h-14 rounded-xl border-slate-100 font-black text-lg text-[#0F172A]" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Abstract Description</Label>
              <Textarea value={editingItem?.description || ""} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="rounded-xl border-slate-100 bg-slate-50 h-24" />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Thematic Type</Label>
                <select value={editingItem?.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none">
                  <option value="mock">Mock Test</option>
                  <option value="pdf">Blueprint PDF</option>
                  <option value="current">Current Affairs</option>
                  <option value="pyq">PYQ Archive</option>
                  <option value="note">Study Note</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Institutional Category</Label>
                <Input value="free" disabled className="h-14 rounded-xl border-none bg-slate-50 font-black uppercase text-[10px] tracking-widest" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Redirect URI (Link or File URL)</Label>
              <Input value={editingItem?.link || ""} onChange={e => setEditingItem({...editingItem, link: e.target.value})} className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold" placeholder="https://..." />
            </div>
          </div>

          <DialogFooter className="p-10 pt-0 flex gap-4">
            <Button variant="ghost" onClick={() => setEditingItem(null)} className="rounded-xl h-14 font-black uppercase text-[10px]">Cancel Draft</Button>
            <Button onClick={handleSave} className="bg-[#0F172A] hover:bg-black h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl">
              Commit to Free Hub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
