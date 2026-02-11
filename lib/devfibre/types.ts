// Types for DevFibre API integration

export interface CreateQuestionRequest {
  text: string
  lang: "de" | "en" | "ar"
}

export interface CreateQuestionResponse {
  text: string
  questionId?: string
}

export interface ReferencedDocument {
  documentId: string
  score: number
}

export interface Answer {
  answer: string
  referencedDocumentIds?: ReferencedDocument[]
}

export interface ApiError {
  error: string
  status: number
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  references?: ReferencedDocument[]
  isLoading?: boolean
}
