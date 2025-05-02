import { ZeroAddress} from 'ethers'

// AA02: Add network name and public URL to support contract transactions using smart account
export const aaSupportedNetworks = {
    "11155111": {
      name: "sepolia",
      publicNodeUrl: "https://go.getblock.io/ee42d0a88f314707be11dd799b122cb9"
    },
    // "10200": {
    //   name: "gnosisChiado",
    //   publicNodeUrl: "https://rpc.chiadochain.net/"
    // }
  }

export const getPimlicoBundlerURL = (chainId) => {
    return `https://pimlico.remixproject.org/api/proxy/${chainId}`
}

export const aaLocalStorageKey = 'smartAccounts'

// AA03: Check if this address is valid for newly added network
// This determiniticProxyAddress is used for replay protection during contract deployment
// See: https://github.com/safe-global/safe-smart-account?tab=readme-ov-file#replay-protection-eip-155
export const aaDeterminiticProxyAddress = "0x4e59b44847b379578588920cA78FbF26c0B4956C"

export const toAddress = ZeroAddress // A dummy zero value tx is made to this zero address to create existence of smart account
