const paragraphs = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return [...doc.querySelectorAll('p')].map((p) => p.textContent ?? '')
}
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

/** Words in a draft's opener: the paragraph after the greeting. */
export const openerWordsOf = (html: string) => words(paragraphs(html)[1] ?? '')
