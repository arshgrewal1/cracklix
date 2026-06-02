
'use client';

import { motion } from "framer-motion"
import { ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

const exams = [
  {
    name: "PSSSB",
    desc: "Subordinate Services Selection Board",
    exams: 12,
    mocks: 256,
  },
  {
    name: "PPSC",
    desc: "Punjab Public Service Commission",
    exams: 9,
    mocks: 198,
  },
  {
    name: "Punjab Police",
    desc: "Punjab Police Recruitment",
    exams: 7,
    mocks: 145,
  },
  {
    name: "Teaching Exams",
    desc: "ETT, Master Cadre, PSTET",
    exams: 15,
    mocks: 320,
  },
  {
    name: "High Court",
    desc: "Punjab & Haryana High Court",
    exams: 6,
    mocks: 108,
  },
  {
    name: "PSPCL & PSTCL",
    desc: "Power Sector Recruitment",
    exams: 8,
    mocks: 162,
  },
  {
    name: "BFUHS",
    desc: "Baba Farid University (Health)",
    exams: 4,
    mocks: 86,
  },
  {
    name: "Banking",
    desc: "Cooperative & State Banks",
    exams: 10,
    mocks: 210,
  },
];

export default function PopularExams() {
  return (
    <section className="py-24 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-[#0F172A]">
              Popular Exams
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Complete preparation for major Punjab government recruitment boards.
            </p>
          </div>

          <Link href="/exams" className="text-[#F97316] font-bold text-sm uppercase tracking-widest flex items-center group">
            View All Exams <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {exams.map((exam, idx) => (
            <motion.div
              key={exam.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href="/exams">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-2xl hover:border-[#F97316]/20 transition-all duration-300 group h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-[#f8fafc] mb-6 flex items-center justify-center group-hover:bg-[#0F172A] transition-colors duration-300">
                    <ShieldCheck className="h-8 w-8 text-[#0F172A] group-hover:text-white" />
                  </div>

                  <h3 className="font-headline font-bold text-2xl text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                    {exam.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-3 leading-relaxed flex-1">
                    {exam.desc}
                  </p>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest text-[#1E3A8A]">
                    <span className="bg-blue-50 px-3 py-1 rounded-full">{exam.exams} Exams</span>
                    <span className="bg-blue-50 px-3 py-1 rounded-full">{exam.mocks} Mocks</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
