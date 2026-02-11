"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { ChatMessage } from "@/lib/devfibre/types"
import { MessageBubble } from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createQuestion, getAnswer } from "@/lib/devfibre/client"
import { ArrowUp, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STORAGE_KEY = "ilm-chat-messages"
const POLLING_INTERVAL = 2000 // 2 seconds
const MAX_POLLING_DURATION = 120000 // 120 seconds (2 minutes) - AI responses can take time

interface ChatWindowProps {
  initialQuestion?: string
}

export function ChatWindow({ initialQuestion }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const hasProcessedInitialQuestion = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setMessages(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored messages:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (initialQuestion && !hasProcessedInitialQuestion.current) {
      hasProcessedInitialQuestion.current = true
      handleSubmit(initialQuestion)
    }
  }, [initialQuestion])

  const pollForAnswer = async (questionId: string, messageId: string) => {
    const startTime = Date.now()
    let pollCount = 0

    const poll = async () => {
      pollCount++
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      console.log(`Poll #${pollCount} for question ${questionId} (${elapsed}s elapsed)`)

      try {
        const result = await getAnswer(questionId)
        console.log(`Poll #${pollCount} result:`, result ? "Got answer" : "Still pending")

        if (result && result.answer) {
          console.log(`Answer received after ${elapsed}s and ${pollCount} polls`)
          setApiError(null)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: result.answer,
                    isLoading: false,
                    references: result.references,
                  }
                : msg,
            ),
          )
          setIsSubmitting(false)
          return
        }

        const timeElapsed = Date.now() - startTime
        if (timeElapsed > MAX_POLLING_DURATION) {
          console.log(`Polling timeout after ${elapsed}s and ${pollCount} polls`)
          throw new Error(`Die Antwort dauert ungewöhnlich lange (>${Math.round(MAX_POLLING_DURATION/1000)}s). Bitte versuchen Sie es erneut.`)
        }

        // Update loading message with elapsed time for user feedback
        if (pollCount % 5 === 0) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId && msg.isLoading
                ? { ...msg, content: `Generiere Antwort... (${elapsed}s)` }
                : msg,
            ),
          )
        }

        setTimeout(poll, POLLING_INTERVAL)
      } catch (error) {
        console.error("Polling error:", error)
        const errorMessage = error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: `Fehler: ${errorMessage}`,
                  isLoading: false,
                }
              : msg,
          ),
        )
        setIsSubmitting(false)
        toast({
          title: "Fehler beim Abrufen der Antwort",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }

    poll()
  }

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isSubmitting) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question.trim(),
      timestamp: Date.now(),
    }

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
    setIsSubmitting(true)
    setApiError(null)

    try {
      console.log("Submitting question:", question)
      const questionId = await createQuestion(question, "de")
      console.log("Question created with ID:", questionId)

      pollForAnswer(questionId, assistantMessage.id)
    } catch (error) {
      console.error("Error submitting question:", error)
      const errorMessage = error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"

      setApiError(errorMessage)

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: `Fehler beim Senden der Frage: ${errorMessage}`,
                isLoading: false,
              }
            : msg,
        ),
      )
      setIsSubmitting(false)
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
    setInput("")
    setApiError(null)
    hasProcessedInitialQuestion.current = false
  }

  return (
    <div className="flex flex-col h-full">
      {apiError && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong>API-Fehler:</strong> {apiError}
            <br />
            <span className="text-xs">
              Bitte überprüfen Sie, ob die DevFibre API erreichbar ist und Ihre API-Credentials korrekt konfiguriert
              sind.
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Stellen Sie eine Frage, um zu beginnen
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleNewChat} disabled={isSubmitting}>
                <RefreshCw className="size-4 mr-2" />
                Neuer Chat
              </Button>
            </div>
          )}

          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Stellen Sie eine Frage zum Islam..."
              disabled={isSubmitting}
              className="min-h-[60px] pr-12 resize-none"
            />
            <Button
              size="icon"
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || isSubmitting}
              className="absolute right-2 bottom-2"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">Enter zum Senden • Shift+Enter für neue Zeile</p>
        </div>
      </div>
    </div>
  )
}
