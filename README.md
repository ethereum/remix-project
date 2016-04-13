# remix
Ethereum IDE and tools for the web

Brief instructions to build for linux(Todo add other platforms) we will add detailed instructions later
- co the project
- cd remix
- mkdir build
- install npm and node.js see https://docs.npmjs.com/getting-started/installing-node
- sudo npm update
- sudo npm install web3
- run the eth node:  ./eth --rpccorsdomain "*" -j  --admin-via-http  -v 0
- copy "JSONRPC Admin Session Key" (this is a temporary step, there is a story which will let us to skip this step) and give it as a last argument for web3.admin.vmTrace function :P
- sudo npm run build
- open remix/index.html
