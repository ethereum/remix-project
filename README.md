# remix
Ethereum IDE and tools for the web

INSTALLATION:

Brief instructions to build for linux(Todo add other platforms) we will add detailed instructions later

Install eth or geth, npm and node.js (see https://docs.npmjs.com/getting-started/installing-node), then do:

    git clone https://github.com/ethereum/remix
    cd remix
    npm install && npm run build && npm run start_node

open remix/index.html in your browser.

CODING STYLE:

Remix uses npm coding style: https://docs.npmjs.com/misc/coding-style
Please be sure your code is compliant with this coding standard before sending PR.
There's on the above page a bunch of links that propose integration with developer tools (Emacs, Atom, ...).
You can also run 'npm run test' to check your local repository against the coding style.

REMIX WEBSITE:

Remix is avalaible at https://ethereum.github.io/remix
You'll have to run your own node using the following parameters:
geth --rpc --rpcapi 'web3,eth,debug' --rpcport 8545 --rpccorsdomain '*'
geth will run the rpc server on http://localhost:8545, remix uses this url by default to connect to web3.





