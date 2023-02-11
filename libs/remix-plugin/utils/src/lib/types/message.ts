export interface PluginRequest {
  /** The name of the plugin making the request */
  from: string,
  /** @deprecated Will be remove in the next version */
  isFromNative?: boolean,
  /**
   * The path to access the request inside the plugin
   * @example 'remixd.cmd.git'
   */
  path?: string
}

type MessageActions = 'on' | 'off' | 'once' | 'call' | 'response' | 'emit' | 'cancel'

/** @deprecated Use `MessageAcitons` instead */
type OldMessageActions = 'notification' | 'request' | 'response' | 'listen'

export interface Message {
  id: number
  action: MessageActions | OldMessageActions
  name: string
  key: string
  payload: any
  requestInfo: PluginRequest
  error?: Error | string
}
