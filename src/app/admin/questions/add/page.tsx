"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, Save } from "lucide-react"

export default function AddQuestionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "0",
    subject: "",
    topic: "",
    difficulty: "Medium",
    explanation: ""
  })

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[idx] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSave = () => {
    console.log("Saving Question:", formData)
    router.push("/admin/questions")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" /> Back to Bank
        </Button>
        <h1 className="text-2xl font-headline font-bold">New Question Entry</h1>
        <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Question
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-foreground/5">
            <CardHeader>
              <CardTitle>Content & Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Question Statement</Label>
                <Textarea 
                  placeholder="Type the question here..." 
                  className="min-h-[120px]"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <Label>Answer Options</Label>
                <RadioGroup 
                  value={formData.correctAnswer} 
                  onValueChange={(val) => setFormData({...formData, correctAnswer: val})}
                  className="space-y-3"
                >
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                      <Input 
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-foreground/5">
            <CardHeader>
              <CardTitle>Detailed Explanation</CardTitle>
              <CardDescription>This will be shown during AI rationalization.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Explain the logic behind the correct answer..." 
                className="min-h-[150px]"
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-foreground/5">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  placeholder="e.g. Punjab GK" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input 
                  placeholder="e.g. Rivers of Punjab" 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(val) => setFormData({...formData, difficulty: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
