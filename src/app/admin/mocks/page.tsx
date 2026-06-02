import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Share2, MoreVertical, FileText } from "lucide-react"
import { EXAMS } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export default function MockManagement() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Mock Management</h1>
          <p className="text-muted-foreground">Publish and oversee test series.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-primary/10 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Create Mock Test</CardTitle>
            <CardDescription>Paste questions below to auto-parse.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mock Title</Label>
              <Input placeholder="e.g., PSSSB Patwari Set 05" />
            </div>
            <div className="space-y-2">
              <Label>Duration (Minutes)</Label>
              <Input type="number" defaultValue={120} />
            </div>
            <div className="space-y-2">
              <Label>Paste Questions Box</Label>
              <Textarea 
                className="min-h-[200px]" 
                placeholder="Q1. Question text? A. Opt1 B. Opt2... Answer: B" 
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 font-bold">
               Generate Mock
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-foreground/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Published Mocks</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mock Title</TableHead>
                    <TableHead>Board</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXAMS.slice(0, 8).map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-bold text-primary">{exam.name} Full Length</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase">{exam.board}</Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-muted-foreground">Published</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
