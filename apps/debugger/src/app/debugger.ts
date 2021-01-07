import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { DebuggerApiMixin, RawLocation, Sources, Asts, LineColumnLocation, 
  onBreakpointClearedListener, onBreakpointAddedListener, onEditorContentChanged, TransactionReceipt, CompilerAbstract} from '@remix-ui/debugger-ui'

export class DebuggerClientApi extends DebuggerApiMixin(PluginClient) {  
  constructor () {
    super()    
    createClient(this as any)
    this.initDebuggerApi()
  }

  offsetToLineColumnConverter: { offsetToLineColumn: (sourceLocation: RawLocation, file: number, contents: Sources, asts: Asts) => Promise<LineColumnLocation> }
  debugHash: string
  debugHashRequest: number
  removeHighlights: boolean
  onBreakpointCleared: (listener: onBreakpointClearedListener) => void
  onBreakpointAdded: (listener: onBreakpointAddedListener) => void
  onEditorContentChanged: (listener: onEditorContentChanged) => void
  discardHighlight: () => Promise<void>
  highlight: (lineColumnPos: LineColumnLocation, path: string) => Promise<void>
  fetchContractAndCompile: (address: string, currentReceipt: TransactionReceipt) => Promise<CompilerAbstract>
  getFile: (path: string) => Promise<string>
  setFile: (path: string, content: string) => Promise<void>
  getDebugWeb3: () => any // returns an instance of web3.js  
}

