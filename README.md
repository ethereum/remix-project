[![Build Status](https://travis-ci.org/ethereum/browser-solidity.svg?branch=master)](https://travis-ci.org/ethereum/browser-solidity)

# Browser-Solidity

Browser Solidity is a browser-based Solidity compiler and IDE.

Visit [https://ethereum.github.io/browser-solidity](https://ethereum.github.io/browser-solidity) to use;
it will always deliver the latest version.

## Offline Usage

Full offline usage is currently not supported because the compiler is always
loaded via http. If you clone/download the repository, use the
`gh-pages` branch (otherwise you still have to build the application).

## Building

Many dependencies are only provided via npm:

	npm install    # fetch dependencies
	npm run build  # build application into build/app.js

Now point your browser to `index.html` to open the application.

## Usage as a Chrome Extension

If you would like to use this as a Chrome extension, you must either build it first or pull from the `gh-pages` branch, both described above.
After that, follow these steps:

* Browse to `chrome://extensions/`
* Make sure 'Developer mode' has been checked
* Click 'Load unpacked extension...' to pop up a file-selection dialog
* Select your `browser-solidity` folder
