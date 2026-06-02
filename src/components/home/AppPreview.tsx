'use client';

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Apple, Play } from "lucide-react"
import Image from "next/image"

export default function AppPreview() {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-none px-4 py-1.5 rounded-lg font-bold">
              Learn. Practice. Succeed.
            </Badge>
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-[#0F172A] leading-tight">
              Cracklix in Your <br />
              <span className="text-[#F97316]">Pocket</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Punjab&apos;s most trusted exam preparation app. Download now and carry your complete study material and mock tests wherever you go.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl flex items-center gap-4 transition-all hover:scale-105 shadow-xl">
                <Apple className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">Download on the</p>
                  <p className="text-xl font-bold leading-none mt-1">App Store</p>
                </div>
              </Button>
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl flex items-center gap-4 transition-all hover:scale-105 shadow-xl">
                <Play className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">GET IT ON</p>
                  <p className="text-xl font-bold leading-none mt-1">Google Play</p>
                </div>
              </Button>
            </div>
          </motion.div>

          <div className="relative flex justify-center items-center gap-6 lg:gap-10">
             <PhoneMockup delay={0.1} />
             <PhoneMockup delay={0.2} isCenter />
             <PhoneMockup delay={0.3} />
          </div>
        </div>
      </div>
    </section>
  )
}

function PhoneMockup({ delay, isCenter = false }: { delay: number, isCenter?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: isCenter ? -50 : 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className={`relative ${isCenter ? 'h-[500px] w-[240px] rounded-[3.5rem] border-[8px]' : 'h-[450px] w-[220px] rounded-[3rem] border-[10px]'} border-black bg-white shadow-2xl overflow-hidden`}
    >
      {/* Notch / Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 bg-black rounded-b-3xl w-32 z-20 flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
      </div>

      <div className="p-4 pt-12 space-y-4 h-full bg-slate-50">
        <div className="h-28 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 space-y-2">
           <div className="h-2 w-20 bg-blue-500/20 rounded" />
           <div className="h-4 w-32 bg-blue-500/30 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-white border shadow-sm p-3 flex flex-col justify-end gap-1.5">
               <div className="h-2 w-8 bg-gray-100 rounded" />
               <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        <div className="h-32 rounded-2xl bg-white border shadow-sm p-4 space-y-3">
           <div className="h-3 w-24 bg-gray-100 rounded" />
           <div className="flex gap-2">
              <div className="h-8 w-8 rounded bg-orange-500/10" />
              <div className="space-y-1.5 flex-1">
                 <div className="h-2 w-full bg-gray-100 rounded" />
                 <div className="h-2 w-2/3 bg-gray-100 rounded" />
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  )
}
