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
    <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-full max-w-[85%] z-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-stats rounded-[12px] flex justify-around p-[25px]"
      >
        {stats.map((item, idx) => (
          <div key={idx} className="flex items-center gap-[15px] text-left">
            <div className="text-[#ff7a00] text-[28px]">
              {item.icon}
            </div>
            <div>
              <h3 className="text-white text-[20px] font-bold">{item.value}</h3>
              <p className="text-[#94a3b8] text-[14px]">{item.label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
