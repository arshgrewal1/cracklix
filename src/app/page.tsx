
import Navbar from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Shield, Zap, BookOpen, Trophy, ArrowRight, Smartphone, CircleCheckBig, BarChart3, Clock, Target, ChartColumn, Download, Star } from "lucide-react"
import Link from "next/link"
import ExamCard from "@/components/exams/ExamCard"
import { EXAMS } from "@/lib/mock-data"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Badge } from "@/components/ui/badge"
import { PsssbIcon, PoliceIcon, TeachingIcon, PpscIcon } from "@/lib/exam-icons"

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero-punjab")
  const mobile1 = PlaceHolderImages.find(p => p.id === "mobile-mockup-1")
  const mobile2 = PlaceHolderImages.find(p => p.id === "mobile-mockup-2")

  const latestMocks = [
    { title: "PSSSB CLERK Full Length Mock 01", icon: <PsssbIcon />, questions: 100, time: 120, badge: "New" },
    { title: "PUNJAB POLICE SI Mock Test 02", icon: <PoliceIcon />, questions: 100, time: 120, badge: "New" },
    { title: "PSTET PAPER 1 Assessment 01", icon: <TeachingIcon />, questions: 150, time: 150, badge: "New" },
    { title: "PPSC PCS Full Length Mock 01", icon: <PpscIcon />, questions: 100, time: 120, badge: "New" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 overflow-hidden hero-gradient">
        {/* Punjab Map Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <path d="M50 5 L70 15 L85 40 L80 70 L50 95 L20 70 L15 40 L30 15 Z" />
          </svg>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left space-y-10">
              <div className="inline-flex items-center gap-2 bg-white/10 text-primary border border-white/10 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                Punjab's Most Trusted Platform
              </div>
              <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.95] text-white tracking-tighter">
                Prepare Smarter.<br />
                <span className="text-primary">Score Higher.</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/70 max-w-xl leading-relaxed font-medium">
                Punjab Government Exams di Complete Preparation ik hi Platform te.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <HeroStat icon={<BookOpen className="h-4 w-4" />} value="10,000+" label="Practice Questions" />
                <HeroStat icon={<Clock className="h-4 w-4" />} value="500+" label="Mock Tests" />
                <HeroStat icon={<Target className="h-4 w-4" />} value="50+" label="Exams Covered" />
                <HeroStat icon={<ChartColumn className="h-4 w-4" />} value="Detailed" label="Analytics" />
              </div>

              <div className="flex flex-wrap gap-5 pt-6">
                <Button asChild size="lg" className="h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl gap-2 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" size="lg" className="h-16 px-12 border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold text-lg backdrop-blur-sm">
                  Explore Exams
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white/10 aspect-[16/10]">
                <Image
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/punjab/1200/800"}
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

      {/* Popular Exams Grid */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-black font-headline text-secondary tracking-tight">Popular Exams</h2>
              <p className="text-muted-foreground mt-2 text-lg">Curated content for Punjab's biggest recruitment drives.</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-lg flex items-center hover:underline group">
              View All Exams <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {EXAMS.map(exam => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Mock Tests */}
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
            {latestMocks.map((mock, i) => (
              <MockCard key={i} {...mock} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Preview Section */}
      <section className="py-32 overflow-hidden bg-[#0F172A]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 font-bold uppercase tracking-widest">Mobile First</Badge>
              <h2 className="text-5xl md:text-6xl font-black font-headline text-white leading-tight">
                Study Anytime.<br />Anywhere.
              </h2>
              <p className="text-xl text-white/60 max-w-lg leading-relaxed">
                Download the CRACKLIX app for a seamless preparation experience. Access mocks, current affairs, and analytics on the go.
              </p>
              
              <ul className="space-y-4 pt-4">
                <AppFeature text="Dark mode for late night study" />
                <AppFeature text="Offline mock attempts" />
                <AppFeature text="Instant result notifications" />
                <AppFeature text="Daily Punjab GK snippets" />
              </ul>

              <div className="flex flex-wrap gap-4 pt-8">
                <Button className="h-16 px-8 bg-white text-black hover:bg-white/90 rounded-2xl font-black flex gap-3 items-center">
                  <div className="text-left leading-tight">
                    <p className="text-[10px] uppercase font-bold text-black/60">Get it on</p>
                    <p className="text-xl font-bold">Google Play</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-16 px-8 border-white/20 text-white hover:bg-white/10 rounded-2xl font-black flex gap-3 items-center">
                  <div className="text-left leading-tight">
                    <p className="text-[10px] uppercase font-bold text-white/60">Download on the</p>
                    <p className="text-xl font-bold">App Store</p>
                  </div>
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end gap-8">
               {/* iPhone Mockups */}
               <div className="relative w-64 h-[520px] rounded-[3rem] border-[8px] border-[#1E293B] shadow-2xl overflow-hidden translate-y-12">
                 <Image src={mobile1?.imageUrl || ""} alt="App Screenshot 1" fill className="object-cover" data-ai-hint="iphone app screen" />
               </div>
               <div className="relative w-64 h-[520px] rounded-[3rem] border-[8px] border-[#1E293B] shadow-2xl overflow-hidden -translate-y-4">
                 <Image src={mobile2?.imageUrl || ""} alt="App Screenshot 2" fill className="object-cover" data-ai-hint="mobile app mockup" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
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

      <footer className="py-20 border-t bg-white">
        <div className="container mx-auto px-4 text-center space-y-10">
          <div className="flex flex-col items-center gap-4">
            <span className="font-headline text-3xl font-black uppercase text-secondary">
              CRACK<span className="text-primary">LIX</span>
            </span>
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

function MockCard({ title, icon, questions, time, badge }: { title: string, icon: React.ReactNode, questions: number, time: number, badge: string }) {
  return (
    <div className="bg-[#0F172A] p-8 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all group cursor-pointer shadow-xl hover:-translate-y-2">
      <div className="flex justify-between items-start mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          {icon}
        </div>
        <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">{badge}</Badge>
      </div>
      <h4 className="text-white font-headline font-bold text-xl mb-6 leading-tight group-hover:text-primary transition-colors h-14 overflow-hidden">
        {title}
      </h4>
      <div className="flex items-center gap-6 text-white/40 text-[11px] font-bold uppercase tracking-widest border-t border-white/5 pt-6">
        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary/60" /> {questions} Qs</span>
        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary/60" /> {time} Min</span>
      </div>
    </div>
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

function AppFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-white/80 font-medium">
      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
        <Star className="h-3 w-3 text-primary fill-primary" />
      </div>
      {text}
    </li>
  )
}
