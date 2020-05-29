[![CircleCI](https://circleci.com/gh/ethereum/remix-ide.svg?style=svg)](https://circleci.com/gh/ethereum/remix-ide)

# Remix

Remix is a browser-based compiler and IDE that enables users to build **Ethereum contracts with Solidity language** and to debug transactions.

To try it out, visit [https://remix.ethereum.org](https://remix.ethereum.org).

https://github.com/ethereum/remix-ide/releases also gives others ways to use Remix locally. Please check it out.

Remix consists of many modules and in this repository you will find the Remix IDE (aka. Browser-Solidity).

![Remix screenshot](https://github.com/ethereum/remix-ide/raw/master/remix_screenshot.png)

## Offline Usage

The `gh-pages` branch has always the latest stable build of Remix. It also contains a ZIP file with the entire build. Download it to use offline.

Note: It contains the latest release of Solidity available at the time of the packaging. No other compiler versions are supported.


## INSTALLATION:

Install **npm** and **node.js** (see https://docs.npmjs.com/getting-started/installing-node), then do:

Remix-ide has been published as an npm module:

```bash
npm install remix-ide -g
remix-ide
```
Or if you want to clone the github repository (`wget` need to be installed first) :

```bash
git clone https://github.com/ethereum/remix-ide.git
git clone https://github.com/ethereum/remix.git # only if you plan to link remix and remix-ide repositories and develop on it.

cd remix  # only if you plan to link remix and remix-ide repositories and develop on it.
npm install  # only if you plan to link remix and remix-ide repositories and develop on it.
npm run bootstrap  # only if you plan to link remix and remix-ide repositories and develop on it.

cd remix-ide
npm install
npm run setupremix  # only if you plan to link remix and remix-ide repositories and develop on it.
npm start
```

## DEVELOPING:

Run `npm start` and open `http://127.0.0.1:8080` in your browser.

Then open your `text editor` and start developing.
The browser will automatically refresh when files are saved.

Most of the the time working with other modules (like debugger etc.) hosted in the [Remix repository](https://github.com/ethereum/remix) is not needed.

### Troubleshooting building

Some things to consider if you have trouble building the package:

- Make sure that you have the correct version of `node`, `npm` and `nvm`. You can find the version that is tested on Travis CI by looking at the log in the [build results](https://travis-ci.org/ethereum/remix-ide).

Run:

```bash
node --version
npm --version
nvm --version
```

- In Debian based OS such as Ubuntu 14.04LTS you may need to run `apt-get install build-essential`. After installing `build-essential` run `npm rebuild`.

## Unit Testing

Register new unit test files in `test/index.js`.
The tests are written using [tape](https://www.npmjs.com/package/tape).

Run the unit tests via: `npm test`

For local headless browser tests run `npm run test-browser`
(requires Selenium to be installed - can be done with `npm run selenium-install`)

Running unit tests via `npm test` requires at least node v7.0.0

## Browser Testing

To run the Selenium tests via Nightwatch:

 - Build Remix IDE and serve it: `npm run build && npm run serve` # starts web server at localhost:8080
 - Make sure Selenium is installed `npm run selenium-install` # don't need to repeat
 - Run a selenium server `npm run selenium`
 - Run all the tests `npm run nightwatch_local_firefox` or `npm run nightwatch_local_chrome`
 - Or run a specific test case: 
 
		- npm run nightwatch_local_ballot
		
		- npm run nightwatch_local_libraryDeployment
		
		- npm run nightwatch_local_solidityImport
		
		- npm run nightwatch_local_recorder
		
		- npm run nightwatch_local_transactionExecution
		
		- npm run nightwatch_local_staticAnalysis
		
		- npm run nightwatch_local_signingMessage

		- npm run nightwatch_local_console
		
		- npm run nightwatch_local_remixd # remixd needs to be run
**NOTE:**

- **the `ballot` tests suite** requires to run `ganache-cli` locally.

- **the `remixd` tests suite** requires to run `remixd` locally.

- **the `gist` tests suite** requires specifying a github access token in **.env file**. 
```
    gist_token = <token>
```
**note that this token should have permission to create a gist.**


## Usage as a Chrome Extension

If you would like to use this as a Chrome extension, you must either build it first or pull from the `gh-pages` branch, both described above.
After that, follow these steps:

- Browse to `chrome://extensions/`
- Make sure 'Developer mode' has been checked
- Click 'Load unpacked extension...' to pop up a file-selection dialog
- Select your `remix-ide` folder

## Documentation

To see details about how to use Remix for developing and/or debugging Solidity contracts, please see [our documentation page](https://remix-ide.readthedocs.io/en/latest/)
