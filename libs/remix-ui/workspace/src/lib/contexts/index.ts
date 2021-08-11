import { createContext } from 'react'
import { BrowserState } from '../reducers/workspace'

export const FileSystemContext = createContext<{
  fs: BrowserState,
  modal:(title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  dispatchInitWorkspace:() => void,
  dispatchInitLocalhost:() => void,
  dispatchFetchDirectory:(path: string) => void
    }>(null)
