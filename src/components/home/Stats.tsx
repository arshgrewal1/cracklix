
'use client';

import { motion } from "framer-motion";
import { BookOpen, ClipboardList, ShieldCheck, PieChart } from "lucide-react";

const stats = [
  { icon: <BookOpen />, value: "10,000+", label: "Practice Questions" },
  { icon: <ClipboardList />, value: "500+", label: "Mock Tests" },
  { icon: <ShieldCheck />, value: "50+", label: "Exams Covered" },
  { icon: <PieChart />, value: "Detailed", label: "Analytics" },
];

export default function Stats() {
  return (
    <section className="-mt-16 lg:-mt-24 relative z-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#0B1D3F]/90 backdrop-blur-xl text-white p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="mb-4 text-[#F97316] h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-3xl font-headline font-black mb-1">
                {item.value}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
