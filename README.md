# Remixd

Remixd is a tool that intend to be used with [Remix IDE](http://github.com/ethereum/browser-solidity) (aka. Browser-Solidity). It allows a websocket connection between
`Remix IDE` (web application) and the local computer.

Practically Remix IDE make available a folder shared by Remixd.

More details are explained in this [tutorial](http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html).

Alternatively Remixd can be used to setup a developement environment that can be used with other popular frameworks like Embark, Truffle, Ganache, etc..

Remixd needs `npm` and `node`

## INSTALLATION

`npm install -g remixd`

## HELP SECTION

```
  Usage: remixd -s <shared folder>

  Provide a two ways connection between the local computer and Remix IDE.
  

  Options:

    -s, --shared-folder <path>            Folder to share with Remix IDE
    -m, --mist                            start mist
    -g, --geth                            start geth
    -p, --dev-path <dev-path>             Folder used by mist/geth to start the development instance
    -f, --frontend <front-end>            Folder that should be served by remixd
    -p, --frontend-port <front-end-port>  Http port used by the frontend (default 8082)
    -a, --auto-mine                       mine pending transactions
    -r, --rpc <cors-domains>              start rpc server. Values are CORS domain
    -rp, --rpc-port                       rpc server port (default 8545)
    -h, --help                            output usage information

```

## SHARE A FOLDER

`remixd -S <absolute-path>`

The current user should have `read/write` access to the folder (at least `read` access).

It is important to notice that changes made to the current file in `Remix IDE` are automatically saved to the local computer every 5000 ms. There is no `Save` action. But the `Ctrl-Z` (undo) can be used.

Furthermore :
 - No copy of the shared folder are kept in the browser storage.
 - It is not possible to create a file from `Remix IDE` (that might change).
 - If a folder does not contain any file, the folder will not be displayed in the explorer (that might change).
 - Symbolic links are not forwarded to Remix IDE.
 
## START GETH, MIST and setup a developement environment

Remix allows to start a dev environment. `Geth` is used to spawn a dev blockchain and `Mist` to provide an user interface to interact with dapps in developement and Remix IDE (It is also possible to use `Metamask` and a normal browser)

`Mist` and `Geth` are not shipped with Remixd.

Download `Mist` at https://github.com/ethereum/mist/releases

Downloaf `Geth` at https://ethereum.github.io/go-ethereum/downloads


Usage:

`remixd --dev-path /home/devchains/chain1 --mist --geth --frontend /home/frontend --frontend-port 8084 --auto-mine`
 
 - start `geth`.
 - start `mist`.
 - create a new data folder (`dev-path` option) if it doesn't exist containing blockchain data and keys.
 - serve a local folder through an http server (`frontend` and `frontend-port` option). 
 This option may be used if you want to browse your dapp using `Mist` or a normal browser and `Metamask` (see third example) (https://metamask.io). In this example the web application located at `/home/frontend` will be available at http://127.0.0.1:8084
 - start to mine automatically when new transactions are created.
 
---
 
 `remixd -s /home/user/project1/contracts`
 
 - allow accessing the local folder from Remix IDE (http://remix.ethereum.org)
  
---
   
  `remixd --dev-path /home/devchains/chain1 --rpc --rpc-port 8545 --geth --frontend /home/frontend --frontend-port 8084 --auto-mine`
  
 - do the same as the first example but do not start `Mist`. 
  It is still possible to browse a front end app using a normal browser and `Metamask`. The connection between Metamask and `geth` has to be dome via rpc connection and thus the rpc server has to be enabled (`rpc` and `rpc-port` options).
  
  Note that in that case Remix IDE (remix.ethereum.org) does not need Metamask. It is possible to use the `Web3 Provider` option of Remix to connect to the `Geth` RPC endpoints.
  
