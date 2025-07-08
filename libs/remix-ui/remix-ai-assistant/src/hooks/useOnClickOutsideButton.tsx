import { useEffect, RefObject } from 'react'

export function useOnClickOutside(
  refs: RefObject<HTMLElement>[],
  handler: () => void
) {
  useEffect(() => {
    const controller = new AbortController()
    const listener = (e: MouseEvent) => {
      // if click is inside *any* ref, do nothing
      if (refs.some(ref => ref.current?.contains(e.target as Node))) {
        return
      }
      handler()
    };

    document.addEventListener('mousedown', listener, { signal: controller.signal })
    return () => {
      controller.abort()
    }
  }, [refs, handler])
}
