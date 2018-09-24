Packages
========

This part focuses on using `Remix IDE`, which is a browser based smart contract IDE. We will basically answer the question: 
Where can I use / download `Remix IDE`, and what is the difference between packages?

- An online version is available at [https://remix.ethereum.org](https://remix.ethereum.org). This version is stable and is updated at almost every release.
- An alpha online version is available at [https://remix-alpha.ethereum.org](https://remix-alpha.ethereum.org). This is not a stable version.
- npm `remix-ide` package `npm install remix-ide -g`. `remix-ide` create a new instance of `Remix IDE` available at [http://127.0.0.1:8080](http://127.0.0.1:8080) and make the current folder available to Remix IDE by automatically starting `remixd`.
see [Connection to `remixd`](http://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html) for more information about sharing local file with `Remix IDE`.
- Github release: [https://github.com/ethereum/remix-ide/releases](https://github.com/ethereum/remix-ide/releases) . The source code is packaged at every release but still need to be built using `npm run build`.
- Mist: `Remix IDE` can be started and use the local geth node from `Mist` [https://github.com/ethereum/mist/releases](https://github.com/ethereum/mist/releases)
- Electron: `Remix IDE` wrapped as an Electron app is available at [https://github.com/horizon-games/remix-app](https://github.com/horizon-games/remix-app)