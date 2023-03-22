import React from 'react'
import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { PROJECT_ID } from '../services/constant'
import { EthereumClient } from '@web3modal/ethereum'
import { Web3Button, Web3Modal } from '@web3modal/react'
import { WagmiConfig } from 'wagmi'
import { RemixClient } from '../services/RemixClient'

const p = new RemixClient()
const ethereumClient = new EthereumClient(p.wagmiClient, p.chains)

function App() {
  const openModal = () => {
    p.onConnect()
  }

  const disconnect = () => {
    p.onDisconnect()
  }

  const showButtons = (connected = true) => {
    document.getElementById("disconnectbtn").style.display = document.getElementById("accounts-container").style.display = connected? 'block':'none'
    document.getElementById("connectbtn").style.display =  connected? 'none':'block'
  }

  p.internalEvents.on('accountsChanged', (accounts) => {
    document.getElementById('accounts').innerHTML = ""
    for(const account of accounts){
      document.getElementById('accounts').innerHTML += `<li className="list-group-item">${account}</li>`
    }
  })

  p.internalEvents.on('chainChanged', (chain) => {
    document.getElementById('chain').innerHTML = chain
    showButtons(true)
  })

  p.internalEvents.on('disconnect', (chain) => {
    document.getElementById('accounts').innerHTML = ''
    document.getElementById('chain').innerHTML = ''
    showButtons(false)
  })

  return (
    <div className="App">
      <div className="btn-group-vertical mt-5 w-25" role="group">
        <div className="text-center w-100">
          <i className="fas fa-info-circle mr-2 bg-light" title="Wallet connect reuire an infura id in order to make request to the network."/><a target="_blank" href="https://infura.io/dashboard/ethereum">Walletconnect cloud settings</a>
          <input onChange={(e) => {}} id="walletconnect-project-id" placeholder="Project Id" className="mt-2 mb-2 ml-2"></input>          
        </div>
        <button id="connectbtn" type="button" onClick={openModal} className="btn btn-primary">Connect to a wallet</button>
        <button id="disconnectbtn" type="button" onClick={disconnect} className="btn btn-primary mt-2">Disconnect</button>
      </div>
      <div id='accounts-container'>
        <div><label><b>Accounts: </b></label><br></br><ul className="list-group list-group-flush" id="accounts"></ul></div>
        <div><label><b>Network: </b></label><label className="ml-1" id="chain"> - </label></div>
      </div>
      { p.wagmiClient && 
        <WagmiConfig client={p.wagmiClient}>
          <Web3Button />
        </WagmiConfig>
      }

      { ethereumClient && <Web3Modal projectId={PROJECT_ID} ethereumClient={ethereumClient} /> }
    </div>
  )
}

export default App
