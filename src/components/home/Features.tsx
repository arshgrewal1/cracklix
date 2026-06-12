'use client';

import { motion } from "framer-motion";
import { Clipboard, Search, TrendingUp, Smartphone } from "lucide-react";

/**
 * @fileOverview Responsive Features Hub.
 * SIMPLIFIED: Replaced technical jargon with easy words (Solutions, Report).
 */

const features = [
  { 
    icon: <Clipboard className="h-5 w-5 md:h-6 md:w-6" />, 
    title: "Pattern Based Mocks", 
    desc: "Practice tests designed exactly like real government exams.",
    variant: "blue"
  },
  { 
    icon: <Search className="h-5 w-5 md:h-6 md:w-6" />, 
    title: "Step-by-step Solutions", 
    desc: "Detailed explanations to help you understand every answer.",
    variant: "orange"
  },
  { 
    icon: <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />, 
    title: "Progress Report", 
    desc: "Check your Punjab state rank and overall preparation level.",
    variant: "blue"
  },
  { 
    icon: <Smartphone className="h-5 w-5 md:h-6 md:w-6" />, 
    title: "Easy Learning", 
    desc: "Study anywhere, anytime from your mobile or desktop hub.",
    variant: "orange"
  },
];

export default function Features() {
  return (
    <section className="bg-[#0B1528] text-white py-12 md:py-24 px-4 md:px-[7.5%] text-center">
      <div className="container mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-headline font-black mb-10 md:mb-16 uppercase tracking-tight"
        >
          Why Choose <span className="text-[#F97316]">Cracklix?</span>
        </motion.h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/5 rounded-xl md:rounded-[2rem] p-6 md:p-10 text-left group hover:border-primary/20 transition-all shadow-xl"
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-inner ${
                feature.variant === 'blue' ? 'bg-blue-600/20 text-[#3b82f6]' : 'bg-[#ff7a00]/20 text-[#ff7a00]'
              }`}>
                {feature.icon}
              </div>
              <h3 className="text-base md:text-xl font-bold mb-2 leading-tight uppercase group-hover:text-[#ff7a00] transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
