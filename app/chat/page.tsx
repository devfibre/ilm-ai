import { ChatWindow } from "@/components/chat-window"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

interface ChatPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams
  const initialQuestion = params.q

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm">
              <Link href="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <span className="font-semibold">ILM AI</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground hidden md:block">Islamisches Wissen</div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-hidden">
        <ChatWindow initialQuestion={initialQuestion} />
      </main>
    </div>
  )
}
