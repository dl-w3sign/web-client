export function abbrCenter(text: string): string {
  if (!text || typeof text !== 'string') {
    console.warn(`abbrCenter(): "text" arg should be a string, got ${text}`)
    return text
  }
  if (text.length <= 10) {
    return text
  }
  return `${text.slice(0, 8)}...${text.slice(text.length - 9, text.length)}`
}
