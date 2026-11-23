import { useEffect, useRef } from 'react'

/**
 * Scroll an element into view when it appears (when `active` turns true), so the next thing
 * to read or click never lands below the fold. Works inside nested scroll containers.
 */
export function useRevealScroll<T extends HTMLElement = HTMLDivElement>(active: boolean, block: ScrollLogicalPosition = 'start') {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!active) return
    // wait a frame or two so the element has laid out before scrolling to it
    const t = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block }), 80)
    return () => window.clearTimeout(t)
  }, [active, block])
  return ref
}
