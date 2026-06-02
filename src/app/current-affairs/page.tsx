import Navbar from "@/components/layout/Navbar"
import { CURRENT_AFFAIRS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CurrentAffairs() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-headline font-bold mb-2">Current Affairs</h1>
            <p className="text-muted-foreground">Daily updates specifically for Punjab state competitive exams.</p>
          </div>

          <div className="space-y-8">
            {CURRENT_AFFAIRS.map((ca) => (
              <Card key={ca.id} className="bg-card/50 border-foreground/5 hover:border-primary/20 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                      {ca.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {ca.date}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-headline font-bold leading-tight">
                    {ca.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {ca.summary}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
                    <Button variant="ghost" size="sm" className="text-primary gap-2">
                      <BookOpen className="h-4 w-4" /> Read Full Analysis
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
