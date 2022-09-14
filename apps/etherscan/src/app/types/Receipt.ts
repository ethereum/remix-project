export type ReceiptStatus = "Verified" | "Queue"

export interface Receipt {
  guid: string
  status: ReceiptStatus
}
