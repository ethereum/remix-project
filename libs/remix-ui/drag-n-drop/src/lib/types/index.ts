import { ReactNode } from "react"

export interface FileType {
  path: string,
  name: string,
  isDirectory: boolean,
  type: 'folder' | 'file' | 'gist',
  child?: File[]
}

export interface MoveContextType {
  dragged: {
    path: string,
    isDirectory: boolean
  }
  isDraggable?: boolean
  moveFile: (dest: string, src: string) => void
  moveFolder: (dest: string, src: string) => void
  currentlyMoved: (file: { path: string, isDirectory: boolean }) => void
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
  onFileMoved: (dest: string, src: string) => void
  onFolderMoved: (dest: string, src: string) => void
}
