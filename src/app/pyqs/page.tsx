import Navbar from "@/components/layout/Navbar"
import { EXAMS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"

export default function PYQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-headline font-bold mb-2">Previous Year Papers</h1>
          <p className="text-muted-foreground">Authentic exam papers with verified official answer keys.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXAMS.map((exam) => (
            <Card key={exam.id} className="border-foreground/5 bg-card/50">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{exam.title} Papers</CardTitle>
                  <p className="text-xs text-muted-foreground">{exam.category} Series</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[2025, 2024, 2023].map((year) => (
                  <div key={year} className="flex items-center justify-between p-3 rounded-lg bg-background border border-foreground/5">
                    <span className="text-sm font-medium">{exam.title} ({year})</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs text-primary border-primary/20">
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
