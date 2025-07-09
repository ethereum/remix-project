import { useEffect, RefObject } from 'react'

export function useOnClickOutside(
  refs: RefObject<HTMLElement>[],
  handler: () => void
) {
  useEffect(() => {
    const controller = new AbortController()
    const listener = (e: MouseEvent) => {
      // if click landed in *any* ref, ignore
      if (refs.some(ref => ref.current?.contains(e.target as Node))) {
        return
      }
      handler()
    }

    // listen for click (not mousedown)
    document.addEventListener('click', listener, { signal: controller.signal })
    return () => {
      controller.abort()
    };
  }, [refs, handler])
}