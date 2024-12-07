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
