import Navbar from "@/components/layout/Navbar"
import { NOTIFICATIONS } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-headline font-bold text-primary">Notifications</h1>
            <button className="text-sm text-secondary font-bold hover:underline">Mark all as read</button>
          </div>

          <div className="space-y-4">
            {NOTIFICATIONS.map((n) => (
              <Card key={n.id} className={`border-foreground/5 ${!n.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === 'result' ? 'bg-green-500/10 text-green-500' : 
                    n.type === 'alert' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {n.type === 'result' ? <TrendingUp className="h-5 w-5" /> : 
                     n.type === 'alert' ? <AlertCircle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-primary">{n.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{n.time}</p>
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
