import type {
    PluginRequest,
  } from './message'

export interface PluginQueueInterface {
    setCurrentRequest(request: PluginRequest): void
    callMethod(method: string, args: any[]): void
    letContinue(): void
    cancel(): void
}