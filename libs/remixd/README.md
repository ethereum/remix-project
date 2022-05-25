# Remixd

`remixd` is a tool that intend to be used with [Remix IDE](https://github.com/ethereum/remix-project) (aka. Browser-Solidity). It allows a websocket connection between
`Remix IDE` (web application) and the local computer.

Practically Remix IDE makes available a folder shared by `remixd`.

More details are explained in this [tutorial](https://remix-ide.readthedocs.io/en/latest/remixd.html).

Alternatively `remixd` can be used to setup a development environment that can be used with other popular frameworks like Embark, Truffle, Ganache, etc..

`remixd` needs `npm` and `node`

## INSTALLATION

`yarn global add @remix-project/remixd`

### Warning for old users
There is a new version of remixd with a new npm address: https://npmjs.com/package/@remix-project/remixd
If you were using the old one you need to:

  1. uninstall the old one: `npm uninstall -g remixd`
  2. install the new: `yarn global add @remix-project/remixd`


## HELP SECTION

```
Usage: remixd -s <shared folder>

Provide a two-way connection between the local computer and Remix IDE

Options:
  -v, --version               output the version number
  -u, --remix-ide  <url>      URL of remix instance allowed to connect to this web sockect connection
  -s, --shared-folder <path>  Folder to share with Remix IDE
  -r, --read-only             Treat shared folder as read-only (experimental)
  -h, --help                  output usage information

Example:

    remixd -s ./ -u http://localhost:8080

```

## SHARE A FOLDER

`remixd -s <absolute-path> --remix-ide https://remix.ethereum.org`

The current user should have `read/write` access to the folder (at least `read` access).

It is important to notice that changes made to the current file in `Remix IDE` are automatically saved to the local computer every 5000 ms. There is no `Save` action. But the `Ctrl-Z` (undo) can be used.

Furthermore :
 - No copy of the shared folder are kept in the browser storage.
 - It is not possible to create a file from `Remix IDE` (that might change).
 - If a folder does not contain any file, the folder will not be displayed in the explorer (that might change).
 - Symbolic links are not forwarded to Remix IDE.
 
