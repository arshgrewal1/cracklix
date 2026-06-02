'use client';

import { motion } from "framer-motion";
import { Apple, Play } from "lucide-react";
import Image from "next/image";

export default function AppPreview() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
              Learn. Practice. Succeed.
            </span>

            <h2 className="text-5xl lg:text-7xl font-headline font-bold text-[#0F172A] leading-tight">
              Cracklix in Your
              <span className="text-[#F97316]"> Pocket</span>
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Punjab&apos;s most trusted exam preparation platform. Download now and carry your complete study material and mock tests wherever you go.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-[#0F172A] hover:bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-105 shadow-xl">
                <Apple className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">Download on the</p>
                  <p className="text-xl font-bold leading-none mt-1">App Store</p>
                </div>
              </button>

              <button className="bg-[#0F172A] hover:bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-105 shadow-xl">
                <Play className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">GET IT ON</p>
                  <p className="text-xl font-bold leading-none mt-1">Google Play</p>
                </div>
              </button>
            </div>
          </motion.div>

          <div className="flex justify-center items-center gap-4 lg:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="relative w-44 lg:w-52 h-[380px] lg:h-[450px] bg-gray-100 rounded-[3rem] border-[6px] lg:border-[8px] border-[#0F172A] overflow-hidden shadow-2xl"
            >
              <Image 
                src="https://picsum.photos/seed/mockup1/400/800" 
                fill 
                alt="Cracklix App" 
                className="object-cover"
                data-ai-hint="smartphone app"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="relative w-48 lg:w-56 h-[420px] lg:h-[500px] bg-gray-100 rounded-[3.5rem] border-[8px] lg:border-[10px] border-[#0F172A] overflow-hidden shadow-2xl z-10"
            >
               <Image 
                src="https://picsum.photos/seed/mockup2/400/800" 
                fill 
                alt="Cracklix Dashboard" 
                className="object-cover"
                data-ai-hint="app dashboard"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="relative w-44 lg:w-52 h-[380px] lg:h-[450px] bg-gray-100 rounded-[3rem] border-[6px] lg:border-[8px] border-[#0F172A] overflow-hidden shadow-2xl"
            >
               <Image 
                src="https://picsum.photos/seed/mockup3/400/800" 
                fill 
                alt="Cracklix Results" 
                className="object-cover"
                data-ai-hint="app analysis"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
