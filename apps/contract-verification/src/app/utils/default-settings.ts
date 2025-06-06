import type { ChainSettings, ContractVerificationSettings, SettingsForVerifier, VerifierSettings } from '../types/SettingsTypes'
import { VerifierIdentifier, VERIFIERS } from '../types/VerificationTypes'
import DEFAULT_APIS from './default-apis.json'

export function mergeChainSettingsWithDefaults(chainId: string, userSettings: ContractVerificationSettings): ChainSettings {
  const verifiers: SettingsForVerifier = {}

  for (const verifierId of VERIFIERS) {
    const userSetting: VerifierSettings = userSettings.chains[chainId]?.verifiers[verifierId] ?? {}

    verifiers[verifierId] = { ...userSetting }

    let defaultsForVerifier: VerifierSettings
    if (verifierId === 'Sourcify') {
      defaultsForVerifier = DEFAULT_APIS['Sourcify']
    } else if (verifierId === 'Etherscan') {
      const apiUrl = DEFAULT_APIS['Etherscan'].apiUrl
      const explorerUrl = DEFAULT_APIS['Etherscan'][chainId]?.explorerUrl
      defaultsForVerifier = { apiUrl, explorerUrl }
    } else if (verifierId === 'Routescan') {
      const routescanDefaults = DEFAULT_APIS['Routescan']

      if (!routescanDefaults[chainId]) {
        defaultsForVerifier = {}
      } else {
        const explorerUrl = routescanDefaults[chainId]?.type === 'mainnet' ? routescanDefaults.mainnetExplorerUrl : routescanDefaults.testnetExplorerUrl
        const apiUrl = routescanDefaults.apiUrl.replace('${CHAIN_TYPE}', routescanDefaults[chainId]?.type).replace('${CHAIN_ID}', chainId)
        defaultsForVerifier = { explorerUrl, apiUrl }
      }
    } else {
      defaultsForVerifier = DEFAULT_APIS[verifierId][chainId] ?? {}
    }

    // Prefer user settings over defaults
    verifiers[verifierId] = Object.assign({}, defaultsForVerifier, userSetting)
  }
  return { verifiers }
}

export function validConfiguration(chainSettings: ChainSettings | undefined, verifierId: VerifierIdentifier) {
  return !!chainSettings && !!chainSettings.verifiers[verifierId]?.apiUrl && (verifierId !== 'Etherscan' || !!chainSettings.verifiers[verifierId]?.apiKey)
}
