import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Play, MoreVertical, Eye, Share2 } from "lucide-react"
import { EXAMS } from "@/lib/mock-data"

export default function MockManagement() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Mock Management</h1>
          <p className="text-muted-foreground">Configure and publish test series for various exams.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2 font-bold">
          <Plus className="h-4 w-4" /> Create Mock Test
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MockMetric label="Published Mocks" value="248" color="text-primary" />
        <MockMetric label="Draft Series" value="12" color="text-muted-foreground" />
        <MockMetric label="Total Attempts" value="1.2M" color="text-secondary" />
      </div>

      <Card className="border-foreground/5 bg-card/50">
        <CardHeader>
          <CardTitle className="font-headline">Active Test Series</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Series Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXAMS.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-bold">{exam.title} Full Length Mock</TableCell>
                  <TableCell>
                     <Badge variant="outline" className="border-secondary/20 text-secondary">{exam.category}</Badge>
                  </TableCell>
                  <TableCell>120</TableCell>
                  <TableCell>1.5k</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium">Published</span>
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
  )
}

function MockMetric({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <Card className="border-foreground/5 bg-card/30">
      <CardContent className="p-6">
        <p className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className={`text-4xl font-headline font-black ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
