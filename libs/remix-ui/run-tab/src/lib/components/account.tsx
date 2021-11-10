// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { AccountProps } from '../types'

export function AccountUI (props: AccountProps) {
  const accounts = Object.keys(props.accounts.loadedAccounts)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const plusBtn = useRef(null)
  const plusTitle = useRef(null)

  useEffect(() => {
    if (!selectedAccount && accounts.length > 0) setSelectedAccount(accounts[0])
  }, [accounts, selectedAccount])

  const updatePlusButton = () => {
    // enable/disable + button
    switch (props.selectExEnv) {
      case 'injected':
        plusBtn.current.classList.add('udapp_disableMouseEvents')
        plusTitle.current.title = "Unfortunately it's not possible to create an account using injected web3. Please create the account directly from your provider (i.e metamask or other of the same type)."

        break
      case 'vm':
        plusBtn.current.classList.remove('udapp_disableMouseEvents')
        plusTitle.current.title = 'Create a new account'

        break

      case 'web3':
        this.onPersonalChange()

        break
      default: {
        plusBtn.current.classList.add('udapp_disableMouseEvents')
        plusTitle.current.title = `Unfortunately it's not possible to create an account using an external wallet (${props.selectExEnv}).`
      }
    }
  }

  const newAccount = () => {
    // dispatch createNewBlockchainAccount
    // this.blockchain.newAccount(
    //   '',
    //   (cb) => {
    //     modalDialogCustom.promptPassphraseCreation((error, passphrase) => {
    //       if (error) {
    //         return modalDialogCustom.alert(error)
    //       }
    //       cb(passphrase)
    //     }, () => {})
    //   },
    //   (error, address) => {
    //     if (error) {
    //       return addTooltip('Cannot create an account: ' + error)
    //     }
    //     addTooltip(`account ${address} created`)
    //   }
    // )
  }

  const signMessage = () => {
    // dispatch signMessageWithBlockchainAccounts
  //   this.blockchain.getAccounts((err, accounts) => {
  //     if (err) {
  //       return addTooltip(`Cannot get account list: ${err}`)
  //     }

    //     var signMessageDialog = { title: 'Sign a message', text: 'Enter a message to sign', inputvalue: 'Message to sign' }
    //     var $txOrigin = this.el.querySelector('#txorigin')
    //     if (!$txOrigin.selectedOptions[0] && (this.blockchain.isInjectedWeb3() || this.blockchain.isWeb3Provider())) {
    //       return addTooltip('Account list is empty, please make sure the current provider is properly connected to remix')
    //     }

    //     var account = $txOrigin.selectedOptions[0].value

    //     var promptCb = (passphrase) => {
    //       const modal = modalDialogCustom.promptMulti(signMessageDialog, (message) => {
    //         this.blockchain.signMessage(message, account, passphrase, (err, msgHash, signedData) => {
    //           if (err) {
    //             return addTooltip(err)
    //           }
    //           modal.hide()
    //           modalDialogCustom.alert(yo`
    //             <div>
    //               <b>hash:</b><br>
    //               <span id="remixRunSignMsgHash" data-id="settingsRemixRunSignMsgHash">${msgHash}</span>
    //               <br><b>signature:</b><br>
    //               <span id="remixRunSignMsgSignature" data-id="settingsRemixRunSignMsgSignature">${signedData}</span>
    //             </div>
    //           `)
    //         })
    //       }, false)
    //     }

  //     if (this.blockchain.isWeb3Provider()) {
  //       return modalDialogCustom.promptPassphrase(
  //         'Passphrase to sign a message',
  //         'Enter your passphrase for this account to sign the message',
  //         '',
  //         promptCb,
  //         false
  //       )
  //     }
  //     promptCb()
  //   })
  }

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">
        Account
        <span ref={plusTitle} id="remixRunPlusWraper" title="Create a new account" onLoad={updatePlusButton}>
          <i ref={plusBtn} id="remixRunPlus" className="fas fa-plus-circle udapp_icon" aria-hidden="true" onClick={newAccount}></i>
        </span>
      </label>
      <div className="udapp_account">
        <select id="txorigin" data-id="runTabSelectAccount" name="txorigin" className="form-control udapp_select custom-select pr-4" value={selectedAccount} onChange={(e) => { setSelectedAccount(e.target.value) }}>
          {
            Object.keys(props.accounts.loadedAccounts).map((value) => <option value={value}>{ value }</option>)
          }
        </select>
        <div style={{ marginLeft: -5 }}><CopyToClipboard content={selectedAccount} direction='top' /></div>
        <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" className="mx-1 fas fa-edit udapp_icon" aria-hidden="true" onClick={signMessage} title="Sign a message using this account key"></i>
      </div>
    </div>
  )
}
