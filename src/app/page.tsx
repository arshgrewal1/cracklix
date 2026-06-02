import Navbar from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Shield, BookOpen, Clock, Target, ChartColumn, ArrowRight, Star, Smartphone, CircleCheckBig } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ExamCard from "@/components/exams/ExamCard"
import { EXAMS, SAMPLE_MOCK } from "@/lib/mock-data"
import { PsssbIcon, PoliceIcon, TeachingIcon, PpscIcon } from "@/lib/exam-icons"
import Logo from "@/components/brand/Logo"

export default function Home() {
  // Boards according to the locked architecture
  const boards = [
    "PSSSB", "PPSC", "Punjab Police", "Teaching Exams", "High Court", "PSPCL & PSTCL", "BFUHS", "Banking & Cooperative"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white font-body">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden hero-gradient">
        {/* Punjab Map Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <path d="M52 5 L68 12 L82 35 L88 55 L78 85 L50 96 L25 88 L12 65 L8 40 L22 15 Z" />
          </svg>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left space-y-10">
              <div className="inline-flex items-center gap-2 bg-white/10 text-primary border border-white/10 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                Punjab's Smartest Platform
              </div>
              <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.95] text-white tracking-tighter">
                Prepare Smarter.<br />
                <span className="text-primary">Score Higher.</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/70 max-w-xl leading-relaxed font-medium">
                Punjab Government Exams di Complete Preparation ik hi Platform te.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
                <HeroStat icon={<BookOpen className="h-4 w-4" />} value="10,000+" label="Practice Qs" />
                <HeroStat icon={<Clock className="h-4 w-4" />} value="500+" label="Mock Tests" />
                <HeroStat icon={<Target className="h-4 w-4" />} value="50+" label="Exams" />
                <HeroStat icon={<ChartColumn className="h-4 w-4" />} value="Detailed" label="Analytics" />
              </div>

              <div className="flex flex-wrap gap-5 pt-6">
                <Button asChild size="lg" className="h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl gap-2 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="h-16 px-12 border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold text-lg backdrop-blur-sm">
                  <Link href="/exams">Explore Exams</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white/10 aspect-[16/10]">
                <Image
                  src="https://picsum.photos/seed/punjab-hero/1200/800"
                  alt="Golden Temple"
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="golden temple"
                />
                <div className="absolute inset-0 bg-secondary/40" />
                <div className="absolute bottom-10 right-10 bg-[#0F172A]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Punjab Focused</p>
                    <p className="text-xs text-white/60">100% Real Exam Level Content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR EXAMS SECTION */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-black font-headline text-secondary tracking-tight">Popular Boards</h2>
              <p className="text-muted-foreground mt-2 text-lg">Browse tests by major Punjab recruitment boards.</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-lg flex items-center hover:underline group">
              View All Boards <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {boards.map(board => {
              const representativeExam = EXAMS.find(e => e.category === board) || EXAMS[0];
              return (
                <ExamCard key={board} exam={representativeExam} label={board} />
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. LATEST MOCK TESTS SECTION */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-black font-headline text-secondary tracking-tight">Latest Mock Tests</h2>
              <p className="text-muted-foreground mt-2 text-lg">Fresh series based on 2026-27 exam patterns.</p>
            </div>
            <Link href="/mocks" className="text-primary font-bold text-lg flex items-center hover:underline group">
              View All <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MockCard title="PSSSB Patwari Mock 01" icon={<PsssbIcon />} questions={120} time={120} badge="New" examId="psssb-patwari" />
            <MockCard title="Police SI Full Mock" icon={<PoliceIcon />} questions={100} time={120} badge="Trending" examId="police-si" />
            <MockCard title="PPSC PCS CSAT Special" icon={<PpscIcon />} questions={80} time={120} badge="Premium" examId="ppsc-pcs" />
            <MockCard title="PSTET Paper 1 Set" icon={<TeachingIcon />} questions={150} time={150} badge="New" examId="pstet" />
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="py-24 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <FeatureItem icon={<CircleCheckBig />} title="Real Exam Pattern" desc="Updated for 2027 recruitment" />
            <FeatureItem icon={<BookOpen />} title="Detailed Solutions" desc="Step-by-step rationalization" />
            <FeatureItem icon={<ChartColumn />} title="Performance Analytics" desc="Track rank and accuracy" />
            <FeatureItem icon={<Smartphone />} title="Mobile Native" desc="Fastest test engine in Punjab" />
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-20 border-t bg-white">
        <div className="container mx-auto px-4 text-center space-y-10">
          <div className="flex flex-col items-center gap-4">
            <Logo />
            <p className="text-muted-foreground font-medium max-w-sm">Punjab's #1 Dedicated Platform for State Government Competitive Exams.</p>
          </div>
          <div className="flex justify-center gap-12 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>
          <div className="pt-10 border-t text-muted-foreground text-xs font-bold uppercase tracking-[0.3em]">
            © 2026 CRACKLIX • Punjab Government Exam Preparation Platform
          </div>
        </div>
      </footer>
    </div>
  )
}

function HeroStat({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-1.5 text-white/80">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-black text-white">{value}</span>
      </div>
      <p className="text-[9px] uppercase tracking-[0.1em] text-white/40 font-bold whitespace-nowrap">{label}</p>
    </div>
  )
}

function MockCard({ title, icon, questions, time, badge, examId }: { title: string, icon: React.ReactNode, questions: number, time: number, badge: string, examId: string }) {
  return (
    <Link href={`/mocks/${examId}`}>
      <div className="bg-[#0F172A] p-8 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all group cursor-pointer shadow-xl hover:-translate-y-2 h-full flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            {icon}
          </div>
          <div className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{badge}</div>
        </div>
        <h4 className="text-white font-headline font-bold text-xl mb-6 leading-tight group-hover:text-primary transition-colors flex-grow">
          {title}
        </h4>
        <div className="flex items-center gap-6 text-white/40 text-[11px] font-bold uppercase tracking-widest border-t border-white/5 pt-6 mt-auto">
          <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary/60" /> {questions} Qs</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary/60" /> {time} Min</span>
        </div>
      </div>
    </Link>
  )
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 group">
      <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-all border border-primary/10 shadow-lg shadow-primary/5">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-lg font-black uppercase text-secondary tracking-tight">{title}</p>
        <p className="text-sm text-muted-foreground font-medium">{desc}</p>
      </div>
    </div>
  )
}
