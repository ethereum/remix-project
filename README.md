[![CircleCI](https://circleci.com/gh/ethereum/remix-project.svg?style=svg)](https://circleci.com/gh/ethereum/remix-project)
[![Documentation Status](https://readthedocs.org/projects/docs/badge/?version=latest)](https://remix-ide.readthedocs.io/en/latest/index.html)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ethereum/remix-project/blob/master/CONTRIBUTING.md)
![GitHub contributors](https://img.shields.io/github/contributors/ethereum/remix-project)
[![Awesome Remix](https://img.shields.io/badge/Awesome--Remix-resources-green)](https://github.com/ethereum/awesome-remix)
![GitHub](https://img.shields.io/github/license/ethereum/remix-project)
[![Join the chat at https://gitter.im/ethereum/remix](https://badges.gitter.im/ethereum/remix.svg)](https://gitter.im/ethereum/remix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Twitter Follow](https://img.shields.io/twitter/follow/ethereumremix?style=social)](https://twitter.com/ethereumremix)

# Remix Project

**Remix Project** is a platform for development tools that use a plugin architecture. It encompasses sub-projects including Remix Plugin Engine, Remix Libraries, and of course Remix IDE.

**Remix IDE** is an open source web and desktop application. It fosters a fast development cycle and has a rich set of plugins with intuitive GUIs. Remix is used for the **entire journey of contract development with [Solidity language](https://soliditylang.org/)** as well as a playground for learning and teaching [Ethereum](https://ethereum.org/).

Start developing using Remix on browser, visit: [https://remix.ethereum.org](https://remix.ethereum.org)

For desktop version, see releases: [https://github.com/ethereum/remix-desktop/releases](https://github.com/ethereum/remix-desktop/releases)

![Remix screenshot](https://github.com/ethereum/remix-project/raw/master/apps/remix-ide/remix_screenshot.png)

:point_right: **Remix libraries** work as a core of native plugins of Remix IDE. Read more about libraries [here](libs/README.md)

## Offline Usage

The `gh-pages` branch of [remix-live](https://github.com/ethereum/remix-live) always has the latest stable build of Remix. It contains a ZIP file with the entire build. Download it to use offline.

Note: It contains the latest supported version of Solidity available at the time of the packaging. Other compiler versions can be used online only.


## Setup

* Install **NPM** and **Node.js**. See [Guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) <br/>
*Supported versions:*
```bash
"engines": {
    "node": "^14.17.6",
    "npm": "^6.14.15"
  }
```
* Install [Nx CLI](https://nx.dev/react/cli/overview) globally to enable running **nx executable commands**.
```bash
npm install -g @nrwl/cli
```
* Clone the github repository (`wget` need to be installed first):

```bash
git clone https://github.com/ethereum/remix-project.git
```
* Build `remix-project`:
```bash
cd remix-project
npm install
npm run build:libs // Build remix libs
nx build
nx serve
```

Open `http://127.0.0.1:8080` in your browser to load Remix IDE locally.

Go to your `text editor` and start developing. Browser will automatically refresh when files are saved.

## Production Build
To generate react production builds for remix-project.
```bash
npm run build:production
```
Build can be found in `remix-project/dist/apps/remix-ide` directory.

```bash
npm run serve:production
```
Production build will be served by default to `http://localhost:8080/` or `http://127.0.0.1:8080/`

## Docker:

Prerequisites: 
* Docker (https://docs.docker.com/desktop/)
* Docker Compose (https://docs.docker.com/compose/install/)

### Run with docker

If you want to run latest changes that are merged into master branch then run:

```
docker pull remixproject/remix-ide:latest
docker run -p 8080:80 remixproject/remix-ide:latest
```

If you want to run latest remix-live release run.
```
docker pull remixproject/remix-ide:remix_live
docker run -p 8080:80 remixproject/remix-ide:remix_live
```

### Run with docker-compose:

To run locally without building you only need docker-compose.yaml file and you can run:

```
docker-compose pull
docker-compose up -d
```

Then go to http://localhost:8080 and you can use you Remix instance.

To fetch docker-compose file without cloning this repo run:
```
curl https://raw.githubusercontent.com/ethereum/remix-project/master/docker-compose.yaml > docker-compose.yaml
```

### Troubleshooting

If you have trouble building the project, make sure that you have the correct version of `node`, `npm` and `nvm`. Also ensure [Nx CLI](https://nx.dev/react/cli/overview) is installed globally.

Run:

```bash
node --version
npm --version
nvm --version
```

In Debian based OS such as Ubuntu 14.04LTS you may need to run `apt-get install build-essential`. After installing `build-essential`, run `npm rebuild`.

## Unit Testing

Run the unit tests using library name like: `nx test <project-name>`

For example, to run unit tests of `remix-analyzer`, use `nx test remix-analyzer`

## Browser Testing

To run the Selenium tests via Nightwatch:

 - Install Selenium for first time: `npm run selenium-install`
 - Run a selenium server: `npm run selenium`
 - Build & Serve Remix: `nx serve`
 - Run all the end-to-end tests:

    for Firefox: `npm run nightwatch_local_firefox`, or 

    for Google Chrome: `npm run nightwatch_local_chrome`
 - Run a specific test case instead, use a command like this: 
 
		- npm run nightwatch_local_ballot
		
	The package.json file contains a list of all the tests you can run.
        
**NOTE:**

- **The `ballot` tests suite** requires to run `ganache-cli` locally.

- **The `remixd` tests suite** requires to run `remixd` locally.

- **The `gist` tests suite** requires specifying a github access token in **.env file**. 
```
    gist_token = <token> // token should have permission to create a gist
```

### Using 'select_test' for locally running specific tests

There is a script to allow selecting the browser and a specific test to run:

```
npm run select_test
```

You need to have 

- selenium running 

- the IDE running

- optionally have remixd or ganache running

### Splitting tests with groups

Groups can be used to group tests in a test file together. The advantage is you can avoid running long test files when you want to focus on a specific set of tests within a test file.x

These groups only apply to the test file, not across all test files. So for example group1 in the ballot is not related to group1 in another test file.

Running a group only runs the tests marked as belonging to the group + all the tests in the test file that do not have a group tag. This way you can have tests that run for all groups, for example to peform common actions.

There is no need to number the groups in a certain order. The number of the group is arbitrary.

A test can have multiple group tags, this means that this test will run in different groups.

You should write your tests so they can be executed in groups and not depend on other groups.

To do this you need to:

- Add a group to tag to a test, they are formatted as #group followed by a number: so it becomes #group1, #group220, #group4. Any number will do. You don't have to do it in specific order. 

```
  'Should generate test file #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfilePanel"]')
```

- add '@disable': true to the test file you want to split:

```
module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done) // , 'http://localhost:8080', false)
  },
```
- change package json to locally run all group tests:

```
    "nightwatch_local_debugger": "npm run build:e2e && nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js dist/apps/remix-ide-e2e/src/tests/debugger_*.spec.js --env=chrome",
```

- run the build script to build the test files if you want to run the locally

```
npm run build:e2e
```

### Locally testing group tests

You can tag any test with a groupname, for example, #group10 and easily run the test locally.

- make sure you have nx installed globally
- group tests are run like any other test, just specify the correct group number

#### method 1

This script will give you an option menu, just select the test you want
```
npm run select_test
```
#### method 2

```
npm run group_test --test=debugger --group=10 --env=chromeDesktop
```
- specify chromeDesktop to see the browser action, use 'chrome' to run it headless

### Run the same (flaky) test across all instances in CircleCI

In CircleCI all tests are divided across instances to run in paralel. 
You can also run 1 or more tests simultaneously across all instances.
This way the pipeline can easily be restarted to check if a test is flaky.

For example:

```
  'Static Analysis run with remixd #group3 #flaky': function (browser) {
```

Now group3 of this test will be executed in firefox and chrome 80 times.
If you mark more groups in other tests they will also be executed. 

**CONFIGURATION**

It's important to set a parameter in the .circleci/config.yml, set it to false then the normal tests will run.
Set it to true to run only tests marked with flaky.
```
parameters:
  run_flaky_tests:
    type: boolean
    default: true
```


## Important Links

- Official documentation: https://remix-ide.readthedocs.io/en/latest/
- Curated list of Remix resources, tutorials etc.: https://github.com/ethereum/awesome-remix
- Medium: https://medium.com/remix-ide
- Twitter: https://twitter.com/ethereumremix
