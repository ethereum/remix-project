import { useContext, useEffect, useMemo, useState } from 'react'
import { SearchableChainDropdown, ContractAddressInput } from '../components'
import { mergeChainSettingsWithDefaults, validConfiguration } from '../utils'
import type { LookupResponse, AbiProviderIdentifier, ContractInstance } from '../types'
import { VERIFIERS } from '../types'
import { AppContext } from '../AppContext'
import { CustomTooltip } from '@remix-ui/helper'
import { getVerifier } from '../abiProviders'
import { useNavigate } from 'react-router-dom'
import { VerifyFormContext } from '../VerifyFormContext'
import { useSourcifySupported } from '../hooks/useSourcifySupported'
import { InstanceContainerUI } from '../components/instanceContainerUI'
import { ContractVerificationPluginClient } from '../ContractVerificationPluginClient'

export interface LookupABIViewProps {
  plugin: ContractVerificationPluginClient
}

export const LookupABIView = (props: LookupABIViewProps) => {
  const { settings, clientInstance } = useContext(AppContext)
  const { selectedChain, setSelectedChain } = useContext(VerifyFormContext)
  const [contractAddress, setContractAddress] = useState('')
  const [contractAddressError, setContractAddressError] = useState('')
  const [contractInstances, setContractInstances] = useState<ContractInstance[]>([])
  const [loadingVerifiers, setLoadingVerifiers] = useState<Partial<Record<AbiProviderIdentifier, boolean>>>({})
  const [lookupResults, setLookupResult] = useState<Partial<Record<AbiProviderIdentifier, LookupResponse>>>({})
  const navigate = useNavigate()

  const chainSettings = useMemo(() => (selectedChain ? mergeChainSettingsWithDefaults(selectedChain.chainId.toString(), settings) : undefined), [selectedChain, settings])

  const sourcifySupported = useSourcifySupported(selectedChain, chainSettings)

  const noVerifierEnabled = VERIFIERS.every((verifierId) => !validConfiguration(chainSettings, verifierId) || (verifierId === 'Sourcify' && !sourcifySupported))
  const submitDisabled = !!contractAddressError || !contractAddress || !selectedChain || noVerifierEnabled

  // Reset results when chain or contract changes
  useEffect(() => {
    setLookupResult({})
    setLoadingVerifiers({})
  }, [selectedChain, contractAddress])

  const handleSelectedChain = async (newSelectedChain) => {
    setSelectedChain(newSelectedChain)
    // const isPinnedAvailable = await props.plugin.call('fileManager', 'getFolder', `.lookedUpContracts/pinned-contracts/${newSelectedChain.chainId}`)
    // if (isPinnedAvailable) {
    //   await props.plugin.call('fileManager', 'remove', `.lookedUpContracts/pinned-contracts/${props.chain.chainId}`)
    //   _paq.push(['trackEvent', 'contractInteraction', 'pinnedContracts', 'clearInstance'])
    // }    // props.clearInstances()
  }

  const handleLookup = (e) => {
    if (Object.values(loadingVerifiers).some((loading) => loading)) {
      console.error('Lookup request already running')
      return
    }

    e.preventDefault()

    for (const verifierId of VERIFIERS) {
      if (!validConfiguration(chainSettings, verifierId) || (verifierId === 'Sourcify' && !sourcifySupported)) {
        continue
      }

      // TODO: only fetch ABI if it's not already available.
      setLoadingVerifiers((prev) => ({ ...prev, [verifierId]: true }))
      const verifier = getVerifier(verifierId, chainSettings.verifiers[verifierId])
      verifier
        .lookupABI(contractAddress)
        .then((contractABI) => {
          if (contractABI) {
            setContractInstances([...contractInstances, {
              address: contractAddress,
              name: `${(contractInstances.length + 1).toString()}`,
              abiRead: contractABI.abiRead,
              abiWrite: contractABI.abiWrite,
              abiProxyRead: contractABI.abiProxyRead,
              abiProxyWrite: contractABI.abiProxyWrite,
              isPinned: false,
            } as ContractInstance,
            ])
          }
        })
        .catch((err) =>
          setLookupResult((prev) => {
            console.error(err)
            return { ...prev, [verifierId]: { status: 'lookup failed' } }
          })
        )
        .finally(() => setLoadingVerifiers((prev) => ({ ...prev, [verifierId]: false })))
    }
  }

  return (
    <>
      <form onSubmit={handleLookup}>
        <SearchableChainDropdown label="Chain" id="network-dropdown" selectedChain={selectedChain} setSelectedChain={handleSelectedChain} />

        <ContractAddressInput label="Contract Address" id="contract-address" contractAddress={contractAddress} setContractAddress={setContractAddress} contractAddressError={contractAddressError} setContractAddressError={setContractAddressError} />

        <button type="submit" className="btn btn-primary" disabled={submitDisabled}>
          Lookup
        </button>
      </form>
      <div className="pt-3">
        {chainSettings &&
          VERIFIERS.map((verifierId) => {
            if (!validConfiguration(chainSettings, verifierId)) {
              return (
                <div key={verifierId} className="pt-4">
                  <div>
                    <span className="font-weight-bold text-secondary">{verifierId}</span>{' '}
                    <CustomTooltip tooltipText="Configure the API in the settings">
                      <span className="text-secondary" style={{ textDecoration: 'underline dotted', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                        Enable?
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
              )
            }

            if (verifierId === 'Sourcify' && !sourcifySupported) {
              return (
                <div key={verifierId} className="pt-4">
                  <div>
                    <span className="font-weight-bold text-secondary">{verifierId}</span>{' '}
                    <CustomTooltip tooltipText={`The configured Sourcify server (${chainSettings.verifiers['Sourcify'].apiUrl}) does not support chain ${selectedChain?.chainId}`}>
                      <span className="text-secondary w-auto" style={{ textDecoration: 'underline dotted', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                        Unsupported
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
              )
            }

            return (
              <div key={verifierId} className="pt-4">
                <div>
                  <span className="font-weight-bold">{verifierId}</span> <span className="text-secondary">{chainSettings.verifiers[verifierId].apiUrl}</span>
                </div>
                {!!loadingVerifiers[verifierId] && (
                  <div className="pt-2 d-flex justify-content-center">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                  </div>
                )}
                {!loadingVerifiers[verifierId] && !!lookupResults[verifierId] && (
                  <div>
                    <div className="pt-2">
                      Status:{' '}
                      <span className="font-weight-bold" style={{ textTransform: 'capitalize' }}>
                        {lookupResults[verifierId].status}
                      </span>{' '}
                      {!!lookupResults[verifierId].lookupUrl && <a href={lookupResults[verifierId].lookupUrl} target="_blank" className="fa fas fa-arrow-up-right-from-square"></a>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {contractInstances.length > 0 && (
        <InstanceContainerUI
          // TODO
          // clearInstances={() => { }}
          // unpinInstance={(index) => { }}
          // pinInstance={(index, pinnedAt) => { }}
          // removeInstance={(index) => { }}

          // "TODO: runTransactions + sendValue"
          // runTransactions={executeTransactions}
          // sendValue={runTab.sendValue}
          // gasEstimationPrompt={gasEstimationPrompt}
          // passphrasePrompt={passphrasePrompt}
          // mainnetPrompt={mainnetPrompt}

          // solcVersion={solcVersion}
          // getVersion={getVersion}
          // getFuncABIInputs={getFuncABIValues}
          // TODO
          solcVersion={{
            version: '',
            canReceive: false
          }}
          evmCheckComplete={true}
          instances={{
            instanceList: contractInstances, error: ""
          }}
          exEnvironment={"TODO: environment"}
          plugin={props.plugin}
          chain={selectedChain}
          editInstance={(instance) => {
            // TODO
            // const {metadata, abi, object} = instance.contractData
            // plugin.call('quick-dapp', 'edit', {
            //   address: instance.address,
            //   abi: abi,
            //   name: instance.name,
            //   network: runTab.networkName,
            //   devdoc: object.devdoc,
            //   methodIdentifiers: object.evm.methodIdentifiers,
            //   solcVersion: JSON.parse(metadata).compiler.version,
            // })
          }}
        />
      )}
    </>
  )
}
