import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.DEVFIBRE_API_BASE_URL || "https://gpt.devfibre.com"
const API_KEY = process.env.DEVFIBRE_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 })
    }

    console.log("Fetching answer for question:", questionId)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(`${API_BASE_URL}/v1/answer/${questionId}`, {
      headers: {
        "X-API-KEY": API_KEY,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("Answer API response status:", response.status)

    // Check if response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const textBody = await response.text()
      console.error("Non-JSON response received:", textBody.substring(0, 500))

      // Return 404 for non-JSON responses to trigger retry in polling
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        return NextResponse.json(
          { error: "Die DevFibre API ist momentan nicht erreichbar." },
          { status: 503 }
        )
      }

      // Treat other non-JSON responses as "not ready yet"
      return NextResponse.json({ status: "pending" }, { status: 404 })
    }

    const data = await response.json()
    console.log("Answer API response data:", JSON.stringify(data).substring(0, 200))

    // If status is 404 or answer is empty/pending, return 404 to continue polling
    if (response.status === 404 || !data.answer || data.status === "pending") {
      return NextResponse.json({ status: "pending" }, { status: 404 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to get answer" }, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error getting answer:", error)

    if (error instanceof Error) {
      // Timeout means the answer is still being generated - return 404 to continue polling
      if (error.name === "AbortError") {
        console.log("Request timed out, treating as pending")
        return NextResponse.json({ status: "pending" }, { status: 404 })
      }

      return NextResponse.json({ error: `Serverfehler: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
