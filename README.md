# remix
Ethereum IDE and tools for the web

INSTALLATION:

Brief instructions to build for linux(Todo add other platforms) we will add detailed instructions later
- co the project
- cd remix
- install npm and node.js see https://docs.npmjs.com/getting-started/installing-node
- sudo npm run install
- sudo npm run build
- run the eth node:  ./eth --rpccorsdomain "*" -j -v 0 or if you have build sudo run start_node
- open remix/index.html

CODING STYLE:

Remix uses npm coding style: https://docs.npmjs.com/misc/coding-style
Please be sure your code is compliant with this coding standard before sending PR.
There's on the above page a bunch of links that propose integration with developer tools (Emacs, Atom, ...).
You can also run 'npm run test' to check your local repository against the coding style.
