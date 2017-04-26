var yo = require('yo-yo')

module.exports = contractTab

function contractTab () {
  return yo`
    <div id="envView">
      <div class="crow">
        <label for="txorigin">Transaction origin:<select name="txorigin" id="txorigin"></select></label>
      </div>
      <div class="crow">
        <label for="gasLimit"><input type="number" id="gasLimit" value="3000000"> Transaction gas limit</label>
      </div>
      <div class="crow hide">
        <label for="gasPrice"><input type="number" id="gasPrice" value="0"> Gas Price</label>
      </div>
      <div class="crow">
        <label for="value"><input type="text" id="value" value="0"> Value (e.g. .7 ether or 5 wei, defaults to ether)</label>
      </div>
      <span id="executionContext">
        Select execution environment: <br><br>
        <select id='selectExEnv'>
          <option id="vm-mode"
            title="Execution environment does not connect to any node, everything is local and in memory only."
            value="vm"
            checked name="executionContext">
            JavaScript VM
          </option>
          <option id="injected-mode"
            title="Execution environment has been provided by Mist or similar provider."
            value="injected"
            checked name="executionContext">
            Injected Web3
          </option>
          <option id="web3-mode"
            title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
            If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
            value="web3"
            name="executionContext">
            Web3 Provider
          </option>
        </select>
      </span>
      <div id="output"></div>
    </div>
  `
}
