// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { AccountProps } from '../types'
import { PassphrasePrompt } from './passphrase'
import { shortenAddress, CustomMenu, CustomToggle, CustomTooltip } from '@remix-ui/helper'
import { eip7702Constants } from '@remix-project/remix-lib'
import { Dropdown } from 'react-bootstrap'
const _paq = window._paq = window._paq || []

export function AccountUI(props: AccountProps) {
  const { selectedAccount, loadedAccounts } = props.accounts
  const { selectExEnv, personalMode, networkName } = props
  const accounts = Object.keys(loadedAccounts)
  const [plusOpt, setPlusOpt] = useState({
    classList: '',
    title: ''
  })
  const [contractHasDelegation, setContractHasDelegation] = useState(false)
  const [enableDelegationAuthorization, setEnableDelegationAuthorization] = useState(false)
  const [enableCSM, setEnableCSM] = useState(false)
  const [smartAccountSelected, setSmartAccountSelected] = useState(false)

  const messageRef = useRef('')
  const delegationAuthorizationAddressRef = useRef(null)
  const ownerEOA = useRef(null)

  const intl = useIntl()
  const aaSupportedChainIds = ["11155111", "100"] // AA01: Add chain id here to show 'Create Smart Account' button in Udapp
  const smartAccounts: string[] = aaSupportedChainIds.some(e => networkName.includes(e)) ? Object.keys(props.runTabPlugin.REACT_API.smartAccounts) : []

  useEffect(() => {
    if (accounts.length > 0 && !accounts.includes(selectedAccount)) {
      props.setAccount(accounts[0])
    }
  }, [accounts, selectedAccount])

  // Comment this when not to show 'Create Smart Account' button
  useEffect(() => {
    if (aaSupportedChainIds.some(e => networkName.includes(e))) {
      if (smartAccounts.length > 0 && smartAccounts.includes(selectedAccount)) {
        setSmartAccountSelected(true)
        setEnableCSM(false)
        ownerEOA.current = props.runTabPlugin.REACT_API.smartAccounts[selectedAccount].ownerEOA
      }
      else {
        setSmartAccountSelected(false)
        setEnableCSM(true)
        ownerEOA.current = null
      }
    } else {
      setEnableCSM(false)
      setSmartAccountSelected(false)
    }
  }, [selectedAccount])

  useEffect(() => {
    const run = async () => {
      if (selectExEnv !== 'vm-prague' && selectExEnv !== 'vm-mainnet-fork') {
        setEnableDelegationAuthorization(false)
        setContractHasDelegation(false)
        delegationAuthorizationAddressRef.current = null
        return
      }
      setEnableDelegationAuthorization(true)
      const web3 = props.runTabPlugin.blockchain.web3()
      if (!selectedAccount || !web3) {
        setContractHasDelegation(false)
        delegationAuthorizationAddressRef.current = null
        return
      }
      const code = await props.runTabPlugin.blockchain.web3().eth.getCode(selectedAccount)
      if (code && code.startsWith(eip7702Constants.EIP7702_CODE_INDICATOR_FLAG)) {
        // see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7702.md delegation indicator
        const address = '0x' + code.replace(eip7702Constants.EIP7702_CODE_INDICATOR_FLAG, '')
        if (address === '0x0000000000000000000000000000000000000000') {
          setContractHasDelegation(false)
          delegationAuthorizationAddressRef.current = null
        } else {
          setContractHasDelegation(true)
          delegationAuthorizationAddressRef.current = address
        }
      } else {
        setContractHasDelegation(false)
        delegationAuthorizationAddressRef.current = null
      }
    }
    run()
  }, [selectedAccount, selectExEnv])

  useEffect(() => {
    props.setAccount('')
    if (selectExEnv && selectExEnv.startsWith('injected')) {
      setPlusOpt({
        classList: 'udapp_disableMouseEvents',
        title: intl.formatMessage({ id: 'udapp.injectedTitle' })
      })
    } else {
      switch (selectExEnv) {
      case 'vm-prague':
        setPlusOpt({
          classList: '',
          title: intl.formatMessage({ id: 'udapp.createNewAccount' })
        })
        break

      case 'vm-cancun':
        setPlusOpt({
          classList: '',
          title: intl.formatMessage({ id: 'udapp.createNewAccount' })
        })
        break

      case 'vm-paris':
        setPlusOpt({
          classList: '',
          title: intl.formatMessage({ id: 'udapp.createNewAccount' })
        })
        break

      case 'vm-london':
        setPlusOpt({
          classList: '',
          title: intl.formatMessage({ id: 'udapp.createNewAccount' })
        })
        break

      case 'vm-berlin':
        setPlusOpt({
          classList: '',
          title: intl.formatMessage({ id: 'udapp.createNewAccount' })
        })
        break

      case 'vm-shanghai':
        setPlusOpt({
          classList: '',
          title: intl.formatMessage({ id: 'udapp.createNewAccount' })
        })
        break

      case 'web3':
        if (!personalMode) {
          setPlusOpt({
            classList: 'disableMouseEvents',
            title: intl.formatMessage({ id: 'udapp.web3Title' })
          })
        } else {
          setPlusOpt({
            classList: '',
            title: intl.formatMessage({ id: 'udapp.createNewAccount' })
          })
        }
        break

      default:
        setPlusOpt({
          classList: 'disableMouseEvents',
          title: intl.formatMessage({ id: 'udapp.defaultTitle' }, { selectExEnv })
        })
      }
    }
  }, [selectExEnv, personalMode, networkName])

  const createSmartAccount = () => {
    props.modal(
      intl.formatMessage({ id: 'udapp.createSmartAccountAlpha' }),
      (
        <div className="w-100" data-id="createSmartAccountModal">
          <FormattedMessage id="udapp.createSmartAccountDesc1"/><br/>
          <FormattedMessage id="udapp.createSmartAccountDesc2"/><br/><br/>
          <a href={'https://docs.safe.global/advanced/smart-account-overview#safe-smart-account'}
            target="_blank"
            onClick={() => _paq.push(['trackEvent', 'udapp', 'safeSmartAccount', 'learnMore'])}>
                Learn more
          </a><br/><br/>
          <FormattedMessage id="udapp.createSmartAccountDesc3"/><br/><br/>
          <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="createSmartAccountOwnerTooltip" tooltipText={"Owner address for Smart Account"}>
            <input type="textbox" className="form-control" value={selectedAccount} disabled/>
          </CustomTooltip><br/>
          <FormattedMessage id="udapp.createSmartAccountDesc4"/><br/><br/>
          <FormattedMessage id="udapp.createSmartAccountDesc5"/><br/><br/>
          <p><FormattedMessage id="udapp.resetVmStateDesc3"/></p>
        </div>
      ),
      intl.formatMessage({ id: 'udapp.continue' }),
      () => {
        _paq.push(['trackEvent', 'udapp', 'safeSmartAccount', 'createClicked'])
        props.createNewSmartAccount()
      },
      intl.formatMessage({ id: 'udapp.cancel' }),
      () => {
        _paq.push(['trackEvent', 'udapp', 'safeSmartAccount', 'cancelClicked'])
      }
    )
  }

  const handleDelegationAuthorizationAddressRef = (e) => {
    delegationAuthorizationAddressRef.current = e.target.value
  }

  const createDelegationAuthorization = () => {
    props.modal(
      intl.formatMessage({ id: 'udapp.createDelegationTitle' }),
      (
        <div className="w-100" data-id="createDelegationAuthorizationModal">
          <span>{intl.formatMessage({ id: 'udapp.createDelegationDescription' }, {
            a: (chunks) => (
              <a href='https://eip7702.io/' target="_blank" rel="noreferrer">
                {chunks}
              </a>
            )
          })}</span>
          <label className="mt-3">Authorization Address</label>
          <input className='border form-control' data-id="create-delegation-authorization-input" onChange={handleDelegationAuthorizationAddressRef} />
        </div>
      ),
      intl.formatMessage({ id: 'udapp.authorize' }),
      async () => {
        try {
          await props.delegationAuthorization(delegationAuthorizationAddressRef.current)
          setContractHasDelegation(true)
          _paq.push(['trackEvent', 'udapp', 'contractDelegation', 'create'])
        } catch (e) {
          props.runTabPlugin.call('terminal', 'log', { type: 'error', value: e.message })
        }
      },
      intl.formatMessage({ id: 'udapp.cancel' }),
      () => {
        props.setPassphrase('')
      }
    )
  }

  const deleteDelegation = () => {
    props.modal(
      intl.formatMessage({ id: 'udapp.removeDelegationTitle' }),
      (
        <div className="w-100">
          Are you sure to remove the delegation?
        </div>
      ),
      intl.formatMessage({ id: 'udapp.continue' }),
      async () => {
        try {
          await props.delegationAuthorization('0x0000000000000000000000000000000000000000')
          delegationAuthorizationAddressRef.current = ''
          setContractHasDelegation(false)
          _paq.push(['trackEvent', 'udapp', 'contractDelegation', 'remove'])
        } catch (e) {
          props.runTabPlugin.call('terminal', 'log', { type: 'error', value: e.message })
        }
      },
      intl.formatMessage({ id: 'udapp.cancel' }),
      () => {}
    )
  }

  const newAccount = () => {
    props.createNewBlockchainAccount(passphraseCreationPrompt())
  }

  const signMessage = () => {
    _paq.push(['trackEvent', 'udapp', 'signUsingAccount', `selectExEnv: ${selectExEnv}`])
    if (!accounts[0]) {
      return props.tooltip(intl.formatMessage({ id: 'udapp.tooltipText1' }))
    }

    if (selectExEnv === 'web3') {
      return props.modal(
        intl.formatMessage({ id: 'udapp.modalTitle1' }),
        <PassphrasePrompt message={intl.formatMessage({ id: 'udapp.modalMessage1' })} setPassphrase={props.setPassphrase} />,
        intl.formatMessage({ id: 'udapp.ok' }),
        () => {
          props.modal(
            intl.formatMessage({ id: 'udapp.signAMessage' }),
            signMessagePrompt(),
            intl.formatMessage({ id: 'udapp.sign' }),
            () => {
              props.signMessageWithAddress(selectedAccount, messageRef.current, signedMessagePrompt, props.passphrase)
              props.setPassphrase('')
            },
            intl.formatMessage({ id: 'udapp.cancel' }),
            null
          )
        },
        intl.formatMessage({ id: 'udapp.cancel' }),
        () => {
          props.setPassphrase('')
        }
      )
    }

    props.modal(
      intl.formatMessage({ id: 'udapp.signAMessage' }),
      signMessagePrompt(),
      intl.formatMessage({ id: 'udapp.sign' }),
      () => {
        props.signMessageWithAddress(selectedAccount, messageRef.current, signedMessagePrompt)
      },
      intl.formatMessage({ id: 'udapp.cancel' }),
      null
    )
  }

  const handlePassphrase = (e) => {
    props.setPassphrase(e.target.value)
  }

  const handleMatchPassphrase = (e) => {
    props.setMatchPassphrase(e.target.value)
  }

  const handleMessageInput = (e) => {
    messageRef.current = e.target.value
  }

  const passphraseCreationPrompt = () => {
    return (
      <div className="d-flex flex-column">
        <FormattedMessage id="udapp.text1" />
        <input id="prompt1" type="password" name="prompt_text" className="w-100 py-2" onInput={handlePassphrase} />
        <input id="prompt2" type="password" name="prompt_text" className="w-100" onInput={handleMatchPassphrase} />
      </div>
    )
  }

  const signMessagePrompt = () => {
    return (
      <div>
        <FormattedMessage id="udapp.enterAMessageToSign" />
        <textarea
          id="prompt_text"
          className="bg-light text-light form-control"
          data-id="signMessageTextarea"
          style={{ width: '100%' }}
          rows={4}
          cols={50}
          onInput={handleMessageInput}
          defaultValue={messageRef.current}
        ></textarea>
        <div className='mt-2'>
          <span>otherwise</span><button className='ml-2 modal-ok btn btn-sm border-primary' data-id="sign-eip-712" onClick={() => {
            props.modal(
              'Message signing with EIP-712',
              <div>
                <div>{intl.formatMessage({ id: 'udapp.EIP712-2' }, {
                  a: (chunks) => (
                    <a href='https://eips.ethereum.org/EIPS/eip-712' target="_blank" rel="noreferrer">
                      {chunks}
                    </a>
                  )
                })}</div>
                <div>{intl.formatMessage({ id: 'udapp.EIP712-3' })}</div></div>,
              intl.formatMessage({ id: 'udapp.EIP712-create-template' }),
              () => { props.addFile('EIP-712-data.json', JSON.stringify(EIP712_Example, null, '\t')) },
              intl.formatMessage({ id: 'udapp.EIP712-close' }),
              () => {})
          }}>Sign with EIP 712</button>
        </div>
      </div>
    )
  }

  const signedMessagePrompt = (msgHash: string, signedData: string) => {
    return (
      <div className="d-flex flex-column">
        <label className="text-uppercase">
          <FormattedMessage id="udapp.hash" />
        </label>
        <span id="remixRunSignMsgHash" data-id="settingsRemixRunSignMsgHash">
          {msgHash}
        </span>
        <label className="pt-2 text-uppercase">
          <FormattedMessage id="udapp.signature" />
        </label>
        <span id="remixRunSignMsgSignature" data-id="settingsRemixRunSignMsgSignature">
          {signedData}
        </span>
      </div>
    )
  }

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">
        <FormattedMessage id="udapp.account" />
        {!smartAccountSelected ? <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixPlusWrapperTooltip" tooltipText={plusOpt.title}>
          <span className="px-1" id="remixRunPlusWrapper">
            <i id="remixRunPlus" className={`fas fa-plus udapp_icon ${plusOpt.classList}`} aria-hidden="true" onClick={newAccount}></i>
          </span>
        </CustomTooltip> : null }
        {!smartAccountSelected ? <CustomTooltip placement={'top'} tooltipClasses="text-nowrap" tooltipId="remixSignMsgTooltip" tooltipText={<FormattedMessage id="udapp.signMsgUsingAccount" />}>
          <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" className="mx-1 fas fa-edit udapp_icon" aria-hidden="true" onClick={signMessage}></i>
        </CustomTooltip> : null }
        <span className='mx-1'>
          <CopyToClipboard className="fas fa-copy p-0" tip={intl.formatMessage({ id: 'udapp.copyAccount' })} content={selectedAccount} direction="top" />
        </span>
        { enableDelegationAuthorization ? (<span className="mx-1 mt-1">
          <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixDelegationAuthTooltip" tooltipText={"Using EIP 7702 in Remix"}>
            <a href={"https://remix-ide.readthedocs.io/en/latest/account-abstraction-7702.html#using-eip-7702-in-remix"} className="titleInfo p-0 mb-2" target="_blank" rel="noreferrer">
              <i aria-hidden="true" className="ml-0 fas fa-info align-self-center"></i>
            </a>
          </CustomTooltip>
        </span>) : null }
        { smartAccountSelected ? (<span className="mx-1 mt-1">
          <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixDelegationAuthTooltip" tooltipText={"Gnosis Safe Smart Accounts in Remix"}>
            <a href={"https://remix-ide.readthedocs.io/en/latest/account-abstraction-7702.html#gnosis-safe-smart-accounts-in-remix"} className="titleInfo p-0 mb-2" target="_blank" rel="noreferrer">
              <i aria-hidden="true" className="ml-0 fas fa-info align-self-center"></i>
            </a>
          </CustomTooltip>
        </span>) : null }
        {props.accounts.isRequesting && <i className="fa fa-spinner fa-pulse ml-2" aria-hidden="true"></i>}
      </label>
      <div className="udapp_account">
        <Dropdown className="udapp_selectExEnvOptions" data-id="runTabSelectAccount">
          <Dropdown.Toggle as={CustomToggle} icon={null} id="txorigin" data-id="runTabSelectAccount" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control">
            {selectedAccount ? loadedAccounts[selectedAccount] : ''}
          </Dropdown.Toggle>
          <Dropdown.Menu as={CustomMenu} className="w-100 custom-dropdown-items" data-id="custom-dropdown-items">
            {accounts && accounts.length > 0 ? accounts.map((value, index) => (
              <Dropdown.Item
                key={index}
                eventKey={selectedAccount}
                onSelect={(e) => {
                  props.setAccount(value)
                }}
                data-id={`txOriginSelectAccountItem-${value}`}
              >
                <span data-id={`${value}`}>
                  {loadedAccounts[value]}
                </span>
              </Dropdown.Item>
            )) : <Dropdown.Item></Dropdown.Item>}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      { contractHasDelegation ?
        <span className="alert-info badge badge-secondary">
          Delegation: {shortenAddress(delegationAuthorizationAddressRef.current || "")}
          <CopyToClipboard className="fas fa-copy ml-2 text-primary" content={delegationAuthorizationAddressRef.current} direction="top" />
          <a><span data-id="delete-delegation" style={{ padding: 'padding: 0.15rem' }} onClick={() => deleteDelegation()}>
            <CustomTooltip placement="top" tooltipClasses="text-nowrap" tooltipId="udapp_deleteDelegation" tooltipText="Remove delegation">
              <i className="fas fa-close ml-2 text-primary" aria-hidden="true" onClick={() => deleteDelegation()}></i>
            </CustomTooltip>
          </span></a>
        </span> : null
      }
      { smartAccountSelected ? <span className="alert-info badge badge-secondary">
          Owner: {shortenAddress(ownerEOA.current || '')}
        <CopyToClipboard className="fas fa-copy ml-2 text-primary" tip={intl.formatMessage({ id: 'udapp.copyOwnerAccount' })} content={ownerEOA.current} direction="top" />
      </span> : null
      }
      { enableCSM ? (<div className="mt-1">
        <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixCSMPlusTooltip" tooltipText={intl.formatMessage({ id: 'udapp.createSmartAccount' })}>
          <button type="button" className="btn btn-sm btn-secondary w-100" onClick={() => createSmartAccount()}>
            <i id="createSmartAccountPlus" className="mr-1 fas fa-plus" aria-hidden="true" style={{ "color": "#fff" }}></i>
            Create Smart Account
          </button>
        </CustomTooltip>
      </div>) : null }
      { enableDelegationAuthorization ? (<div className="mt-1">
        <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixDelegationAuthTooltip" tooltipText={intl.formatMessage({ id: 'udapp.createDelegationAuthorization' })}>
          <button data-id="create-delegation-authorization" type="button" className="btn btn-sm btn-secondary w-100" onClick={() => createDelegationAuthorization()}>
            <i id="createDelegationPlus" className="mr-1 fas fa-plus" aria-hidden="true" style={{ "color": "#fff" }}></i>
            Authorize Delegation
          </button>
        </CustomTooltip>
      </div>) : null }
    </div>
  )
}

const EIP712_Example = {
  domain: {
    chainId: 1,
    name: "Example App",
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    version: "1",
  },
  message: {
    prompt: "Welcome! In order to authenticate to this website, sign this request and your public address will be sent to the server in a verifiable way.",
    createdAt: 1718570375196,
  },
  primaryType: 'AuthRequest',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    AuthRequest: [
      { name: 'prompt', type: 'string' },
      { name: 'createdAt', type: 'uint256' },
    ],
  },
}
