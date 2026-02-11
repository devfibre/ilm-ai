"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const EXAMPLE_QUESTIONS = [
  "Was bedeutet Ikhlās?",
  "Wie bete ich Istikhāra?",
  "Unterschied zwischen Fard und Sunnah?",
  "Was ist Zakat?",
  "Wie führt man Wudu durch?",
  "Was ist Tauhid?",
]

export function PromptChips() {
  const router = useRouter()

  const handleQuestionClick = (question: string) => {
    // Navigate to chat page with question as URL parameter
    const encodedQuestion = encodeURIComponent(question)
    router.push(`/chat?q=${encodedQuestion}`)
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {EXAMPLE_QUESTIONS.map((question) => (
        <Button
          key={question}
          variant="outline"
          size="sm"
          onClick={() => handleQuestionClick(question)}
          className="text-xs hover:bg-primary/10 hover:border-primary/50 transition-colors"
        >
          {question}
        </Button>
      ))}
    </div>
  )
}
