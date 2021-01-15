
import type { CompilationResult, CompilationSource } from '@remix-project/remix-solidity-ts'

export interface DebuggerUIProps {
    debuggerAPI: DebuggerAPI  
}

interface EditorEvent {
    event: { 
        register(eventName: 'breakpointCleared' | 'breakpointAdded' | 'contentChanged', 
        callback: (fileName: string, row: string | number) => void) 
    }
}

interface LineColumnLocation {
    start: {
        line: number, column: number
    }, 
    end: {
        line: number, column: number
    }
}

interface RawLocation {
    start: number, length: number
}

interface Sources {
    [fileName: string] : {content: string}
}

interface CompilationOutput {
    source: { sources: Sources, target: string }
    data: CompilationResult
    getSourceName: (id: number) => string
}

interface Asts {
    [fileName: string] : CompilationSource // ast
}

interface TransactionReceipt {
    blockHash: string
    blockNumber: number
    transactionHash: string
    transactionIndex: number
    from: string
    to: string
    contractAddress: string | null    
  }

export interface DebuggerAPI {
    offsetToLineColumnConverter: { offsetToLineColumn: (sourceLocation: RawLocation, file: number, contents: Sources, asts: Asts) => LineColumnLocation }
    debugHash: string
    debugHashRequest: string
    removeHighlights: boolean
    editor: EditorEvent
    discardHighlight: () => void
    highlight: (lineColumnPos: LineColumnLocation, path: string) => void
    fetchContractAndCompile: (address: string, currentReceipt: TransactionReceipt) => CompilationOutput
    getFile: (path: string) => string
    setFile: (path: string, content: string) => void
    getDebugWeb3: () => any // returns an instance of web3.js
} 