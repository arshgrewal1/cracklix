import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Trophy, BookOpen, Clock, Target, Download, Apple, Play } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EXAMS, SAMPLE_MOCK } from "@/lib/mock-data";
import Logo from "@/components/brand/Logo";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-40 overflow-hidden hero-gradient">
        {/* Punjab Map Watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
           <svg viewBox="0 0 100 100" className="w-[1000px] h-[1000px] text-white">
             <path d="M40 35 L55 40 L60 60 L45 70 L35 55 Z" fill="currentColor" />
           </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#F97316]/20 text-[#F97316] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-[#F97316]/30">
                <ShieldCheck className="h-4 w-4" />
                #1 Punjab Exam Preparation Platform
              </div>
              <h1 className="text-6xl md:text-8xl font-headline font-bold text-white leading-[1.05]">
                Prepare Smarter.<br />
                <span className="text-[#F97316]">Score Higher.</span>
              </h1>
              <p className="text-xl text-white/70 max-w-xl leading-relaxed font-medium">
                Punjab Government Exams di Complete Preparation ik hi Platform te.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="h-14 px-10 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-lg gap-2 shadow-xl shadow-[#F97316]/20">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="h-14 px-10 border-white/20 text-white hover:bg-white/10 rounded-lg font-bold bg-transparent">
                  <Link href="/exams">Explore Exams</Link>
                </Button>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
                <StatCard icon={<BookOpen className="text-[#F97316]" />} value="10,000+" label="Practice Questions" />
                <StatCard icon={<Clock className="text-[#F97316]" />} value="500+" label="Mock Tests" />
                <StatCard icon={<ShieldCheck className="text-[#F97316]" />} value="50+" label="Exams Covered" />
                <StatCard icon={<Target className="text-[#F97316]" />} value="Detailed" label="Analytics" />
              </div>
            </div>

            {/* Hero Image / Golden Temple */}
            <div className="relative group lg:ml-auto">
              <div className="relative h-[500px] w-full max-w-[600px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <Image 
                  src="https://picsum.photos/seed/punjab-hero/1200/800" 
                  alt="Golden Temple" 
                  fill 
                  className="object-cover"
                  data-ai-hint="golden temple"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8">
                  <Logo variant="light" className="scale-125 origin-left" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR EXAMS SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-headline font-bold text-[#0F172A]">Popular Exams</h2>
              <p className="text-muted-foreground mt-2">Complete preparation for all major Punjab government exams</p>
            </div>
            <Link href="/exams" className="text-[#F97316] font-bold text-sm uppercase tracking-widest flex items-center hover:underline group">
              View All Exams <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXAMS.map(exam => (
              <Link href={`/exams/${exam.id}`} key={exam.id}>
                <Card className="hover:shadow-2xl transition-all duration-300 border-gray-100 rounded-xl bg-white group h-full flex flex-col p-6 border custom-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 rounded-lg bg-gray-50 border flex items-center justify-center">
                       <ShieldCheck className="h-8 w-8 text-[#0F172A]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-bold text-[#0F172A] mb-1 group-hover:text-[#F97316] transition-colors">{exam.board}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">{exam.description?.slice(0, 60)}...</p>
                  </div>
                  <div className="mt-auto flex items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">
                       <BookOpen className="h-3 w-3" /> {exam.totalMocks} Exams
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">
                       <Clock className="h-3 w-3" /> {exam.activeQuestions} Mocks
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LATEST MOCK TESTS */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-headline font-bold text-[#0F172A]">Latest Mock Tests</h2>
            <Link href="/mocks" className="text-[#F97316] font-bold text-sm uppercase tracking-widest hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {EXAMS.slice(0, 5).map((exam, i) => (
              <Card key={i} className="border-gray-100 rounded-xl bg-white hover:shadow-xl transition-all overflow-hidden flex flex-col h-full border custom-shadow">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-center mb-6">
                    <ShieldCheck className="h-10 w-10 text-[#0F172A]" />
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-sm text-[#0F172A] mb-1">{exam.board} Clerk</h3>
                    <p className="text-xs text-muted-foreground">Full Length Mock 1</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold">
                       <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> 100 Questions</span>
                       <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 90 min</span>
                    </div>
                    <div className="flex justify-center">
                       <Badge variant="outline" className="text-[10px] border-[#F97316]/30 text-[#F97316] bg-[#F97316]/5">Medium</Badge>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-white border border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/5 font-bold h-10 rounded-lg text-xs">
                    <Link href={`/mocks/${SAMPLE_MOCK.id}`}>Attempt Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE CRACKLIX SECTION */}
      <section className="py-24 bg-[#0F172A]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-headline font-bold text-white mb-16">
            Why Choose <span className="text-[#F97316]">Cracklix</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-[#F97316]" />}
              title="Real Exam Pattern Based Mocks"
              desc="Mocks designed exactly as per the latest exam pattern and syllabus."
            />
            <FeatureCard 
              icon={<Target className="h-8 w-8 text-[#F97316]" />}
              title="Detailed Solutions"
              desc="Step-by-step solutions with concept explanation to clear your doubts."
            />
            <FeatureCard 
              icon={<Trophy className="h-8 w-8 text-[#F97316]" />}
              title="Performance Analytics"
              desc="Track your progress with in-depth analytics and performance insights."
            />
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-[#F97316]" />}
              title="Study Anytime Anywhere"
              desc="Learn on the go with our mobile app. Anytime, anywhere."
            />
          </div>
        </div>
      </section>

      {/* 5. MOBILE APP SECTION */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-none px-4 py-1.5 rounded-lg font-bold">
                Learn. Practice. Succeed.
              </Badge>
              <h2 className="text-5xl font-headline font-bold text-[#0F172A]">
                Cracklix in Your <br />
                <span className="text-[#F97316]">Pocket</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                India's most trusted Punjab exam preparation app. Download now and start your preparation journey.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button className="h-14 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl flex items-center gap-3">
                  <Apple className="h-7 w-7" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold leading-none opacity-70">Download on the</p>
                    <p className="text-xl font-bold leading-none mt-1">App Store</p>
                  </div>
                </Button>
                <Button className="h-14 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl flex items-center gap-3">
                  <Play className="h-7 w-7" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold leading-none opacity-70">GET IT ON</p>
                    <p className="text-xl font-bold leading-none mt-1">Google Play</p>
                  </div>
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center items-center gap-6">
               {/* iPhone Mockups */}
               <div className="relative h-[450px] w-[220px] rounded-[2.5rem] border-[6px] border-[#0F172A] bg-white overflow-hidden shadow-2xl">
                 <Image src="https://picsum.photos/seed/app1/400/800" fill alt="App Screen" className="object-cover" />
               </div>
               <div className="relative h-[500px] w-[250px] rounded-[3rem] border-[8px] border-[#0F172A] bg-white overflow-hidden shadow-2xl -mt-12">
                 <Image src="https://picsum.photos/seed/app2/400/800" fill alt="App Screen" className="object-cover" />
               </div>
               <div className="relative h-[450px] w-[220px] rounded-[2.5rem] border-[6px] border-[#0F172A] bg-white overflow-hidden shadow-2xl">
                 <Image src="https://picsum.photos/seed/app3/400/800" fill alt="App Screen" className="object-cover" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-24 bg-[#0F172A] text-white/70 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <Logo variant="light" />
              <p className="text-sm leading-relaxed">
                Your one-stop platform for complete preparation of all Punjab Government Exams. Prepare smarter and achieve your dreams.
              </p>
            </div>
            <div>
              <h4 className="font-headline font-bold text-white text-sm uppercase tracking-widest mb-8">Quick Links</h4>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-tight">
                <li><Link href="/" className="hover:text-[#F97316] transition-colors">Home</Link></li>
                <li><Link href="/exams" className="hover:text-[#F97316] transition-colors">Exams</Link></li>
                <li><Link href="/mocks" className="hover:text-[#F97316] transition-colors">Mocks</Link></li>
                <li><Link href="/pyqs" className="hover:text-[#F97316] transition-colors">PYQs</Link></li>
                <li><Link href="/current-affairs" className="hover:text-[#F97316] transition-colors">Current Affairs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-white text-sm uppercase tracking-widest mb-8">Company</h4>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-tight">
                <li><Link href="/about" className="hover:text-[#F97316] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#F97316] transition-colors">Contact Us</Link></li>
                <li><Link href="/careers" className="hover:text-[#F97316] transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-[#F97316] transition-colors">Blog</Link></li>
                <li><Link href="/stories" className="hover:text-[#F97316] transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-bold text-white text-sm uppercase tracking-widest mb-8">Legal</h4>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-tight">
                <li><Link href="/privacy" className="hover:text-[#F97316] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#F97316] transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/refund" className="hover:text-[#F97316] transition-colors">Refund Policy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-[#F97316] transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] font-bold uppercase tracking-widest">
              © 2024 Cracklix. All rights reserved.
            </p>
            <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              Made with <span className="text-red-500">❤️</span> for Punjab Aspirants
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center space-y-2">
      <div className="h-10 w-10 flex items-center justify-center mb-2">
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-10 rounded-2xl space-y-4 text-left border-white/5 hover:border-[#F97316]/30 transition-all group">
      <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#F97316]/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </div>
  )
}