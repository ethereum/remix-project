// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { AccountProps } from '../types'
import { PassphrasePrompt } from './passphrase'
import { CustomMenu, CustomToggle, CustomTooltip } from '@remix-ui/helper'
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
  const [enableCSM, setEnableCSM] = useState(false)
  const messageRef = useRef('')

  const intl = useIntl()
  const smartAccounts: string[] = networkName.includes('Sepolia') ? Object.keys(props.runTabPlugin.REACT_API.smartAccounts) : []

  useEffect(() => {
    if (accounts.length > 0 && !accounts.includes(selectedAccount)) {
      props.setAccount(accounts[0])
    }
  }, [accounts, selectedAccount])

  useEffect(() => {
    if (smartAccounts.length > 0 && !smartAccounts.includes(selectedAccount) && networkName.includes('Sepolia'))
      setEnableCSM(true)
    else setEnableCSM(false)
  }, [selectedAccount])

  useEffect(() => {
    props.setAccount('')
    if (selectExEnv && selectExEnv.startsWith('injected')) {
        setPlusOpt({
          classList: 'udapp_disableMouseEvents',
          title: intl.formatMessage({ id: 'udapp.injectedTitle' })
        })
    } else {
      switch (selectExEnv) {
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
        <div data-id="createSmartAccountModal">
          <ul className='ml-3'>
            <li><FormattedMessage id="udapp.createSmartAccountDesc1"/></li><br/>
            <li><FormattedMessage id="udapp.createSmartAccountDesc2"/>
              <a href={'https://docs.safe.global/advanced/smart-account-overview#safe-smart-account'}
                target="_blank"
                onClick={() => _paq.push(['trackEvent', 'udapp', 'safeSmartAccount', 'learnMore'])}>
                    Learn more
              </a>
            </li><br/>
            <li><FormattedMessage id="udapp.createSmartAccountDesc3"/></li><br/>
            <li>{intl.formatMessage({ id: 'udapp.createSmartAccountDesc4' }, { owner: selectedAccount })}</li><br/>
            <li><FormattedMessage id="udapp.createSmartAccountDesc5"/></li><br/>
            <p><FormattedMessage id="udapp.resetVmStateDesc3"/></p>
          </ul>
        </div>
      ),
      intl.formatMessage({ id: 'udapp.continue' }),
      () => {
        props.createNewSmartAccount()
      },
      intl.formatMessage({ id: 'udapp.cancel' }),
      () => {
        props.setPassphrase('')
      }
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
        <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixPlusWrapperTooltip" tooltipText={plusOpt.title}>
          <span id="remixRunPlusWrapper">
            <i id="remixRunPlus" className={`ml-2 fas fa-plus udapp_icon ${plusOpt.classList}`} aria-hidden="true" onClick={newAccount}></i>
          </span>
        </CustomTooltip>
        <CustomTooltip placement={'top'} tooltipClasses="text-nowrap" tooltipId="remixSignMsgTooltip" tooltipText={<FormattedMessage id="udapp.signMsgUsingAccount" />}>
          <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" className="ml-2 fas fa-edit udapp_icon" aria-hidden="true" onClick={signMessage}></i>
        </CustomTooltip>
        <span >
          <CopyToClipboard className="fas fa-copy ml-2 p-0" tip={intl.formatMessage({ id: 'udapp.copyAccount' })} content={selectedAccount} direction="top" />
        </span>
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
      { enableCSM ? (<div className="mt-1">
        <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixCSMPlusTooltip" tooltipText={intl.formatMessage({ id: 'udapp.createSmartAccount' })}>
          <button type="button" className="btn btn-sm btn-secondary w-100" onClick={() => createSmartAccount()}>
            <i id="createSmartAccountPlus" className="mr-1 fas fa-plus" aria-hidden="true" style={{"color": "#fff"}}></i>
            Create Smart Account
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
