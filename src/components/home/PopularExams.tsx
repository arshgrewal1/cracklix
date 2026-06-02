'use client';

import { motion } from "framer-motion";
import { ChevronRight, BookOpen, MonitorCheck } from "lucide-react";
import Link from "next/link";
import { 
  PsssbIcon, 
  PpscIcon, 
  PoliceIcon, 
  TeachingIcon,
  JusticeIcon,
  PowerIcon,
  MedIcon,
  BankIcon
} from "@/lib/exam-icons";

const exams = [
  { name: "PSSSB", desc: "Subordinate Services Selection Board", exams: 12, mocks: 256, Icon: PsssbIcon },
  { name: "PPSC", desc: "Punjab Public Service Commission", exams: 9, mocks: 198, Icon: PpscIcon },
  { name: "Punjab Police", desc: "Punjab Police Recruitment", exams: 7, mocks: 145, Icon: PoliceIcon },
  { name: "Teaching Exams", desc: "ETT, Master Cadre, Lecturer", exams: 15, mocks: 320, Icon: TeachingIcon },
  { name: "High Court", desc: "Punjab & Haryana High Court", exams: 6, mocks: 108, Icon: JusticeIcon },
  { name: "PSPCL & PSTCL", desc: "PSPCL, PSTCL & PSEB Exams", exams: 8, mocks: 162, Icon: PowerIcon },
  { name: "BFUHS", desc: "Baba Farid University of Health Sciences", exams: 4, mocks: 86, Icon: MedIcon },
  { name: "Banking & Cooperative", desc: "Banking & Cooperative Exams", exams: 10, mocks: 210, Icon: BankIcon },
];

export default function PopularExams() {
  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="container mx-auto px-6 max-w-[1280px]">
        <div className="flex justify-between items-end mb-8">
          <div className="text-left">
            <h2 className="text-[32px] font-bold text-[#0B1F3A] font-headline tracking-tight">
              Popular Exams
            </h2>
            <p className="text-[#64748B] text-lg font-medium mt-1">
              Complete preparation for all major Punjab government exams
            </p>
          </div>

          <Link href="/exams" className="text-[#F97316] font-bold text-base flex items-center group transition-colors hover:text-[#EA580C]">
            View All Exams <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exams.map((exam, idx) => (
            <motion.div
              key={exam.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href={`/exams`}>
                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
                  <div className="p-6 flex items-center gap-5">
                    <div className="shrink-0 h-16 w-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                      <exam.Icon />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-[#0B1F3A] group-hover:text-[#F97316] transition-colors leading-tight">
                        {exam.name}
                      </h3>
                      <p className="text-[13px] text-[#64748B] mt-1 font-medium leading-tight">
                        {exam.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto px-6 py-4 border-t border-[#F1F5F9] flex justify-between items-center text-[13px] font-bold text-[#1E3A8A]">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#1E3A8A]/50" /> 
                      {exam.exams} Exams
                    </span>
                    <span className="flex items-center gap-2">
                      <MonitorCheck className="h-4 w-4 text-[#1E3A8A]/50" /> 
                      {exam.mocks} Mocks
                    </span>
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
