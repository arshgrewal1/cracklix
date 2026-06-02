
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Bell, Database, Globe } from "lucide-react"

export default function AdminSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Portal Settings</h1>
        <p className="text-muted-foreground">Configure global platform parameters and security rules.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-card/50 border border-foreground/5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="exams">Exam Logic</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-foreground/5 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Platform Identity
              </CardTitle>
              <CardDescription>Public branding and meta information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input defaultValue="CRACKLIX" />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input defaultValue="cracklixhelp@gmail.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Platform Tagline</Label>
                <Input defaultValue="Punjab's Smartest Government Exam Platform" />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card className="border-foreground/5 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-secondary" /> Test Engine Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Negative Marking (Global)</Label>
                  <p className="text-xs text-muted-foreground">Apply 0.25 penalty by default.</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Rationalization</Label>
                  <p className="text-xs text-muted-foreground">Enable LLM-powered solutions on results page.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Leaderboard Visibility</Label>
                  <p className="text-xs text-muted-foreground">Show ranks to all students.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
