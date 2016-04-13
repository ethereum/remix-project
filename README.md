# remix
Ethereum IDE and tools for the web

Brief instructions to build for linux(Todo add other platforms) we will add detailed instructions later
1. co the project
2. cd remix
3. mkdir build
4. install npm and node.js see https://docs.npmjs.com/getting-started/installing-node
5. sudo npm update
6. sudo npm install web3
7. run the eth node:  ./eth --rpccorsdomain "*" -j  --admin-via-http  -v 0
8. copy "JSONRPC Admin Session Key" (this is a temporary step, there is a story which will let us to skip this step) and give it as a last argument for web3.admin.vmTrace function :P
9. sudo npm run build
10. open remix/index.html
