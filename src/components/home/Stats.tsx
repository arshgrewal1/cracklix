'use client';

import { motion } from "framer-motion"

const stats = [
  { value: "10,000+", label: "Practice Questions" },
  { value: "500+", label: "Mock Tests" },
  { value: "50+", label: "Exams Covered" },
  { value: "Detailed", label: "Analytics" },
]

export default function Stats() {
  return (
    <section className="-mt-10 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#0b1d3f] text-white p-8 rounded-2xl border border-white/10 shadow-xl shadow-black/20"
            >
              <h3 className="text-3xl font-headline font-black mb-1">
                {item.value}
              </h3>
              <p className="text-sm font-bold uppercase tracking-widest text-white/50">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
