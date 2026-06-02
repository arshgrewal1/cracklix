'use client';

import { motion } from "framer-motion";
import { ChevronRight, FileText, MonitorCheck } from "lucide-react";
import Link from "next/link";
import { 
  PsssbIcon, 
  PpscIcon, 
  PoliceIcon, 
  TeachingIcon
} from "@/lib/exam-icons";

const exams = [
  { name: "PSSSB", desc: "Subordinate Services Selection Board", exams: 12, mocks: 256, Icon: PsssbIcon },
  { name: "PPSC", desc: "Punjab Public Service Commission", exams: 9, mocks: 198, Icon: PpscIcon },
  { name: "Punjab Police", desc: "Punjab Police Recruitment", exams: 7, mocks: 145, Icon: PoliceIcon },
  { name: "Teaching Exams", desc: "ETT, Master Cadre, Lecturer", exams: 15, mocks: 320, Icon: TeachingIcon },
];

export default function PopularExams() {
  return (
    <section className="mt-[120px] mb-[60px] container mx-auto max-w-[85%]">
      <div className="flex justify-between items-end mb-[30px]">
        <div>
          <h2 className="text-[28px] font-bold text-[#0c1527]">
            Popular Exams
          </h2>
          <p className="text-[#64748b] mt-1">
            Complete preparation for all major Punjab government exams
          </p>
        </div>

        <Link href="/exams" className="text-[#ff7a00] font-bold text-sm no-underline flex items-center group">
          View All Exams <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {exams.map((exam, idx) => (
          <motion.div
            key={exam.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            viewport={{ once: true }}
          >
            <Link href="/exams">
              <div className="bg-white rounded-[10px] border border-[#e2e8f0] p-[25px] text-center shadow-[0_4px_6px_rgba(0,0,0,0.02)] hover:-translate-y-[5px] transition-transform duration-200 group h-full flex flex-col">
                <div className="mx-auto mb-[15px] flex items-center justify-center text-[#0c1527] h-[60px] w-[60px]">
                  <exam.Icon />
                </div>

                <h3 className="text-[18px] font-bold text-[#0c1527] group-hover:text-[#ff7a00] transition-colors">
                  {exam.name}
                </h3>

                <p className="text-[13px] text-[#64748b] mt-1.5 mb-[15px] leading-relaxed min-h-[38px]">
                  {exam.desc}
                </p>

                <div className="mt-auto pt-[15px] border-t border-[#f1f5f9] flex justify-between text-[13px] text-[#475569]">
                  <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {exam.exams} Exams</span>
                  <span className="flex items-center gap-1.5"><MonitorCheck className="h-3.5 w-3.5" /> {exam.mocks} Mocks</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
