import { EtherscanVerifier } from '../Verifiers/EtherscanVerifier'
import { SourcifyVerifier } from '../Verifiers/SourcifyVerifier'

export interface ReceiptProps {
  verifyPromise: Promise<any>
  address: string
  chainId: string
  verifier: EtherscanVerifier | SourcifyVerifier
}
