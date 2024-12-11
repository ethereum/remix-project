import { useContext, useEffect, useMemo, useState } from 'react'
import { SearchableChainDropdown, ContractAddressInput } from '../components'
import { mergeChainSettingsWithDefaults, validConfiguration } from '../utils'
import type { LookupResponse, AbiProviderIdentifier, ContractInstance } from '../types'
import { ABI_PROVIDERS } from '../types'
import { AppContext } from '../AppContext'
import { CustomTooltip } from '@remix-ui/helper'
import { getAbiProvider } from '../abiProviders'
import { useNavigate } from 'react-router-dom'
import { InteractionFormContext } from '../InteractionFormContext'
import { useSourcifySupported } from '../hooks/useSourcifySupported'
import { InstanceContainerUI } from '../components/instanceContainerUI'
import { ContractInteractionPluginClient } from '../ContractInteractionPluginClient'

export interface LookupABIViewProps {
  plugin: ContractInteractionPluginClient
}

export const LookupABIView = (props: LookupABIViewProps) => {
  const { settings, clientInstance } = useContext(AppContext)
  const { selectedChain, setSelectedChain } = useContext(InteractionFormContext)
  const [contractAddress, setContractAddress] = useState('')
  const [contractAddressError, setContractAddressError] = useState('')
  const [contractInstances, setContractInstances] = useState<ContractInstance[]>([])
  const [loadingAbiProviders, setLoadingAbiProviders] = useState<Partial<Record<AbiProviderIdentifier, boolean>>>({})
  const [lookupResults, setLookupResult] = useState<Partial<Record<AbiProviderIdentifier, LookupResponse>>>({})
  const navigate = useNavigate()

  const chainSettings = useMemo(() => (selectedChain ? mergeChainSettingsWithDefaults(selectedChain.chainId.toString(), settings) : undefined), [selectedChain, settings])

  const sourcifySupported = useSourcifySupported(selectedChain, chainSettings)

  const noAbiProviderEnabled = ABI_PROVIDERS.every((abiProviderIndex) => !validConfiguration(chainSettings, abiProviderIndex) || (abiProviderIndex === 'Sourcify' && !sourcifySupported))
  const submitDisabled = !!contractAddressError || !contractAddress || !selectedChain || noAbiProviderEnabled

  // Reset results when chain or contract changes
  useEffect(() => {
    setLookupResult({})
    setLoadingAbiProviders({})
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
    if (Object.values(loadingAbiProviders).some((loading) => loading)) {
      console.error('Lookup request already running')
      return
    }

    e.preventDefault()

    for (const abiProviderIndex of ABI_PROVIDERS) {
      if (!validConfiguration(chainSettings, abiProviderIndex) || (abiProviderIndex === 'Sourcify' && !sourcifySupported)) {
        continue
      }

      // TODO: only fetch ABI if it's not already available.
      setLoadingAbiProviders((prev) => ({ ...prev, [abiProviderIndex]: true }))
      const abiProvider = getAbiProvider(abiProviderIndex, chainSettings.abiProviders[abiProviderIndex])
      abiProvider
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
            return { ...prev, [abiProviderIndex]: { status: 'lookup failed' } }
          })
        )
        .finally(() => setLoadingAbiProviders((prev) => ({ ...prev, [abiProviderIndex]: false })))
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
          ABI_PROVIDERS.map((abiProviderIndex) => {
            if (!validConfiguration(chainSettings, abiProviderIndex)) {
              return (
                <div key={abiProviderIndex} className="pt-4">
                  <div>
                    <span className="font-weight-bold text-secondary">{abiProviderIndex}</span>{' '}
                    <CustomTooltip tooltipText="Configure the API in the settings">
                      <span className="text-secondary" style={{ textDecoration: 'underline dotted', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                        Enable?
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
              )
            }

            if (abiProviderIndex === 'Sourcify' && !sourcifySupported) {
              return (
                <div key={abiProviderIndex} className="pt-4">
                  <div>
                    <span className="font-weight-bold text-secondary">{abiProviderIndex}</span>{' '}
                    <CustomTooltip tooltipText={`The configured Sourcify server (${chainSettings.abiProviders['Sourcify'].apiUrl}) does not support chain ${selectedChain?.chainId}`}>
                      <span className="text-secondary w-auto" style={{ textDecoration: 'underline dotted', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                        Unsupported
                      </span>
                    </CustomTooltip>
                  </div>
                </div>
              )
            }

            return (
              <div key={abiProviderIndex} className="pt-4">
                <div>
                  <span className="font-weight-bold">{abiProviderIndex}</span> <span className="text-secondary">{chainSettings.abiProviders[abiProviderIndex].apiUrl}</span>
                </div>
                {/* {!!loadingAbiProviders[abiProviderIndex] && (
                  <div className="pt-2 d-flex justify-content-center">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                  </div>
                )}
                {!loadingAbiProviders[abiProviderIndex] && !!lookupResults[abiProviderIndex] && (
                  <div>
                    <div className="pt-2">
                      Status:{' '}
                      <span className="font-weight-bold" style={{ textTransform: 'capitalize' }}>
                        {lookupResults[abiProviderIndex].status}
                      </span>{' '}
                      {!!lookupResults[abiProviderIndex].lookupUrl && <a href={lookupResults[abiProviderIndex].lookupUrl} target="_blank" className="fa fas fa-arrow-up-right-from-square"></a>}
                    </div>
                  </div>
                )} */}
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
