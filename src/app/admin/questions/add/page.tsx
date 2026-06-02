
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
import { useFirestore } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function AddQuestionPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "0",
    subjectId: "",
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
    if (!db) return
    setIsSaving(true)

    const questionId = `q-${Date.now()}`
    const questionRef = doc(db, "questions", questionId)

    const payload = {
      ...formData,
      id: questionId,
      correctAnswer: parseInt(formData.correctAnswer),
      createdAt: serverTimestamp()
    }

    setDoc(questionRef, payload)
      .then(() => {
        toast({ title: "Question Saved", description: "Successfully added to the global bank." })
        router.push("/admin/questions")
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: questionRef.path,
          operation: "create",
          requestResourceData: payload
        })
        errorEmitter.emit("permission-error", permissionError)
      })
      .finally(() => setIsSaving(false))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" /> Back to Bank
        </Button>
        <h1 className="text-2xl font-headline font-bold">New Question Entry</h1>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2 font-bold px-8 shadow-xl shadow-primary/20" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Question"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-foreground/5 bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Content & Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Question Statement</Label>
                <Textarea 
                  placeholder="Type the question here..." 
                  className="min-h-[120px] rounded-xl"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
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
                    <div key={i} className="flex items-center gap-4 group">
                      <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="border-primary/30" />
                      <Input 
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="rounded-xl bg-background/50 focus:bg-background transition-all"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="border-foreground/5 bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Detailed Explanation</CardTitle>
              <CardDescription>This will be shown during AI rationalization.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Explain the logic behind the correct answer..." 
                className="min-h-[150px] rounded-xl"
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-foreground/5 bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  placeholder="e.g. Punjab GK" 
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input 
                  placeholder="e.g. Rivers of Punjab" 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(val) => setFormData({...formData, difficulty: val})}
                >
                  <SelectTrigger className="rounded-xl">
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
