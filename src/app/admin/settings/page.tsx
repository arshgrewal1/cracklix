"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Database, Shield, Layout, Upload, Image as ImageIcon } from "lucide-react"
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'settings', 'global');
  }, [db]);

  const { data: remoteSettings, loading } = useDoc(settingsRef);

  const [heroData, setHeroData] = useState({
    line1: "Prepare Smarter.",
    line2: "Score Higher.",
    description: "Complete your Punjab Government Exam preparation on a single platform. Trust Cracklix for your professional success.",
    primaryBtn: "Start Free Mock",
    secondaryBtn: "Explore Exams",
    imageUrl: ""
  });

  useEffect(() => {
    if (remoteSettings) {
      setHeroData({
        line1: remoteSettings.heroLine1 || "Prepare Smarter.",
        line2: remoteSettings.heroLine2 || "Score Higher.",
        description: remoteSettings.heroDescription || "Complete your Punjab Government Exam preparation on a single platform. Trust Cracklix for your professional success.",
        primaryBtn: remoteSettings.heroPrimaryBtn || "Start Free Mock",
        secondaryBtn: remoteSettings.heroSecondaryBtn || "Explore Exams",
        imageUrl: remoteSettings.heroImageUrl || ""
      });
    }
  }, [remoteSettings]);

  const handlePublish = () => {
    if (!db) return;
    
    const settingsDoc = doc(db, 'settings', 'global');
    setDoc(settingsDoc, {
      heroLine1: heroData.line1,
      heroLine2: heroData.line2,
      heroDescription: heroData.description,
      heroPrimaryBtn: heroData.primaryBtn,
      heroSecondaryBtn: heroData.secondaryBtn,
      heroImageUrl: heroData.imageUrl
    }, { merge: true })
    .then(() => {
      toast({
        title: "Platform Updated",
        description: "Your changes are now live for all users.",
      });
    })
    .catch((error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not publish changes.",
      });
    });
  };

  const handleReset = () => {
    if (remoteSettings) {
      setHeroData({
        line1: remoteSettings.heroLine1 || "",
        line2: remoteSettings.heroLine2 || "",
        description: remoteSettings.heroDescription || "",
        primaryBtn: remoteSettings.heroPrimaryBtn || "",
        secondaryBtn: remoteSettings.heroSecondaryBtn || "",
        imageUrl: remoteSettings.heroImageUrl || ""
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Portal Settings</h1>
        <p className="text-muted-foreground">Configure global platform parameters, Hero section, and security rules.</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="bg-card/50 border border-foreground/5 p-1">
          <TabsTrigger value="hero" className="gap-2">
            <Layout className="h-4 w-4" /> Hero Section
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <Database className="h-4 w-4" /> Exam Logic
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card className="border-foreground/5 bg-card/50">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Layout className="h-5 w-5" /> Live Hero Management
              </CardTitle>
              <CardDescription>Edit the main landing page hero content and visuals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Heading Line 1 (White)</Label>
                    <Input 
                      value={heroData.line1} 
                      onChange={(e) => setHeroData({...heroData, line1: e.target.value})}
                      placeholder="e.g. Prepare Smarter."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heading Line 2 (Orange Highlight)</Label>
                    <Input 
                      value={heroData.line2} 
                      onChange={(e) => setHeroData({...heroData, line2: e.target.value})}
                      placeholder="e.g. Score Higher."
                      className="border-primary/30 text-primary font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub-description</Label>
                    <Textarea 
                      value={heroData.description} 
                      onChange={(e) => setHeroData({...heroData, description: e.target.value})}
                      placeholder="Describe the platform value..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Hero Background Image (URL)</Label>
                    <div className="space-y-4">
                      <Input 
                        value={heroData.imageUrl} 
                        onChange={(e) => setHeroData({...heroData, imageUrl: e.target.value})}
                        placeholder="Paste image URL here..."
                      />
                      <div className="h-40 w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-muted/20 relative overflow-hidden group">
                        {heroData.imageUrl ? (
                           <img src={heroData.imageUrl} className="absolute inset-0 object-cover w-full h-full opacity-50" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        )}
                        <p className="text-xs text-muted-foreground z-10">Image Preview</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Button</Label>
                      <Input 
                        value={heroData.primaryBtn} 
                        onChange={(e) => setHeroData({...heroData, primaryBtn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Button</Label>
                      <Input 
                        value={heroData.secondaryBtn} 
                        onChange={(e) => setHeroData({...heroData, secondaryBtn: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={handleReset}>Reset Changes</Button>
                <Button className="bg-primary hover:bg-primary/90 px-8 font-bold" onClick={handlePublish}>Publish Live</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <Input defaultValue="Cracklix" />
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
              <Button className="bg-primary hover:bg-primary/90">Save General Changes</Button>
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
