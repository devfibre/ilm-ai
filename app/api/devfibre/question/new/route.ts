import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.DEVFIBRE_API_BASE_URL || "https://gpt.devfibre.com"
const API_KEY = process.env.DEVFIBRE_API_KEY

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { text, lang = "de" } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid question text" }, { status: 400 })
    }

    console.log("Sending request to DevFibre API:", `${API_BASE_URL}/v1/question/new`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(`${API_BASE_URL}/v1/question/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      },
      body: JSON.stringify({ text, lang }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("DevFibre API response status:", response.status)

    // Check if response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const textBody = await response.text()
      console.error("Non-JSON response received:", textBody.substring(0, 500))

      return NextResponse.json(
        {
          error:
            response.status === 502
              ? "Die DevFibre API ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut."
              : "Ungültige Antwort vom Server erhalten",
        },
        { status: 503 },
      )
    }

    const data = await response.json()
    console.log("DevFibre API response data:", data)

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to create question" }, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error creating question:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: "Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut." },
          { status: 408 },
        )
      }

      return NextResponse.json({ error: `Serverfehler: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
