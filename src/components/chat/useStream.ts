import { useEffect, useMemo, useState } from 'react'
import type { ChatBlock } from './types'

/** Count streamable words in a block (artifacts count as one unit). */
function blockWords(b: ChatBlock): number {
  switch (b.type) {
    case 'p':
    case 'h':
    case 'quote':
      return b.text.split(/\s+/).length
    case 'ul':
    case 'ol':
      return b.items.reduce((n, it) => n + it.split(/\s+/).length, 0)
    case 'table':
      return b.rows.length * 2 + 1
    case 'artifact':
      return 3
  }
}

/** Truncate a string to its first n words. */
const firstWords = (s: string, n: number) => s.split(/(\s+)/).slice(0, Math.max(0, n * 2 - 1)).join('')

/**
 * Progressive reveal of assistant blocks, roughly `wordsPerSecond` words per second.
 * Returns the partially revealed blocks and whether streaming has finished.
 * Pass `enabled=false` to show everything at once (e.g. re-opening an old thread).
 */
export function useStreamedBlocks(blocks: ChatBlock[], enabled: boolean, wordsPerSecond = 45, delayMs = 0) {
  const total = useMemo(() => blocks.reduce((n, b) => n + blockWords(b), 0), [blocks])
  const [shown, setShown] = useState(enabled ? 0 : total)

  useEffect(() => {
    if (!enabled) {
      setShown(total)
      return
    }
    setShown(0)
    let raf = 0
    let start = 0
    const tick = (t: number) => {
      if (!start) start = t + delayMs
      const elapsed = Math.max(0, t - start)
      const n = Math.min(total, Math.floor((elapsed / 1000) * wordsPerSecond))
      setShown(n)
      if (n < total) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [blocks, enabled, total, wordsPerSecond, delayMs])

  const visible = useMemo(() => {
    let budget = shown
    const out: ChatBlock[] = []
    for (const b of blocks) {
      if (budget <= 0) break
      const w = blockWords(b)
      if (w <= budget) {
        out.push(b)
        budget -= w
        continue
      }
      // partial block
      switch (b.type) {
        case 'p':
        case 'h':
        case 'quote':
          out.push({ ...b, text: firstWords(b.text, budget) })
          break
        case 'ul':
        case 'ol': {
          const items: string[] = []
          for (const it of b.items) {
            const iw = it.split(/\s+/).length
            if (iw <= budget) {
              items.push(it)
              budget -= iw
            } else {
              items.push(firstWords(it, budget))
              break
            }
          }
          out.push({ ...b, items })
          break
        }
        case 'table':
          out.push({ ...b, rows: b.rows.slice(0, Math.max(0, Math.floor((budget - 1) / 2))) })
          break
        case 'artifact':
          break
      }
      budget = 0
    }
    return out
  }, [blocks, shown])

  return { visible, done: shown >= total }
}
