// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CopyToClipboard } from '@remix-ui/clipboard'
import { AccountProps } from '../types'
import { PassphrasePrompt } from './passphrase'
import { CustomTooltip } from '@remix-ui/helper'
import Select, { components } from 'react-select'

export function AccountUI(props: AccountProps) {
  const { selectedAccount, loadedAccounts } = props.accounts
  const { selectExEnv, personalMode } = props
  const accounts = Object.keys(loadedAccounts)
  const [plusOpt, setPlusOpt] = useState({
    classList: '',
    title: ''
  })
  const messageRef = useRef('')

  const intl = useIntl()

  useEffect(() => {
    if (accounts.length > 0 && !accounts.includes(selectedAccount)) {
      props.setAccount(accounts[0])
    }
  }, [accounts, selectedAccount])

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
  }, [selectExEnv, personalMode])

  const newAccount = () => {
    props.createNewBlockchainAccount(passphraseCreationPrompt())
  }

  const signMessage = () => {
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
            intl.formatMessage({ id: 'udapp.ok' }),
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
      intl.formatMessage({ id: 'udapp.ok' }),
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
          className="bg-light text-light"
          data-id="signMessageTextarea"
          style={{ width: '100%' }}
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

  const customStyles = {
    container: provided => ({
      ...provided,
      width: '100%',
      height: '100%',
    }),
    control: (provided, state) => ({
      ...provided,
      color: 'inherit',
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: state.isFocused ? '5px 5px rgba(0, 0, 0, 0.075), 0 0 5px rgba(39, 198, 255, 0.5)' : 'none',
      transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: 'var(--custom-select)',
      zIndex: 1000,
      border: '1.5px solid var(--custom-select) !important',
      borderRadius: 4,
    }),
    option: (provided, state) => ({
      ...provided,
      borderRadius: 4,
      color: state.isFocused ? 'white' : 'inherit',
      fontSize: 'inherit',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: state.isFocused ? '#787474' : state.isSelected && '#787474',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'inherit', // Use inherited color for single value
    }),
    dropdownIndicator: provided => ({
      ...provided,
      display: 'none', // Hide the indicator defaulty present on remix
    }),
    indicatorSeparator: provided => ({
      ...provided,
      display: 'none', // Hide the indicator defaulty present on remix
    }),
    menuList: provided => ({
      ...provided,
      padding: 0,
    }),
  };

  const handleChange = selectedOption => {
    props.setAccount(selectedOption.value)
  };

  // custom option which will show address (shorted) and copy to clipboard button
  const CustomOption = (props) => (
    <components.Option {...props}>
      <div className='custom-select-option' data-value={props.data.value}
        style={{ display: 'flex', justifyContent: 'space-between', width: "100%" }}>
        <span>{props.data.label}</span>
        <span>
          <CopyToClipboard className="fas fa-copy ml-2 p-0" tip={intl.formatMessage({ id: 'udapp.copyAccount' })} content={props.data.value} direction="top" />
        </span>
      </div>
    </components.Option>
  );

  const options = Object.keys(loadedAccounts).map(account => ({
    value: account,
    label: loadedAccounts[account],
  }));

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">
        <FormattedMessage id="udapp.account" />
        <CustomTooltip placement={'top'} tooltipClasses="text-wrap" tooltipId="remixPlusWrapperTooltip" tooltipText={plusOpt.title}>
          <span id="remixRunPlusWraper">
            <i id="remixRunPlus" className={`ml-2 fas fa-plus-circle udapp_icon ${plusOpt.classList}`} aria-hidden="true" onClick={newAccount}></i>
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
      <div id='my-select-outer-container' className='udapp_account'>
        <Select
          options={options}
          onChange={handleChange}
          className='custom-select form-control'
          styles={customStyles}
          isSearchable={false}
          components={{ Option: CustomOption }}// in react-select most styles are changed using this
          value={{ value: selectedAccount, label: loadedAccounts[selectedAccount] }}
        />
      </div>
    </div>
  )
}
