// Utilities for parsing and formatting referencedDocumentIds

export interface SourceItem {
  documentId?: string
  id?: string
  score?: number
}

/**
 * Normalize referencedDocumentIds from API (which can be in various formats)
 * into a consistent SourceItem array
 */
export function normalizeSources(anyValue: unknown): SourceItem[] {
  // Handle null/undefined
  if (anyValue === null || anyValue === undefined) {
    return []
  }

  // Handle array
  if (Array.isArray(anyValue)) {
    return anyValue
      .map((item) => {
        // Handle primitive values
        if (typeof item === "string") {
          return { documentId: item }
        }

        // Handle objects
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>
          return {
            documentId: obj.documentId as string | undefined,
            id: obj.id as string | undefined,
            _id: obj._id as string | undefined,
            score: typeof obj.score === "number" ? obj.score : undefined,
          }
        }

        return null
      })
      .filter((item): item is SourceItem => item !== null)
  }

  // Handle single object
  if (typeof anyValue === "object") {
    const obj = anyValue as Record<string, unknown>
    return [
      {
        documentId: obj.documentId as string | undefined,
        id: obj.id as string | undefined,
        _id: obj._id as string | undefined,
        score: typeof obj.score === "number" ? obj.score : undefined,
      },
    ]
  }

  // Unknown format - return empty array
  return []
}

/**
 * Format score as percentage (e.g., 0.9156 -> "92%")
 */
export function formatScore(score: number | undefined): string {
  if (score === undefined || score === null) {
    return "—"
  }
  return `${Math.round(score * 100)}%`
}

/**
 * Get displayable ID from source item (prefers documentId, falls back to id or _id)
 */
export function getSourceId(source: SourceItem): string | undefined {
  return source.documentId || source.id || (source as any)._id
}
