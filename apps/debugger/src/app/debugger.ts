import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { IDebuggerApi, RawLocation, Sources, Asts, LineColumnLocation, 
  onBreakpointClearedListener, onBreakpointAddedListener, onEditorContentChanged, onEnvChangedListener, TransactionReceipt } from '@remix-ui/debugger-ui'
import { DebuggerApiMixin, CompilerAbstract} from './debugger-api'

export class DebuggerClientApi extends DebuggerApiMixin(PluginClient) {  
  constructor () {
    super()    
    createClient(this as any)
    this.initDebuggerApi()
  }

  offsetToLineColumnConverter: IDebuggerApi['offsetToLineColumnConverter']
  debugHash: string
  debugHashRequest: number
  removeHighlights: boolean
  onBreakpointCleared: (listener: onBreakpointClearedListener) => void
  onBreakpointAdded: (listener: onBreakpointAddedListener) => void
  onEditorContentChanged: (listener: onEditorContentChanged) => void
  onEnvChanged: (listener: onEnvChangedListener) => void
  discardHighlight: () => Promise<void>
  highlight: (lineColumnPos: LineColumnLocation, path: string) => Promise<void>
  fetchContractAndCompile: (address: string, currentReceipt: TransactionReceipt) => Promise<CompilerAbstract>
  getFile: (path: string) => Promise<string>
  setFile: (path: string, content: string) => Promise<void>
  getDebugWeb3: () => any // returns an instance of web3.js, if applicable (mainet, goerli, ...) it returns a reference to a node from devops (so we are sure debug endpoint is available)
  web3: () => any // returns an instance of web3.js
}

