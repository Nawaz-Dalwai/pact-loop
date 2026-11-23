import { useEffect, useState } from 'react'

/** The demo is desktop-only: narrower windows get a notice instead of a squashed layout. */
export const MIN_WIDTH = 1280

/** The window's current width, kept up to date on resize. */
export function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}
