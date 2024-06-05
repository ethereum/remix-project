export type ReceiptStatus = "Pending in queue" | "Pass - Verified" | "Already Verified" | "Max rate limit reached" | "Successfully Updated"

export interface Receipt {
  guid: string
  status: ReceiptStatus
  isProxyContract: boolean
  message?: string
  succeed?: boolean
}
