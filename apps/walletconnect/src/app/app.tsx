import '../css/app.css'
import '@fortawesome/fontawesome-free/css/all.css'
import {WalletConnectRemixClient} from '../services/WalletConnectRemixClient'
import {WalletConnectUI} from './walletConnectUI'

const remix = new WalletConnectRemixClient()
remix.initClient()

function App() {
  return (
    <div className="App">
      <h4 className="mt-1">WalletConnect</h4>
      <WalletConnectUI />
    </div>
  )
}

export default App
