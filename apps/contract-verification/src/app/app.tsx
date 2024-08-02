import { useState, useEffect, useRef } from 'react'

import { ContractVerificationPluginClient } from './ContractVerificationPluginClient'

import { AppContext } from './AppContext'
import DisplayRoutes from './routes'
import type { ContractVerificationSettings, ThemeType, Chain, SubmittedContracts, VerificationReceipt, VerificationResponse } from './types'
import { mergeChainSettingsWithDefaults } from './utils'

import './App.css'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import { useLocalStorage } from './hooks/useLocalStorage'
import { getVerifier } from './Verifiers'

const plugin = new ContractVerificationPluginClient()

const App = () => {
  const [themeType, setThemeType] = useState<ThemeType>('dark')
  const [settings, setSettings] = useLocalStorage<ContractVerificationSettings>('contract-verification:settings', { chains: {} })
  const [submittedContracts, setSubmittedContracts] = useLocalStorage<SubmittedContracts>('contract-verification:submitted-contracts', {})
  // TODO: Types for chains
  const [chains, setChains] = useState<Chain[]>([]) // State to hold the chains data
  const [compilationOutput, setCompilationOutput] = useState<{ [key: string]: CompilerAbstract } | undefined>()
  const timer = useRef(null)

  useEffect(() => {
    // TODO: Fix 'compilationFinished' event types. The interface is outdated at https://github.com/ethereum/remix-plugin/blob/master/packages/api/src/lib/compiler/api.ts. It does not include data, input, or version. See the current parameters: https://github.com/ethereum/remix-project/blob/9f6c5be882453a555055f07171701459e4ae88a4/libs/remix-solidity/src/compiler/compiler.ts#L189

    // Fetch compiler artefacts initially
    plugin.call('compilerArtefacts' as any, 'getAllCompilerAbstracts').then((obj: any) => {
      setCompilationOutput(obj)
    })

    // Subscribe to compilations
    plugin.on('compilerArtefacts' as any, 'compilationSaved', (compilerAbstracts: { [key: string]: CompilerAbstract }) => {
      setCompilationOutput((prev) => ({ ...(prev || {}), ...compilerAbstracts }))
    })

    // TODO: Is there a way to get all compilations from the `build-info` files without having to compile again?

    // Fetch chains.json and update state
    fetch('https://chainid.network/chains.json')
      .then((response) => response.json())
      .then((data) => setChains(data))
      .catch((error) => console.error('Failed to fetch chains.json:', error))

    // Clean up on unmount
    return () => {
      plugin.off('compilerArtefacts' as any, 'compilationSaved')
    }
  }, [])

  // Poll status of pending receipts frequently
  useEffect(() => {
    const getPendingReceipts = (submissions: SubmittedContracts) => {
      const pendingReceipts: VerificationReceipt[] = []
      // Check statuses of receipts
      for (const submission of Object.values(submissions)) {
        for (const receipt of submission.receipts) {
          if (receipt.status === 'pending') {
            pendingReceipts.push(receipt)
          }
        }
        for (const proxyReceipt of submission.proxyReceipts ?? []) {
          if (proxyReceipt.status === 'pending') {
            pendingReceipts.push(proxyReceipt)
          }
        }
      }
      return pendingReceipts
    }

    let pendingReceipts = getPendingReceipts(submittedContracts)

    if (pendingReceipts.length > 0) {
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }

      const pollStatus = async () => {
        const changedSubmittedContracts = { ...submittedContracts }

        for (const receipt of pendingReceipts) {
          await new Promise((resolve) => setTimeout(resolve, 500)) // avoid api rate limit exceed.

          const { verifierInfo, receiptId } = receipt
          if (receiptId) {
            const contract = changedSubmittedContracts[receipt.contractId]
            const chainSettings = mergeChainSettingsWithDefaults(contract.chainId, settings)
            const verifierSettings = chainSettings.verifiers[verifierInfo.name]

            // In case the user overwrites the API later, prefer the one stored in localStorage
            const verifier = getVerifier(verifierInfo.name, { ...verifierSettings, apiUrl: verifierInfo.apiUrl })
            if (!verifier.checkVerificationStatus) {
              continue
            }

            try {
              let response: VerificationResponse
              if (receipt.isProxyReceipt) {
                response = await verifier.checkProxyVerificationStatus(receiptId)
              } else {
                response = await verifier.checkVerificationStatus(receiptId)
              }
              const { status, message, lookupUrl } = response
              receipt.status = status
              receipt.message = message
              if (lookupUrl) {
                receipt.lookupUrl = lookupUrl
              }
            } catch (e) {
              receipt.failedChecks++
              // Only retry 5 times
              if (receipt.failedChecks >= 5) {
                receipt.status = 'failed'
                receipt.message = e.message
              }
            }
          }
        }

        pendingReceipts = getPendingReceipts(changedSubmittedContracts)
        if (timer.current && pendingReceipts.length === 0) {
          clearInterval(timer.current)
          timer.current = null
        }
        setSubmittedContracts((prev) => Object.assign({}, prev, changedSubmittedContracts))
      }

      timer.current = setInterval(pollStatus, 1000)
    }
  }, [submittedContracts])

  return (
    <AppContext.Provider value={{ themeType, setThemeType, clientInstance: plugin, settings, setSettings, chains, compilationOutput, submittedContracts, setSubmittedContracts }}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
