export type ReceiptStatus = "Pending in queue" | "Pass - Verified" | "Already Verified"

export interface Receipt {
  guid: string
  status: ReceiptStatus
}
