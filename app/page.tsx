import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PromptChips } from "@/components/prompt-chips"
import { AlertCircle, BookOpen } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <BookOpen className="size-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance tracking-tight">
              Fragen zu Islam & ʿIlm stellen
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
              Respektvoll. Verständlich. Wissensbasiert.
            </p>
          </div>

          {/* Disclaimer Alert */}
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="size-4" />
            <AlertTitle>Wichtiger Hinweis</AlertTitle>
            <AlertDescription>
              Diese Plattform ist kein Ersatz für eine Fatwa. Bei komplexen religiösen Fragen konsultieren Sie bitte
              qualifizierte Gelehrte. Dieses Tool dient der allgemeinen Wissensvermittlung.
            </AlertDescription>
          </Alert>

          {/* Example Questions Card */}
          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Beispielfragen</h2>
                <p className="text-sm text-muted-foreground">
                  Klicken Sie auf eine Frage oder geben Sie Ihre eigene ein
                </p>
              </div>

              <PromptChips />
            </div>
          </Card>

          {/* CTA Button */}
          <div className="flex justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Link href="/chat">Chat starten</Link>
            </Button>
          </div>

          {/* Topics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
            {["Aqidah", "Fiqh", "Ibadah", "Akhlaq", "Sira", "Alltag"].map((topic) => (
              <div
                key={topic}
                className="text-center py-3 px-4 rounded-lg bg-muted/50 text-sm font-medium text-muted-foreground"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
