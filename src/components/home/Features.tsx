
'use client';

import { motion } from "framer-motion";
import { Clipboard, Search, TrendingUp, Smartphone } from "lucide-react";

const features = [
  { 
    icon: <Clipboard className="h-8 w-8 text-white" />, 
    title: "Real Exam Pattern Based Mocks", 
    desc: "Mocks designed exactly as per the latest exam pattern and syllabus.",
    color: "bg-blue-600"
  },
  { 
    icon: <Search className="h-8 w-8 text-white" />, 
    title: "Detailed Solutions", 
    desc: "Step-by-step solutions with concept explanation to clear your doubts.",
    color: "bg-orange-600"
  },
  { 
    icon: <TrendingUp className="h-8 w-8 text-white" />, 
    title: "Performance Analytics", 
    desc: "Track your progress with in-depth analytics and performance insights.",
    color: "bg-blue-600"
  },
  { 
    icon: <Smartphone className="h-8 w-8 text-white" />, 
    title: "Study Anytime Anywhere", 
    desc: "Learn on the go with our mobile app. Anytime, anywhere.",
    color: "bg-orange-600"
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-[#08152D] text-white">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-5xl font-bold mb-16"
        >
          Why Choose <span className="text-[#F97316]">CRACKLIX?</span>
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:border-[#F97316] hover:shadow-[#F97316]/20 hover:shadow-2xl transition-all group backdrop-blur-sm"
            >
              <div className={`h-16 w-16 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl mb-3 group-hover:text-[#F97316] transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
