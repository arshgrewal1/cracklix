import Navbar from "@/components/layout/Navbar"
import { SAMPLE_MOCK, EXAMS } from "@/lib/mock-data"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Trophy, ArrowRight, Filter } from "lucide-react"
import Link from "next/link"

export default function MocksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-headline font-bold">Mock Test Series</h1>
            <p className="text-muted-foreground">Practice with high-quality full length and sectional mocks.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter by Exam
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MockCard key={i} mock={SAMPLE_MOCK} />
          ))}
        </div>
      </main>
    </div>
  )
}

function MockCard({ mock }: { mock: typeof SAMPLE_MOCK }) {
  const exam = EXAMS.find(e => e.id === mock.examId)
  
  return (
    <Card className="hover:border-primary/50 transition-all group border-foreground/5 bg-card/50 overflow-hidden">
      <div className="bg-primary/5 p-4 flex justify-between items-center border-b border-foreground/5">
        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none">
          {exam?.category || "General"}
        </Badge>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {mock.attempts} Aspirants Attempted
        </span>
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl font-bold group-hover:text-primary transition-colors">
          {mock.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> {mock.durationInMinutes} Mins
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" /> {mock.questions.length} Questions
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Full length mock based on latest PSSSB pattern including Punjabi qualifying section.
        </p>
      </CardContent>
      <CardFooter className="pt-4 border-t border-foreground/5">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
          <Link href={`/mocks/${mock.id}`}>
            Start Free Test <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
