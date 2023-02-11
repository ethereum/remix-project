/** Create the name of the event for a call */
export function callEvent(name: string, key: string, id: number) {
  return `[${name}] ${key}-${id}`
}

/** Create the name of the event for a listen */
export function listenEvent(name: string, key: string) {
  return `[${name}] ${key}`
}