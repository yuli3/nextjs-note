export function analyzeText(text: string) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const characterCount = text.length
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length
  const paragraphCount = text.split(/\n+/).filter(Boolean).length
  const readingTime = Math.ceil(wordCount / 200) // Assuming average reading speed of 200 words per minute

  return {
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    readingTime,
  }
}