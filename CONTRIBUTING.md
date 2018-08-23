# Contributing

Everyone is very welcome to contribute on the codebase of Remix. Please reach us in [Gitter](https://gitter.im/ethereum/remix)!

The easiest way to work on `remix-debugger` or `remix-solidity` is to pull the `remix-ide` (Remix IDE) repository (https://github.com/ethereum/remix-ide) which has a strong Remix integration. Then, in `remix-ide`, execute `npm install`, `npm run pullremix`, `npm run linkremixsolidity`. 
then `npm run build && npm run serve` to start a new Remix IDE instance (you can see it in the browser at `127.0.0.1:8080`).

To interact with the Remix code:

1. For static analysis: compile a new contact, click on the `Analysis`. The content of this tab is provided by the `remix-solidity/analysis` library.

2. For Debugging: compile a new contact, deploy it (`Create` button in the `run` tab), and then in the remix IDE terminal a transaction should appear, click on `Debug`. The Debugger tab get the focus, the content if this tab is provided by the `remix-debugger` library.

3. For Decoding local and state variables: follow 2), then expand (is not already) the `Solidity State` and `Solidity Locals` panels, the content of thoses panel are provided by the `remix-solidity/decoder` library.

**Reminder**: the Remix repository contains tools used to debug transactions, one of these tools being a debugger. The [`remix-ide` repository](https://github.com/ethereum/remix-ide) contains the Remix IDE (online version remix.ethereum.org), which make use of the Remix repository for the debugging features.

## Coding style

Remix makes use of the `npm` [coding style](https://docs.npmjs.com/misc/coding-style). Please make sure your code is compliant with this coding standard before sending a PR. You'll find in the link above tools to integrate this coding style with multiple developer tools (Emacs, Atom...). You can also make use of the `npm run test` which will check your local repository against the coding style.


