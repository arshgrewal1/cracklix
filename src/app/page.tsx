import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BarChart3, ShieldCheck, Trophy, Landmark, Smartphone, BookOpen, Clock, Target } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EXAMS, SAMPLE_MOCK } from "@/lib/mock-data";
import Logo from "@/components/brand/Logo";
import Image from "next/image";

export default function Home() {
  const boards = [
    { name: "PSSSB", sub: "Group B & C" },
    { name: "PPSC", sub: "PCS & A/B" },
    { name: "Punjab Police", sub: "Constable/SI" },
    { name: "Education", sub: "TET/Masters" },
    { name: "High Court", sub: "Judicial" },
    { name: "Power Sector", sub: "Technical" },
    { name: "Health", sub: "Medical" },
    { name: "Cooperative", sub: "Banking" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden trust-gradient">
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
           <svg viewBox="0 0 100 100" className="w-[800px] h-[800px] text-white">
             <path d="M40 35 L55 40 L60 60 L45 70 L35 55 Z" fill="currentColor" />
           </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Punjab’s Most Trusted Exam Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-bold text-white leading-[1.05]">
                Prepare Smarter.<br />
                <span className="text-accent">Score Higher.</span>
              </h1>
              <p className="text-xl text-blue-100/70 max-w-xl leading-relaxed font-medium">
                Punjab Government Exams di Complete Preparation ik hi Platform te. Structured mocks based on latest recruitment trends.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="h-16 px-10 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl gap-2 shadow-xl shadow-accent/20">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="h-16 px-10 border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold bg-white/5 backdrop-blur-sm">
                  <Link href="/exams">Explore Catalog</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-6 text-[10px] font-black text-white/50 uppercase tracking-widest">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> 10,000+ Questions</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> 500+ Mocks</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> 50+ Exams</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Detailed Analytics</div>
              </div>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div className="relative group lg:ml-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-transparent blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="dashboard-card relative p-10 space-y-8 border-2">
                <div className="flex justify-between items-center border-b pb-6">
                   <div>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Latest Attempt Analysis</p>
                     <h3 className="text-xl font-headline font-bold text-primary">PSSSB Patwari Mock #01</h3>
                   </div>
                   <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/10">
                     <BarChart3 className="h-7 w-7" />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-8 text-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Score</p>
                    <p className="text-3xl font-headline font-black text-primary">72/100</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rank</p>
                    <p className="text-3xl font-headline font-black text-secondary">128/4500</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Accuracy</p>
                    <p className="text-3xl font-headline font-black text-primary">81%</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Weak Area Alert</span>
                     <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded">Critical</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {['Punjabi Grammar', 'Reasoning'].map(t => (
                       <span key={t} className="text-[10px] font-black px-3 py-1 bg-white border rounded-lg text-primary uppercase">{t}</span>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHORITY STRIP */}
      <section className="py-12 bg-white border-y">
        <div className="container mx-auto px-6">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] text-center mb-10">
            Trusted by Punjab Aspirants for Official Recruitment Boards
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 text-primary/80 text-sm font-bold uppercase tracking-widest">
            {boards.slice(0, 4).map(board => (
              <div key={board.name} className="flex flex-col items-center">
                <span className="text-primary font-black">{board.name}</span>
                <span className="text-[8px] text-muted-foreground mt-1">{board.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR EXAMS SECTION */}
      <section className="section-spacing bg-slate-50/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-headline font-bold text-primary mb-4">Popular Government Exams</h2>
              <p className="text-muted-foreground font-medium text-lg">
                High-fidelity test series for Punjab's most sought-after recruitments.
              </p>
            </div>
            <Link href="/exams" className="text-secondary font-black text-xs uppercase tracking-widest flex items-center hover:underline group">
              View All 50+ Exams <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXAMS.slice(0, 8).map(exam => (
              <Link href={`/exams/${exam.id}`} key={exam.id}>
                <Card className="hover:shadow-xl transition-all duration-300 border-slate-100 rounded-[1.5rem] bg-white group h-full flex flex-col">
                  <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                     <div className="flex justify-between items-start">
                       <span className="text-[9px] font-black text-secondary bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/10 uppercase tracking-widest">
                         {exam.board}
                       </span>
                       <Trophy className="h-4 w-4 text-slate-200 group-hover:text-secondary transition-colors" />
                     </div>
                     <div>
                       <h3 className="text-xl font-headline font-bold text-primary mb-2 line-clamp-1 group-hover:text-secondary transition-colors">{exam.name}</h3>
                       <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">{exam.category}</p>
                     </div>
                     <div className="pt-6 border-t mt-auto flex items-center justify-between">
                       <div className="flex gap-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                             <BookOpen className="h-3 w-3" /> {exam.totalMocks} Mocks
                          </div>
                       </div>
                       <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                     </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LATEST MOCK TESTS */}
      <section className="section-spacing bg-white">
        <div className="container mx-auto">
           <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-headline font-bold text-primary mb-4">Latest Mock Tests</h2>
              <p className="text-muted-foreground font-medium">Practice with the most recent patterns released by boards.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-slate-100 rounded-2xl bg-white hover:border-secondary/30 transition-all overflow-hidden">
                  <div className="bg-slate-50 p-4 flex justify-between items-center border-b">
                    <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-1 rounded">LATEST PATTERN</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">1.2k Attempts</span>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-headline font-bold text-primary">Full Length Assessment #01</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                        <Clock className="h-4 w-4 text-secondary" /> 120 Mins
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                        <BookOpen className="h-4 w-4 text-secondary" /> 100 Qs
                      </div>
                    </div>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">
                       <Link href={`/mocks/${SAMPLE_MOCK.id}`}>Start Free Test</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-20 bg-white border-t">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Logo />
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Cracklix is Punjab's dedicated institutional preparation system for government exams. We focus on results, not distractions.
              </p>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li><Link href="/exams" className="hover:text-primary transition-colors">Exam Catalog</Link></li>
                <li><Link href="/mocks" className="hover:text-primary transition-colors">Free Mock Tests</Link></li>
                <li><Link href="/pyqs" className="hover:text-primary transition-colors">Previous Year Papers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-6">Institutional</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
              © 2026 CRACKLIX • THE AUTHORITATIVE PREPARATION SYSTEM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
