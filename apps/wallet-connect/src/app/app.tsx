import React, { useEffect, useState } from 'react'
import EthereumProvider from '@walletconnect/ethereum-provider'
import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { RemixClient } from '../services/RemixClient'
import { PROJECT_ID } from '../services/constant'
import { Web3Modal } from '@web3modal/standalone'

const remix = new RemixClient()
const web3Modal = new Web3Modal({
  projectId: PROJECT_ID,
  standaloneChains: ["eip155:1"],
  walletConnectVersion: 2
})

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [provider, setProvider] = useState<EthereumProvider>()
  const [accounts, setAccounts] = useState<string[]>([])

  useEffect(() => {
    if (!provider) {
      createClient()
    }
  }, [provider])

  const createClient = async () => {
    try {
      const provider = await EthereumProvider.init({
        projectId: PROJECT_ID,
        chains: [1],
        showQrModal: true
      })

      provider.modal = web3Modal
      setProvider(provider)
    } catch (e) {
      console.log(e)
    }
  }

  const handleConnect = async () => {
    if (!provider) throw Error("Cannot connect. Sign Client is not created")
    try {
      subscribeToEvents(provider)
      await provider.connect()
      remix.walletConnectClient = provider
    } catch (e) {
      console.log(e)
    }
  }

  const handleDisconnect = async () => {
    try {
      await provider.disconnect()
      reset()
    } catch (e) {
      console.log(e)
    }
  }

  const subscribeToEvents = (provider: EthereumProvider) => {
    if (!provider) throw Error("Provider does not exist")

    try {
      provider.on('connect', () => {
        setIsConnected(true)
      })

      provider.on('chainChanged', (args) => {
        remix.emit('chainChanged', args)
      })

      provider.on('accountsChanged', (args) => {
        remix.emit('accountsChanged', args)
      })
    } catch (e) {
      console.log(e)
    }
  }

  const reset = () => {
    setAccounts([])
    setIsConnected(false)
  }

  return (
    <div className="App">
      <div className="btn-group-vertical mt-5 w-25" role="group">
        { !isConnected && <button id="connectbtn" type="button" onClick={handleConnect} className="btn btn-primary">Connect to a wallet</button> }
        { isConnected && <button id="disconnectbtn" type="button" onClick={handleDisconnect} className="btn btn-primary mt-2">Disconnect</button> }
      </div>
      <div id='accounts-container'>
        { accounts.length > 0 &&
          <div>
            <label><b>Accounts: </b></label><br></br>
            <ul className="list-group list-group-flush" id="accounts">
              { accounts.map((account, index) => <li key={index}>{ account }</li>) }
            </ul>
          </div>
        }
        {/* <div><label><b>Network: </b></label><label className="ml-1" id="chain"> - </label></div> */}
      </div>
    </div>
  )
}

export default App
