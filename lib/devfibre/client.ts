// Client-side API helpers for calling our Next.js API routes

export async function createQuestion(text: string, lang: "de" | "en" | "ar" = "de"): Promise<string> {
  const response = await fetch("/api/devfibre/question/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, lang }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Failed to create question")
  }

  const data = await response.json()

  // Extract questionId from response - handle different possible response formats
  const questionId = data.questionId || data.question_id || data.id

  if (!questionId) {
    throw new Error("No questionId returned from API")
  }

  return questionId
}

export async function getAnswer(questionId: string): Promise<{ answer: string; references?: any[] } | null> {
  const response = await fetch(`/api/devfibre/answer/${questionId}`)

  // 404 = Answer not ready yet, continue polling
  // 408 = Timeout (server still processing), continue polling
  if (response.status === 404 || response.status === 408) {
    return null
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Failed to get answer")
  }

  const data = await response.json()
  
  // Double-check that we actually have an answer
  if (!data.answer) {
    return null
  }
  
  return {
    answer: data.answer,
    references: data.referencedDocumentIds,
  }
}
