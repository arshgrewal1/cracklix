import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Trash2, FileText } from "lucide-react"
import { MOCK_QUESTIONS } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export default function QuestionBank() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Question Bank</h1>
          <p className="text-muted-foreground">Manage 2,450 questions across all Punjab exam categories.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> Import CSV
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <Card className="border-foreground/5 bg-card/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search by question text or ID..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="ghost" size="sm">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question ID</TableHead>
                <TableHead className="w-[400px]">Question Content</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_QUESTIONS.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground uppercase">{q.id}</TableCell>
                  <TableCell className="max-w-[400px]">
                    <p className="truncate font-medium">{q.text}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none">
                      {q.subject}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${
                      q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                      q.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                    } border-none`}>
                      {q.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
