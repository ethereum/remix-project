import { ReactNode } from "react"

export interface FileType {
  path: string,
  name: string,
  isDirectory: boolean,
  type: 'folder' | 'file' | 'gist',
  child?: File[]
}

export interface MoveContextType {
  dragged: string
  isDraggable?: boolean
  moveFile: (dest: string, dragged: string) => void
  currentlyMoved: (path: string) => void
}

export interface DraggableType {
  children: ReactNode
  file: FileType
  isDraggable?: boolean
  expandedPath: string[]
  handleClickFolder: (path: string, type: string) => void
}

export interface DragType {
  children: ReactNode
  onFileMoved: (dest: string, dragged: string) => void
}
