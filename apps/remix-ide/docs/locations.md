Finding Remix
=============

So if you've found the documentation to Remix but don't know where to find Remix or if you want to run the remix-ide locally and want to find out where to download it - this page is here to help.

- An online version is available at [https://remix.ethereum.org](https://remix.ethereum.org). This version is stable and is updated at almost every release.
- An alpha online version is available at [https://remix-alpha.ethereum.org](https://remix-alpha.ethereum.org). This is not a stable version.
- npm `remix-ide` package `npm install remix-ide -g`. `remix-ide` create a new instance of `Remix IDE` available at [http://127.0.0.1:8080](http://127.0.0.1:8080) and make the current folder available to Remix IDE by automatically starting `remixd`.
see [Connection to `remixd`](https://remix-ide.readthedocs.io/en/latest/remixd.html) for more information about sharing local file with `Remix IDE`.
- Github release: [https://github.com/ethereum/remix-ide/releases](https://github.com/ethereum/remix-ide/releases) . The source code is packaged at every release but still need to be built using `npm run build`.
