import { customAction } from "@remixproject/plugin-api"

export interface FlattenerAPI {
  flattenFileCustomAction(action: customAction): Promise<void>
  save(): Promise<void>
  flatten(): Promise<void>
  fileName: string
  flatFileName: string
}