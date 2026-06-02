import Navbar from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, BarChart3, Target, ShieldCheck, Trophy, Search } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EXAMS, SAMPLE_MOCK } from "@/lib/mock-data"
import Logo from "@/components/brand/Logo"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-semibold text-gray-600">
            <Link href="/exams" className="hover:text-secondary transition-colors">Exams</Link>
            <Link href="/mocks" className="hover:text-secondary transition-colors">Mock Tests</Link>
            <Link href="/results" className="hover:text-secondary transition-colors">Results</Link>
            <Link href="/pricing" className="hover:text-secondary transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-secondary transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-secondary transition-colors">Login</Link>
            <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-bold px-6 rounded-xl shadow-lg shadow-blue-200">
              <Link href="/mocks">Start Free Mock</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-32 px-6 trust-gradient overflow-hidden border-b">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 bg-secondary/5 text-secondary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-secondary/10">
                <ShieldCheck className="h-4 w-4" />
                Punjab’s Most Trusted Government Exam Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-primary leading-[1.05]">
                Prepare Smarter.<br />
                <span className="text-secondary">Score Higher.</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
                Prepare for PSSSB, PPSC, Punjab Police, PSTET, PSPCL and more with structured mocks, real exam analytics, and proven results.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-16 px-10 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl gap-2 shadow-xl shadow-blue-200">
                  <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="h-16 px-10 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold">
                  <Link href="/exams">Explore Exams</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> 50,000+ Questions</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> 1000+ Mocks</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> 8+ Boards</div>
              </div>
            </div>

            {/* DASHBOARD PREVIEW (RIGHT) */}
            <div className="relative">
              <div className="dashboard-preview-card p-10 space-y-10 border-2">
                <div className="flex justify-between items-center border-b pb-6">
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Latest Attempt Analysis</p>
                     <h3 className="text-xl font-bold text-primary">Punjab Police SI Mock #04</h3>
                   </div>
                   <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/10">
                     <BarChart3 className="h-7 w-7" />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <DashboardStat label="Score" value="72/100" />
                  <DashboardStat label="Global Rank" value="128/4500" color="text-secondary" />
                  <DashboardStat label="Accuracy" value="81%" />
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weak Topics Prediction</span>
                     <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded">Attention Required</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {['Polity', 'Reasoning', 'Punjab History'].map(t => (
                       <span key={t} className="text-xs font-bold px-3 py-1 bg-white border rounded-lg text-primary">{t}</span>
                     ))}
                   </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-green-600 bg-green-50 px-5 py-4 rounded-xl border border-green-100">
                   <Trophy className="h-5 w-5 text-green-500" />
                   Smart Tip: You improved your rank by 340 places this week!
                </div>
              </div>
              
              {/* पंजाब Outline Watermark */}
              <div className="absolute -z-10 -bottom-20 -right-20 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                 <Logo variant="dark" className="scale-[5]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST STRIP */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-6 overflow-hidden">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] text-center mb-10">
            Official Recruitment Boards Coverage
          </p>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 text-white/80 text-sm font-bold uppercase tracking-widest">
            <TrustBadge label="PSSSB" />
            <TrustBadge label="PPSC" />
            <TrustBadge label="Punjab Police" />
            <TrustBadge label="PSTET" />
            <TrustBadge label="PSPCL" />
            <TrustBadge label="High Court" />
            <TrustBadge label="BFUHS" />
            <TrustBadge label="Cooperative Bank" />
          </div>
        </div>
      </section>

      {/* 4. POPULAR EXAMS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-primary mb-4">Popular Government Exams</h2>
              <p className="text-gray-500 font-medium text-lg leading-relaxed">
                Structured preparation for Punjab's most competitive recruitments with latest syllabus mocks.
              </p>
            </div>
            <Link href="/exams" className="text-secondary font-bold text-sm flex items-center hover:underline group">
              View All Catalogs <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXAMS.slice(0, 6).map(exam => (
              <Card key={exam.id} className="hover:shadow-xl transition-all duration-300 border-gray-100 group rounded-2xl overflow-hidden">
                 <CardContent className="p-10 space-y-8">
                   <div className="flex justify-between items-start">
                     <div className="text-[10px] font-black text-secondary bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/10 uppercase tracking-widest">
                       {exam.category}
                     </div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{exam.totalMocks} Series</span>
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">{exam.title}</h3>
                     <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{exam.description}</p>
                   </div>
                   <div className="pt-6 border-t flex items-center justify-between">
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Syllabus Coverage</div>
                     <Button asChild variant="link" className="p-0 h-auto text-secondary font-bold group-hover:translate-x-1 transition-transform">
                       <Link href={`/exams/${exam.id}`}>Start Preparation →</Link>
                     </Button>
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CRACKLIX */}
      <section className="py-32 bg-gray-50 border-y">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl font-bold text-primary">Built for Serious Aspirants</h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto text-xl">
              Not a casual learning app. We focus on real patterns, structured discipline, and measurable results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <WhyCard 
              icon={<Target className="text-secondary" />} 
              title="Exam-Focused Content" 
              desc="Every question is verified and aligned with actual government exam patterns and latest board notifications." 
            />
            <WhyCard 
              icon={<BarChart3 className="text-secondary" />} 
              title="Real-Time Analytics" 
              desc="Track your rank among thousands of real aspirants. Identify weak subject areas instantly with AI insights." 
            />
            <WhyCard 
              icon={<ShieldCheck className="text-secondary" />} 
              title="Institutional Trust" 
              desc="The most structured government exam preparation platform focused on real job results, not distractions." 
            />
          </div>
        </div>
      </section>

      {/* 6. PRICING */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-primary">Simple, Result-Oriented Pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             <PricingCard 
                title="Free Access" 
                price="₹0" 
                features={["Limited Mock Tests", "Basic Performance Tracking", "Daily Current Affairs"]} 
                cta="Start Free Mock"
             />
             <PricingCard 
                title="Cracklix Pro" 
                price="₹499" 
                isFeatured
                features={["Unlimited Mock Tests", "Detailed Subject Analytics", "Previous Year Papers", "Rank Prediction", "24/7 Expert Support"]} 
                cta="Get Pro Access"
             />
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-32 bg-secondary relative overflow-hidden">
        <div className="container mx-auto px-6 text-center text-white space-y-12 relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">Start Your Government Job<br />Preparation Today</h2>
          <p className="text-white/70 max-w-2xl mx-auto text-xl font-medium">No gaming. No distractions. Only results. Join 15,000+ serious aspirants on Punjab’s most structured platform.</p>
          <div className="space-y-6">
            <Button asChild size="lg" className="h-20 px-16 bg-white text-secondary hover:bg-gray-100 font-bold rounded-2xl text-xl gap-4 shadow-2xl">
               <Link href="/mocks">Start Your First Free Mock Test <ArrowRight className="h-6 w-6" /></Link>
            </Button>
            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.4em]">Cracklix — Focus on results, not distractions</p>
          </div>
        </div>
        
        {/* Subtle Watermark Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] scale-[10] pointer-events-none">
           <Trophy />
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-20 border-t bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <Logo />
            <div className="flex flex-wrap justify-center gap-12 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <Link href="/exams" className="hover:text-primary transition-colors">Exams</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
          <div className="pt-12 border-t text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 CRACKLIX • PUNJAB GOVERNMENT EXAM PREPARATION PLATFORM
          </div>
        </div>
      </footer>
    </div>
  )
}

function DashboardStat({ label, value, color = "text-primary" }: { label: string, value: string, color?: string }) {
  return (
    <div className="space-y-1 text-center">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  )
}

function TrustBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className="h-1.5 w-1.5 rounded-full bg-accent" />
       <span>{label}</span>
    </div>
  )
}

function WhyCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-6">
      <div className="h-16 w-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h4 className="text-2xl font-bold text-primary">{title}</h4>
      <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  )
}

function PricingCard({ title, price, features, cta, isFeatured }: { title: string, price: string, features: string[], cta: string, isFeatured?: boolean }) {
  return (
    <div className={`p-12 rounded-[2.5rem] border ${isFeatured ? 'bg-primary text-white border-primary shadow-2xl scale-105 z-10' : 'bg-white text-primary border-gray-100'}`}>
       <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-70">{title}</h3>
       <div className="text-6xl font-bold mb-10">{price}<span className="text-lg opacity-40">/year</span></div>
       <ul className="space-y-5 mb-12">
         {features.map(f => (
           <li key={f} className="flex items-center gap-4 text-sm font-bold">
             <CheckCircle2 className={`h-5 w-5 ${isFeatured ? 'text-accent' : 'text-secondary'}`} />
             {f}
           </li>
         ))}
       </ul>
       <Button className={`w-full h-16 rounded-2xl font-bold text-sm uppercase tracking-widest ${isFeatured ? 'bg-secondary text-white hover:bg-secondary/90 shadow-xl shadow-blue-500/20' : 'bg-gray-50 text-primary hover:bg-gray-100 border'}`}>
         {cta}
       </Button>
    </div>
  )
}