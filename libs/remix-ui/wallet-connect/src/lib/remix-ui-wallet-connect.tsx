import './remix-ui-wallet-connect.module.css';
import React, { useState } from 'react' // eslint-disable-line
export const INFURA_ID_KEY = 'INFURA_ID_KEY'

/* eslint-disable-next-line */
export interface RemixUiWalletConnectProps {
  provider: any,
  onConnect: (infuraId: string) => Promise<void>
  onDisconnect: () => Promise<void>
}

export interface RemixUiWalletConnectState {
  accounts: Array<string>
  chain: string | number
  connected: boolean
}

export function RemixUiWalletConnect(props: RemixUiWalletConnectProps) {
  const [infuraId, setinfuraId] = useLocalStorage(
    INFURA_ID_KEY,
    ''
  );

  const [state, setState] = useState<RemixUiWalletConnectState>({
    accounts: [],
    chain: ' - ',
    connected: false
  })

  const openModal = () => {
    props.onConnect(infuraId)
  }

  const disconnect = () => {
    props.onDisconnect()
  }

  props.provider.on('accountsChanged', (accounts: Array<string>) => {    
    setState(prevState => {
      return { ...prevState, accounts }
    })
  })

  props.provider.on('chainChanged', (chain: number) => {
    setState(prevState => {
      return { ...prevState, chain, connected: true }
    })    
  })

  props.provider.on('disconnect', () => {
    setState(prevState => {
      return { ...prevState, accounts: [], chain: ' - ', connected: false }
    })    
  })
  return (
    <div className="App">
      <div className="btn-group-vertical mt-5 w-25" role="group">
        <div className="text-center w-100">
          <i className="fas fa-info-circle mr-2 bg-light" title="Wallet connect requires an Infura ID in order to make a request to the network."/><a target="_blank" href="https://infura.io/dashboard/ethereum">INFURA settings</a>
          <input value={infuraId} onChange={(e) => { setinfuraId(e.target.value)}} id="input-infura-id" placeholder="Please provide an Infura ID" className="form-control mt-2 mb-2"></input>        
          {!state.connected && <button disabled={!infuraId} id="connectbtn" type="button" onClick={openModal} className="btn btn-primary w-100">Connect to a wallet</button>}
          {state.connected && <button id="disconnectbtn" type="button" onClick={disconnect} className="btn btn-primary mt-2 w-100">Disconnect</button>}
        </div>
      </div>
      <div id='accounts-container'>
        <div><label><b>Accounts: </b></label><br></br><ul className="list-group list-group-flush" id="accounts">
          {state && state.accounts.map((account: any) => <li className="list-group-item">${account}</li>)}
          </ul></div>
        <div><label><b>Network: </b></label><label className="ml-1" id="chain">{state.chain}</label></div>
      </div>
    </div>
  );
}

export const detectNetwork = (id: string) => {
  let networkName = ''
  const numberId = parseInt(id)
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
  if (numberId === 1) networkName = "Main"
  else if (numberId === 2) networkName = "Morden (deprecated)"
  else if (numberId === 3) networkName = "Ropsten"
  else if (numberId === 4) networkName = "Rinkeby"
  else if (numberId === 5) networkName = "Goerli"
  else if (numberId === 42) networkName = "Kovan"
  else networkName = "Custom"
  return networkName
}

export const useLocalStorage = (key: string, initialValue: string) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue

      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case

    }
  };
  return [storedValue, setValue];
}

export default RemixUiWalletConnect;
