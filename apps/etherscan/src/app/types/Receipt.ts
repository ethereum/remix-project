export type ReceiptStatus = "Pending in queue" | "Pass - Verified" | "Already Verified" | "Max rate limit reached"

export interface Receipt {
  guid: string
  status: ReceiptStatus
}
