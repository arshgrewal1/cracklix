'use client';

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, ShieldCheck } from "lucide-react"
import Link from "next/link"

const mocks = [
  {
    title: "PSSSB Clerk Full Length Mock 1",
    difficulty: "Medium",
    questions: 100,
    duration: 90,
  },
  {
    title: "PPSC PCS Prelims Mock 1",
    difficulty: "Hard",
    questions: 100,
    duration: 120,
  },
  {
    title: "Punjab Police Constable Mock 1",
    difficulty: "Easy",
    questions: 100,
    duration: 120,
  },
  {
    title: "Master Cadre Maths Mock 1",
    difficulty: "Medium",
    questions: 150,
    duration: 150,
  },
  {
    title: "Bank Clerk Prelims Mock 1",
    difficulty: "Easy",
    questions: 100,
    duration: 60,
  },
];

export default function LatestMocks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-headline font-bold text-[#0F172A]">
              Latest Mock Tests
            </h2>
            <p className="text-muted-foreground mt-2">Recently published high-fidelity practice series.</p>
          </motion.div>
          
          <Link 
            href="/mocks" 
            className="text-[#F97316] font-bold text-sm uppercase tracking-widest hover:underline"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {mocks.map((mock, i) => (
            <motion.div
              key={mock.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-gray-100 rounded-[2rem] bg-white hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full group">
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-center mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-[#0F172A]/5 flex items-center justify-center group-hover:bg-[#0F172A] transition-colors duration-300">
                      <ShieldCheck className="h-7 w-7 text-[#0F172A] group-hover:text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-base text-[#0F172A] leading-tight min-h-[48px] group-hover:text-[#F97316] transition-colors">
                      {mock.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                       <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {mock.questions} MCQs</span>
                       <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {mock.duration}m</span>
                    </div>
                    <div className="flex justify-center">
                       <Badge variant="outline" className={`text-[10px] uppercase font-black px-4 py-0.5 border-none ${
                         mock.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                         mock.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-[#F97316]'
                       }`}>
                         {mock.difficulty}
                       </Badge>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-white border-2 border-[#1E5EFF] text-[#1E5EFF] hover:bg-[#1E5EFF] hover:text-white transition-all font-black h-12 rounded-xl text-[10px] uppercase tracking-[0.2em] mt-auto">
                    <Link href="/mocks">Attempt Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
