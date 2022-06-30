// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState, useRef } from 'react'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { AccountProps } from '../types'
import { PassphrasePrompt } from './passphrase'

export function AccountUI (props: AccountProps) {
  const { selectedAccount, loadedAccounts } = props.accounts
  const accounts = Object.keys(loadedAccounts)
  const [plusOpt, setPlusOpt] = useState({
    classList: '',
    title: ''
  })
  const messageRef = useRef('')

  useEffect(() => {
    if (!selectedAccount && accounts.length > 0) props.setAccount(accounts[0])
  }, [accounts, selectedAccount])

  useEffect(() => {
    switch (props.selectExEnv) {
      case 'injected':
        setPlusOpt({
          classList: 'udapp_disableMouseEvents',
          title: "Unfortunately it's not possible to create an account using injected web3. Please create the account directly from your provider (i.e metamask or other of the same type)."
        })
        break

      case 'vm-london':
        setPlusOpt({
          classList: '',
          title: 'Create a new account'
        })
        break

      case 'vm-berlin':
        setPlusOpt({
          classList: '',
          title: 'Create a new account'
        })
        break

      case 'web3':
        if (!props.personalMode) {
          setPlusOpt({
            classList: 'disableMouseEvents',
            title: 'Creating an account is possible only in Personal mode. Please go to Settings to enable it.'
          })
        } else {
          setPlusOpt({
            classList: '',
            title: 'Create a new account'
          })
        }
        break

      default:
        setPlusOpt({
          classList: 'disableMouseEvents',
          title: `Unfortunately it's not possible to create an account using an external wallet (${props.selectExEnv}).`
        })
    }
    // this._deps.config.get('settings/personal-mode')
  }, [props.selectExEnv, props.personalMode])

  const newAccount = () => {
    props.createNewBlockchainAccount(passphraseCreationPrompt())
  }

  const signMessage = () => {
    if (!accounts[0]) {
      return props.tooltip('Account list is empty, please make sure the current provider is properly connected to remix')
    }

    if (props.selectExEnv !== 'vm-london' && props.selectExEnv !== 'vm-berlin' && props.selectExEnv !== 'injected') {
      return props.modal('Passphrase to sign a message',
        <PassphrasePrompt
          message='Enter your passphrase for this account to sign the message'
          setPassphrase={props.setPassphrase}
        />, 'OK', () => {
          props.modal('Sign a message', signMessagePrompt(), 'OK', () => {
            props.signMessageWithAddress(selectedAccount, messageRef.current, signedMessagePrompt, props.passphrase)
            props.setPassphrase('')
          }, 'Cancel', null)
        }, 'Cancel', () => {
          props.setPassphrase('')
        })
    }

    props.modal('Sign a message', signMessagePrompt(), 'OK', () => {
      props.signMessageWithAddress(selectedAccount, messageRef.current, signedMessagePrompt)
    }, 'Cancel', null)
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
      <div> Please provide a Passphrase for the account creation
        <div>
          <input id="prompt1" type="password" name='prompt_text' style={{ width: '100%' }} onInput={handlePassphrase} />
          <br />
          <br />
          <input id="prompt2" type="password" name='prompt_text' style={{ width: '100%' }} onInput={handleMatchPassphrase} />
        </div>
      </div>
    )
  }

  const signMessagePrompt = () => {
    return (
      <div> Enter a message to sign
        <div>
          <textarea
            id="prompt_text"
            data-id="signMessageTextarea"
            style={{ width: '100%' }}
            rows={4}
            cols={50}
            onInput={handleMessageInput}
            defaultValue={messageRef.current}
          ></textarea>
        </div>
      </div>
    )
  }

  const signedMessagePrompt = (msgHash: string, signedData: string) => {
    return (
      <div>
        <b>hash:</b><br />
        <span id="remixRunSignMsgHash" data-id="settingsRemixRunSignMsgHash">{msgHash}</span>
        <br /><b>signature:</b><br />
        <span id="remixRunSignMsgSignature" data-id="settingsRemixRunSignMsgSignature">{signedData}</span>
      </div>
    )
  }

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">
        Account
        <span id="remixRunPlusWraper" title={plusOpt.title}>
          <i id="remixRunPlus" className={`fas fa-plus-circle udapp_icon ${plusOpt.classList}`} aria-hidden="true" onClick={newAccount}></i>
        </span>
      </label>
      <div className="udapp_account">
        <select id="txorigin" data-id="runTabSelectAccount" name="txorigin" className="form-control udapp_select custom-select pr-4" value={selectedAccount} onChange={(e) => { props.setAccount(e.target.value) }}>
          {
            accounts.map((value, index) => <option value={value} key={index}>{ loadedAccounts[value] }</option>)
          }
        </select>
        <div style={{ marginLeft: -5 }}><CopyToClipboard tip='Copy account to clipboard' content={selectedAccount} direction='top' /></div>
        <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" className="mx-1 fas fa-edit udapp_icon" aria-hidden="true" onClick={signMessage} title="Sign a message using this account"></i>
      </div>
    </div>
  )
}
