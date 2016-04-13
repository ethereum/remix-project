# remix
Ethereum IDE and tools for the web

Brief instructions to build for linux(Todo add other platforms) we will add detailed instructions later
- co the project
- cd remix
- install npm and node.js see https://docs.npmjs.com/getting-started/installing-node
- sudo npm run install
- sudo npm run build
- run the eth node:  ./eth --rpccorsdomain "*" -j  --admin-via-http  -v 0 or if you have build sudo run start_node
- copy "JSONRPC Admin Session Key" (this is a temporary step, there is a story which will let us to skip this step) and give it as a last argument for web3.admin.vmTrace function :P
- open remix/index.html
