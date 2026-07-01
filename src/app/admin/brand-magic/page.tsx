"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, ImageIcon, Download, Share2, RefreshCw, ChevronLeft, Wand2 } from "lucide-react"
import { transformLogo } from "@/ai/flows/transform-logo-flow"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"

/**
 * @fileOverview Institutional Brand Magic Hub v1.1.
 * FIXED: Replaced legacy img tags with next/image and resolved lint errors.
 */

export default function BrandMagicPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleGenerate = async () => {
    if (!preview) return
    setIsGenerating(true)
    try {
      const response = await transformLogo({ logoDataUri: preview })
      setResult(response.transformedImageDataUri)
      toast({ title: "Magic Complete", description: "Your cinematic asset is ready." })
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Transformation Failed", description: (err as Error).message })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-12 pb-24 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Wand2 className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Creative Asset Generator</span>
           </div>
          <h1 className="text-5xl font-black font-headline text-primary uppercase tracking-tight">Brand Magic</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Reimagine the Cracklix identity in cinematic environments.</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200"><ChevronLeft className="h-8 w-8" /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
         <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden">
               <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="font-headline font-black text-2xl uppercase">Identity Reference</CardTitle>
               </CardHeader>
               <CardContent className="p-10 space-y-10">
                  <div className="relative group">
                     <div className={cn(
                       "aspect-square rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-slate-50",
                       preview ? "border-primary/20" : "border-slate-200 hover:border-primary/40"
                     )}>
                        {preview ? (
                           <div className="relative w-full h-full p-10">
                              <Image src={preview} alt="Logo Preview" fill sizes="400px" className="object-contain" />
                           </div>
                        ) : (
                           <div className="text-center space-y-4">
                              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                                 <ImageIcon className="h-8 w-8 text-slate-300" />
                              </div>
                              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Upload Logo Node</p>
                           </div>
                        )}
                        <input 
                           type="file" 
                           accept="image/*" 
                           onChange={handleFileChange}
                           className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Transformation Protocol</p>
                     <div className="p-5 bg-[#0F172A] rounded-2xl border border-white/5 space-y-2">
                        <p className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-2">
                           <Sparkles className="h-3 w-3" /> Tropical Jungle Waterfall
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                           Golden sunset lighting, mystical atmosphere, vibrant green palette. Reference preservation active.
                        </p>
                     </div>
                  </div>

                  <Button 
                     onClick={handleGenerate} 
                     disabled={!preview || isGenerating}
                     className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] shadow-4xl gap-4 group transition-all active:scale-95 border-none"
                  >
                     {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 text-white fill-current" />}
                     {isGenerating ? "GENERATING ASSET..." : "INITIALIZE TRANSFORMATION"}
                  </Button>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-7">
            <Card className="border-none shadow-3xl bg-[#0B1528] rounded-[4rem] h-full flex flex-col overflow-hidden relative">
               <div className="absolute top-0 right-0 p-12 opacity-5"><Sparkles className="h-80 w-80" /></div>
               <CardHeader className="p-12 border-b border-white/5">
                  <CardTitle className="font-headline font-black text-3xl uppercase text-white flex items-center gap-4">
                    Cinematic Output Hub
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-12 flex-1 flex flex-col items-center justify-center relative z-10">
                  <div className="w-full aspect-square rounded-[3.5rem] bg-black/40 border-2 border-white/5 flex flex-col items-center justify-center transition-all overflow-hidden relative group shadow-5xl">
                     {result ? (
                        <>
                           <Image src={result} alt="Transformed Result" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-6">
                              <Button asChild className="h-16 px-10 rounded-2xl bg-white text-[#0F172A] hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest gap-3">
                                 <a href={result} download="cracklix-magic.png">
                                    <Download className="h-5 w-5" /> Download Asset
                                 </a>
                              </Button>
                           </div>
                        </>
                     ) : (
                        <div className="text-center space-y-6 opacity-20">
                           <div className="h-24 w-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                              <RefreshCw className={cn("h-12 w-12 text-white", isGenerating && "animate-spin")} />
                           </div>
                           <p className="text-sm font-black uppercase text-white tracking-[0.5em]">Awaiting Generation</p>
                        </div>
                     )}
                  </div>
                  
                  {result && (
                     <div className="mt-12 flex w-full gap-4">
                        <Button variant="ghost" onClick={() => setResult(null)} className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] text-slate-400 tracking-widest hover:text-white">Discard</Button>
                        <Button className="flex-[2] h-16 bg-white text-black hover:bg-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl"><Share2 className="h-5 w-5" /> Publish to Feed</Button>
                     </div>
                  )}
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
