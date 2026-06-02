'use client';

import { motion } from "framer-motion";
import { Clipboard, Search, TrendingUp, Smartphone } from "lucide-react";

const features = [
  { 
    icon: <Clipboard className="h-[22px] w-[22px]" />, 
    title: "Real Exam Pattern Based Mocks", 
    desc: "Mocks designed exactly as per the latest exam pattern and syllabus.",
    variant: "blue"
  },
  { 
    icon: <Search className="h-[22px] w-[22px]" />, 
    title: "Detailed Solutions", 
    desc: "Step-by-step solutions with concept explanation to clear your doubts.",
    variant: "orange"
  },
  { 
    icon: <TrendingUp className="h-[22px] w-[22px]" />, 
    title: "Performance Analytics", 
    desc: "Track your progress with in-depth analytics and performance insights.",
    variant: "blue"
  },
  { 
    icon: <Smartphone className="h-[22px] w-[22px]" />, 
    title: "Study Anytime Anywhere", 
    desc: "Learn on the go with our mobile app. Anytime, anywhere.",
    variant: "orange"
  },
];

export default function Features() {
  return (
    <section className="bg-[#0c1527] text-white py-[80px] px-[7.5%] text-center mt-[80px]">
      <div className="container mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[32px] font-bold mb-[40px]"
        >
          Why Choose <span className="text-[#ff7a00]">CRACKLIX?</span>
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#111e38] border border-white/5 rounded-[10px] p-[30px_20px] text-left group"
            >
              <div className={`w-[50px] h-[50px] rounded-[8px] flex items-center justify-center mb-5 ${
                feature.variant === 'blue' ? 'bg-blue-600/20 text-[#3b82f6]' : 'bg-[#ff7a00]/20 text-[#ff7a00]'
              }`}>
                {feature.icon}
              </div>
              <h3 className="text-[18px] font-bold mb-[10px] leading-[1.4] group-hover:text-[#ff7a00] transition-colors">
                {feature.title}
              </h3>
              <p className="text-[#94a3b8] text-[14px] leading-[1.6]">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
