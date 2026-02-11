"use client"

import type { ChatMessage } from "@/lib/devfibre/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check, Copy, Loader2 } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"
  const isLoading = message.isLoading

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border",
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Die Antwort wird vorbereitet...</span>
          </div>
        ) : (
          <>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-sm">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-sm">{children}</ol>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {!isUser && !isLoading && (
              <div className="mt-3 flex items-center gap-2 border-t pt-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={copyToClipboard}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
                {message.references && message.references.length > 0 && (
                  <span className="text-xs text-muted-foreground">{message.references.length} Quellen verwendet</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
