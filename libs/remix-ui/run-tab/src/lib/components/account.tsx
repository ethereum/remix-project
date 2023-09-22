// eslint-disable-next-line no-use-before-define
import React, {useEffect, useState, useRef} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'
import {AccountProps} from '../types'
import {PassphrasePrompt} from './passphrase'
import {CustomTooltip} from '@remix-ui/helper'
import CopyIcon from './copyToClipboard'

export function AccountUI(props: AccountProps) {
  const {selectedAccount, loadedAccounts} = props.accounts
  const accounts = Object.keys(loadedAccounts)
  const [plusOpt, setPlusOpt] = useState({
    classList: '',
    title: ''
  })
  const messageRef = useRef('')

  const intl = useIntl()

  useEffect(() => {
    if (!selectedAccount && accounts.length > 0) props.setAccount(accounts[0])
  }, [accounts, selectedAccount])

  useEffect(() => {
    switch (props.selectExEnv) {
    case 'injected':
      setPlusOpt({
        classList: 'udapp_disableMouseEvents',
        title: intl.formatMessage({id: 'udapp.injectedTitle'})
      })
      break

    case 'vm-merge':
      setPlusOpt({
        classList: '',
        title: intl.formatMessage({id: 'udapp.createNewAccount'})
      })
      break

    case 'vm-london':
      setPlusOpt({
        classList: '',
        title: intl.formatMessage({id: 'udapp.createNewAccount'})
      })
      break

    case 'vm-berlin':
      setPlusOpt({
        classList: '',
        title: intl.formatMessage({id: 'udapp.createNewAccount'})
      })
      break

    case 'vm-shanghai':
      setPlusOpt({
        classList: '',
        title: intl.formatMessage({id: 'udapp.createNewAccount'})
      })
      break

    case 'web3':
      if (!props.personalMode) {
        setPlusOpt({
          classList: 'disableMouseEvents',
          title: intl.formatMessage({id: 'udapp.web3Title'})
        })
      } else {
        setPlusOpt({
          classList: '',
          title: intl.formatMessage({id: 'udapp.createNewAccount'})
        })
      }
      break

    default:
      setPlusOpt({
        classList: 'disableMouseEvents',
        title: intl.formatMessage({id: 'udapp.defaultTitle'}, {selectExEnv: props.selectExEnv})
      })
    }
    // this._deps.config.get('settings/personal-mode')
  }, [props.selectExEnv, props.personalMode])

  const newAccount = () => {
    props.createNewBlockchainAccount(passphraseCreationPrompt())
  }

  const signMessage = () => {
    if (!accounts[0]) {
      return props.tooltip(intl.formatMessage({id: 'udapp.tooltipText1'}))
    }

    if (props.selectExEnv === 'web3') {
      return props.modal(
        intl.formatMessage({id: 'udapp.modalTitle1'}),
        <PassphrasePrompt message={intl.formatMessage({id: 'udapp.modalMessage1'})} setPassphrase={props.setPassphrase} />,
        intl.formatMessage({id: 'udapp.ok'}),
        () => {
          props.modal(
            intl.formatMessage({id: 'udapp.signAMessage'}),
            signMessagePrompt(),
            intl.formatMessage({id: 'udapp.ok'}),
            () => {
              props.signMessageWithAddress(selectedAccount, messageRef.current, signedMessagePrompt, props.passphrase)
              props.setPassphrase('')
            },
            intl.formatMessage({id: 'udapp.cancel'}),
            null
          )
        },
        intl.formatMessage({id: 'udapp.cancel'}),
        () => {
          props.setPassphrase('')
        }
      )
    }

    props.modal(
      intl.formatMessage({id: 'udapp.signAMessage'}),
      signMessagePrompt(),
      intl.formatMessage({id: 'udapp.ok'}),
      () => {
        props.signMessageWithAddress(selectedAccount, messageRef.current, signedMessagePrompt)
      },
      intl.formatMessage({id: 'udapp.cancel'}),
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
          className="bg-light text-light"
          data-id="signMessageTextarea"
          style={{width: '100%'}}
          rows={4}
          cols={50}
          onInput={handleMessageInput}
          defaultValue={messageRef.current}
        ></textarea>
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
        <CustomTooltip placement={'top-start'} tooltipClasses="text-wrap" tooltipId="remixPlusWrapperTooltip" tooltipText={plusOpt.title}>
          <span id="remixRunPlusWraper">
            <i id="remixRunPlus" className={`fas fa-plus-circle udapp_icon ${plusOpt.classList}`} aria-hidden="true" onClick={newAccount}></i>
          </span>
        </CustomTooltip>
        {props.accounts.isRequesting && <i className="fa fa-spinner fa-pulse ml-2" aria-hidden="true"></i>}
      </label>
      <div className="udapp_account">
        <select
          id="txorigin"
          data-id="runTabSelectAccount"
          name="txorigin"
          className="form-control udapp_select custom-select pr-4"
          value={selectedAccount || ''}
          onChange={(e) => {
            props.setAccount(e.target.value)
          }}
        >
          {accounts.map((value, index) => (
            <option value={value} key={index}>
              {loadedAccounts[value]}
            </option>
          ))}
        </select>
        <CopyIcon
          selectedAccount={selectedAccount}
          intl={intl}
        />
        <CustomTooltip placement={'top-start'} tooltipClasses="text-nowrap" tooltipId="remixSignMsgTooltip" tooltipText={<FormattedMessage id="udapp.signMsgUsingAccount" />}>
          <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" className="mx-1 fas fa-edit udapp_icon" aria-hidden="true" onClick={signMessage}></i>
        </CustomTooltip>
      </div>
    </div>
  )
}
