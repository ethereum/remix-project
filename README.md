[![Build Status](https://travis-ci.org/ethereum/browser-solidity.svg?branch=master)](https://travis-ci.org/ethereum/browser-solidity)

# Remix

Remix (aka. Browser-Solidity) is a browser-based Solidity compiler and IDE.

Visit [https://remix.ethereum.org](https://remix.ethereum.org) to use;
it will always deliver the latest version.

## Offline Usage

The `gh-pages` branch always has the latest stable build of Remix. It also contains a ZIP file with the entire build. Download it to use offline.

Note: it contains the latest release of Solidity available at the time of the packaging. No other compiler versions are supported.

## Building

Many dependencies are only provided via npm:

	npm install    # fetch dependencies
	npm run build  # build application into build/app.js

Now point your browser to `index.html` to open the application.

### Troubleshooting building

Here are some things to consider if you have trouble building the package.

- Make sure that you have the correct version of `node`, `npm` and `nvm`. You can find the version that is tested on Travis CI by looking at the log in the [build results](https://travis-ci.org/ethereum/browser-solidity).

Run:

	node --version
	npm --version
	nvm --version

- In Debian based OSes such as Ubuntu 14.04LTS you may need to run `apt-get install build-essential`. After installing `build-essential` run `npm rebuild`.

## Unit Testing

Register new unit test files in `test/index.js`. The tests are written using [tape](https://www.npmjs.com/package/tape). Run the tests via:

	npm test

## Browser Testing

To run the Selenium tests via Nightwatch serve the app through a local web server:

	npm run serve # starts web server at localhost:8080

Then you will need to either:

1. Have a Selenium server running locally on port 4444.
	- Run: `npm run browser-test`
2. Or, install and run SauceConnect.
	- Run: `sc -u <USERNAME> -k <ACCESS_KEY>` (see `.travis.yml` for values)
	- Run: `npm run browser-test-sc`

## Usage as a Chrome Extension

If you would like to use this as a Chrome extension, you must either build it first or pull from the `gh-pages` branch, both described above.
After that, follow these steps:

- Browse to `chrome://extensions/`
- Make sure 'Developer mode' has been checked
- Click 'Load unpacked extension...' to pop up a file-selection dialog
- Select your `browser-solidity` folder
