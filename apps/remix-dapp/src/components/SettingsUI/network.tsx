import React, { useContext } from 'react';
import { AppContext } from '../../contexts';
import { FormattedMessage } from 'react-intl';
import { setProvider } from '../../actions';

export function NetworkUI() {
  const { appState, dispatch } = useContext(AppContext);
  const { networkName, provider } = appState.settings;
  return (
    <div className="">
      <label>
        <FormattedMessage id="udapp.environment" />
      </label>
      <div className="d-flex align-items-center">
        <select
          id="txorigin"
          data-id="runTabSelectAccount"
          name="txorigin"
          value={provider}
          className="form-control overflow-hidden w-100 font-weight-normal custom-select pr-4"
          onChange={(e) => {
            dispatch({
              type: 'SET_SETTINGS',
              payload: { provider: e.target.value },
            });
            setProvider({ provider: e.target.value, networkName });
          }}
        >
          <option value={'metamask'} key={'metamask'}>
            MetaMask
          </option>
          <option value={'walletconnect'} key={'walletconnect'}>
            WalletConnect
          </option>
        </select>
      </div>
      <div className="position-relative w-100" data-id="settingsNetworkEnv">
        <span className="badge badge-secondary">{networkName}</span>
      </div>
      {provider === 'walletconnect' && (
        <div className="mt-2">
          {/* <w3m-button /> */}
        </div>
      )}
    </div>
  );
}
