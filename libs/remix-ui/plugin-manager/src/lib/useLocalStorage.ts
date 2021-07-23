import { useRef, useEffect, useState } from 'react'

interface EventHandler<T extends Event = Event> {
  (e: T): void;
}

interface WindowEventHook {
  <K extends keyof WindowEventMap>(
    eventName: K,
    handler: EventHandler<WindowEventMap[K]>
  ): void;
}

export const useWindowEvent: WindowEventHook = (eventName, handler) => {
  // optimization: using useRef here helps us guarantee that this function is
  // is only mutated during effect lifecycles, adding some assurance that the
  // function invoked by the event listener is the same function passed to the
  // hook.
  const handlerRef = useRef<typeof handler>()

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener: typeof handler = event => handlerRef.current(event)
    window.addEventListener(eventName, eventListener)

    return () => {
      window.removeEventListener(eventName, eventListener)
    }
  }, [eventName, handler])
}

export const useLocalStorage = (key: string) => {
  // initialize the value from localStorage
  const [currentValue, setCurrentValue] = useState<string | null>(() =>
    localStorage.getItem(key)
  )

  const handler = (e: StorageEvent) => {
    if (
      e.storageArea === localStorage &&
      e.key === key &&
      e.newValue !== currentValue
    ) {
      setCurrentValue(e.newValue)
    }
  }

  // set up the event listener
  useWindowEvent('storage', handler)

  // update localStorage when the currentValue changes via setCurrentValue
  useEffect(() => {
    localStorage.setItem(key, currentValue)
  }, [key, currentValue])

  // use as const to tell TypeScript this is a tuple
  return [currentValue, setCurrentValue] as const
}
