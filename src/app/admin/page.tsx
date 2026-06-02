import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Users, Calendar, BarChart3, Edit, Trash2, ArrowRight, UserCheck, MessageSquare, ArrowUpRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EXAMS } from "@/lib/mock-data"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Admin Portal</h1>
          <p className="text-muted-foreground">Welcome back, Master Access. Here's what's happening today.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-foreground/5 hover:bg-card">Reports</Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Create New Exam
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard icon={<Database className="text-primary" />} label="Questions Bank" value="2,450" trend="+12 today" />
        <AdminStatCard icon={<Users className="text-secondary" />} label="Total Aspirants" value="15,248" trend="+84 today" />
        <AdminStatCard icon={<Calendar className="text-primary" />} label="Active Series" value="48" trend="3 expiring" />
        <AdminStatCard icon={<BarChart3 className="text-secondary" />} label="Avg Accuracy" value="64%" trend="+1.2% up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exam Management Table */}
        <Card className="lg:col-span-2 border-foreground/5 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Core Catalogs</CardTitle>
              <CardDescription>Management of primary exam categories.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/mocks">Manage All <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-foreground/5">
                  <TableHead className="text-xs uppercase tracking-widest font-black">Exam Title</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-black">Category</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-black">Mocks</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-black text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EXAMS.slice(0, 5).map((exam) => (
                  <TableRow key={exam.id} className="border-foreground/5 hover:bg-white/5">
                    <TableCell className="font-bold text-sm">{exam.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">{exam.category}</TableCell>
                    <TableCell className="text-xs font-headline font-bold">{exam.totalMocks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive">
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

        {/* Activity Feed */}
        <Card className="border-foreground/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Live Activity</CardTitle>
            <CardDescription>Real-time platform events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ActivityItem icon={<UserCheck className="text-green-500" />} title="New Enrollment" desc="Amandeep Singh (PSSSB Pro)" time="2m ago" />
            <ActivityItem icon={<Database className="text-primary" />} title="Mock Published" desc="PPSC PCS Prelims Set 04" time="15m ago" />
            <ActivityItem icon={<MessageSquare className="text-secondary" />} title="Support Query" desc="Ticket #2401: Timer issue" time="1h ago" />
            <ActivityItem icon={<UserCheck className="text-green-500" />} title="New Enrollment" desc="Gurpreet Kaur (PPSC Free)" time="2h ago" />
            <Button variant="outline" className="w-full mt-4 text-xs font-bold uppercase tracking-widest border-foreground/5">View Full Log</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminStatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <Card className="bg-card/50 border-foreground/5 shadow-xl shadow-black/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-background border border-foreground/5 shadow-inner">{icon}</div>
          <div>
            <p className="text-2xl font-headline font-black tracking-tight">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-green-500/80 tracking-tight">{trend}</span>
          <ArrowUpRight className="h-3 w-3 text-muted-foreground/30" />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ icon, title, desc, time }: { icon: React.ReactNode, title: string, desc: string, time: string }) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center shrink-0">{icon}</div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-black uppercase tracking-tight leading-none">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
        <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">{time}</p>
      </div>
    </div>
  )
}
