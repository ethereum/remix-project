import React from 'react';
import './App.css';
import { RemixClient } from './RemixClient'
const p = new RemixClient()
function App() {

  const openModal = () => {
    p.onConnect()
  }

  const disconnect = () => {
    p.onDisconnect()
  }

  const showButtons = (connected = true) =>{
    document.getElementById("disconnectbtn").style.display = document.getElementById("accounts-container").style.display = connected? 'block':'none';
    document.getElementById("connectbtn").style.display =  connected? 'none':'block';
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
        <button id="connectbtn" type="button" onClick={openModal} className="btn btn-primary">Connect to a wallet</button>
        <button id="disconnectbtn" type="button" onClick={disconnect} className="btn btn-primary mt-2">Disconnect</button>
      </div>
      <div id='accounts-container'>
        <div><label><b>Accounts: </b></label><br></br><ul className="list-group list-group-flush" id="accounts"></ul></div>
        <div><label><b>Network: </b></label><label className="ml-1" id="chain"> - </label></div>
      </div>
    </div>
  );
}

export default App;
