export interface Sources {
  [contractPath: string]: {
    content: string
  }
}

export function getFile(path: string, sources: Sources) {
  return sources[path].content
}
