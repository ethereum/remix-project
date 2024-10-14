import React, { useContext, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CustomTooltip, is0XPrefixed, isHexadecimal, isNumeric } from '@remix-ui/helper';
import { AppContext } from '../../contexts';
import './index.css';
import { runTransactions } from '../../actions';

export interface FuncABI {
  name: string;
  type: string;
  inputs: { name: string; type: string }[];
  stateMutability: string;
  payable?: boolean;
  constant?: any;
}

export function LowLevelInteractions(props: any) {
  const { appState } = useContext(AppContext);
  const { instance, settings } = appState;

  const address = instance.address;
  const contractABI = instance.abi;
  const intl = useIntl();
  const [llIError, setLlIError] = useState<string>('');
  const [calldataValue, setCalldataValue] = useState<string>('');

  const sendData = () => {
    setLlIError('');
    const fallback = instance.fallback;
    const receive = instance.receive;
    const args = {
      funcABI: fallback || receive,
      address,
      contractName: instance.name,
      contractABI,
    };
    const amount = settings.sendValue;

    if (amount !== '0') {
      // check for numeric and receive/fallback
      if (!isNumeric(amount)) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError1' }));
        return;
      } else if (
        !receive &&
        !(fallback && fallback.stateMutability === 'payable')
      ) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError2' }));
        return;
      }
    }
    let calldata = calldataValue;

    if (calldata) {
      if (calldata.length < 4 && is0XPrefixed(calldata)) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError3' }));
        return;
      } else {
        if (is0XPrefixed(calldata)) {
          calldata = calldata.substr(2, calldata.length);
        }
        if (!isHexadecimal(calldata)) {
          setLlIError(intl.formatMessage({ id: 'udapp.llIError4' }));
          return;
        }
      }
      if (!fallback) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError5' }));
        return;
      }
    }

    if (!receive && !fallback) {
      setLlIError(intl.formatMessage({ id: 'udapp.llIError6' }));
      return;
    }

    // we have to put the right function ABI:
    // if receive is defined and that there is no calldata => receive function is called
    // if fallback is defined => fallback function is called
    if (receive && !calldata) args.funcABI = receive;
    else if (fallback) args.funcABI = fallback;

    if (!args.funcABI) {
      setLlIError(intl.formatMessage({ id: 'udapp.llIError7' }));
      return;
    }
    runTransaction(false, args.funcABI, null, calldataValue);
  };

  const runTransaction = (
    lookupOnly: boolean,
    funcABI: FuncABI,
    valArr: { name: string; type: string }[] | null,
    inputsValues: string,
    funcIndex?: number
  ) => {
    const functionName =
      funcABI.type === 'function' ? funcABI.name : `(${funcABI.type})`;
    const logMsg = `${lookupOnly ? 'call' : 'transact'} to ${
      instance.name
    }.${functionName}`;

    runTransactions({
      lookupOnly,
      funcABI,
      inputsValues,
      name: instance.name,
      contractABI,
      address,
      logMsg,
      funcIndex,
    });
  };

  const handleCalldataChange = (e: { target: { value: any } }) => {
    const value = e.target.value;

    setCalldataValue(value);
  };

  return (
    <div
      className={`border-dark bg-light col mb-2`}
      data-shared="universalDappUiInstance"
    >
      <div data-id="universalDappUiContractActionWrapper">
        <div>
          <div className="d-flex flex-column">
            <div className="d-flex flex-row justify-content-between mt-2">
              <div className="py-2 d-flex justify-content-start flex-grow-1">
                <FormattedMessage id="udapp.lowLevelInteractions" />
              </div>
              <CustomTooltip
                placement={'bottom-end'}
                tooltipClasses="text-wrap"
                tooltipId="receiveEthDocstoolTip"
                tooltipText={<FormattedMessage id="udapp.tooltipText8" />}
              >
                {
                  // receive method added to solidity v0.6.x. use this as diff.
                  instance.solcVersion.canReceive === false ? (
                    <a
                      href={`https://solidity.readthedocs.io/en/v${instance.solcVersion.version}/contracts.html`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i
                        aria-hidden="true"
                        className="fas fa-info my-2 mr-1"
                      ></i>
                    </a>
                  ) : (
                    <a
                      href={`https://solidity.readthedocs.io/en/v${instance.solcVersion.version}/contracts.html#receive-ether-function`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i
                        aria-hidden="true"
                        className="fas fa-info my-2 mr-1"
                      ></i>
                    </a>
                  )
                }
              </CustomTooltip>
            </div>
            <div className="d-flex flex-column align-items-start">
              <label className="">CALLDATA</label>
              <div className="d-flex justify-content-end w-100 align-items-center">
                <CustomTooltip
                  placement="bottom"
                  tooltipClasses="text-nowrap"
                  tooltipId="deployAndRunLLTxCalldataInputTooltip"
                  tooltipText={<FormattedMessage id="udapp.tooltipText9" />}
                >
                  <input
                    id="deployAndRunLLTxCalldata"
                    onChange={handleCalldataChange}
                    className="form-control"
                  />
                </CustomTooltip>
                <CustomTooltip
                  placement="right"
                  tooltipClasses="text-nowrap"
                  tooltipId="deployAndRunLLTxCalldataTooltip"
                  tooltipText={<FormattedMessage id="udapp.tooltipText10" />}
                >
                  <button
                    id="deployAndRunLLTxSendTransaction"
                    data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"
                    className="btn p-0 w-50 border-warning text-warning"
                    onClick={sendData}
                    style={{ height: 32 }}
                  >
                    Transact
                  </button>
                </CustomTooltip>
              </div>
            </div>
            <div>
              <label id="deployAndRunLLTxError" className="text-danger my-2">
                {llIError}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
