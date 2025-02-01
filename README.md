<p align="center">
  <img src="./apps/remix-ide/src/assets/img/icon.png" alt="Remix Logo" width="200"/>
</p>

<h3 align="center">🚀 Remix Project</h3>

<div align="center">

[![🔄 CircleCI](https://img.shields.io/circleci/build/github/ethereum/remix-project?logo=circleci)](https://circleci.com/gh/ethereum/remix-project)
[![📖 Documentation Status](https://readthedocs.org/projects/remix-ide/badge/?version=latest)](https://remix-ide.readthedocs.io/en/latest/index.html)
[![🤝 Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat&logo=github)](https://github.com/ethereum/remix-project/blob/master/CONTRIBUTING.md)
[![👥 GitHub Contributors](https://img.shields.io/github/contributors/ethereum/remix-project?style=flat&logo=github)](https://github.com/ethereum/remix-project/blob/master/CONTRIBUTING.md)
[![🎉 Awesome Remix](https://img.shields.io/badge/Awesome--Remix-resources-green?logo=awesomelists)](https://github.com/ethereum/awesome-remix)
[![📜 GitHub License](https://img.shields.io/github/license/ethereum/remix-project)](https://github.com/ethereum/remix-project/blob/master/LICENSE)
[![💬 Discord](https://img.shields.io/badge/join-discord-brightgreen.svg?style=flat&logo=discord)](https://discord.gg/mh9hFCKkEq)
[![🐦 X Follow](https://img.shields.io/twitter/follow/ethereumremix?style=flat&logo=x&color=green)](https://x.com/ethereumremix)  

</div>

---

## 🚀 Remix Project

**Remix Project** is a powerful toolset that includes Remix IDE, a comprehensive smart contract development environment. It also includes Remix Plugin Engine and Remix Libraries, which are essential tools for broader usage.

---

## 🛠️ Remix IDE

**Remix IDE** is designed for the entire smart contract development lifecycle, catering to users of all skill levels. It promotes a fast development cycle and provides a rich set of plugins with intuitive GUIs. The IDE comes in two versions and a VSCode extension:

🌐 **Remix Online IDE**: [🔗 Open in browser](https://remix.ethereum.org)  

👉 **Supported browsers**:  
✅ Firefox `v100.0.1+`  
✅ Chrome `v101.0.4951.64+`  
⚠️ *Not supported on tablets, smartphones, or telephones.*

🖥️ **Remix Desktop IDE**: [🔗 Download here](https://github.com/ethereum/remix-desktop/releases)  

📸 **Screenshot of Remix IDE**  
![Remix screenshot](https://github.com/ethereum/remix-project/raw/master/apps/remix-ide/remix-screenshot-400h.png)

---

## 📚 Remix Libraries  

Remix libraries are essential for Remix IDE's native plugins. Read more about libraries [here](libs/README.md).  

---

## 🔌 Offline Usage  

The `gh-pages` branch of [remix-live](https://github.com/ethereum/remix-live) always contains the **latest stable build** of Remix.  
It includes a **ZIP file** with the entire build, allowing you to use Remix IDE offline.  

⚠️ **Note**:  
- The ZIP file contains the **latest supported Solidity version** available at the time of packaging.  
- Other Solidity compiler versions can only be used **online**.  

---

## ⚙️ Setup  

🛠 **Install Dependencies**  
- Install **Yarn** and **Node.js**:  
  📖 [Guide for NodeJs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)  
  📖 [Guide for Yarn](https://classic.yarnpkg.com/lang/en/docs/install)  

✅ **Supported versions**:  
```json
"engines": {
    "node": "^20.0.0",
    "npm": "^6.14.15"
  }
```

🛠 **Install Nx CLI globally** to enable running `nx` commands:  
```bash
yarn global add nx
```

🔽 **Clone the GitHub repository**:  
```bash
git clone https://github.com/ethereum/remix-project.git
```

---

## 🚀 Build and Run Remix Project  

1️⃣ **Move to the project directory**:  
```bash
cd remix-project
```

2️⃣ **Install dependencies**:  
```bash
yarn install  # or simply run "yarn"
```

3️⃣ **Build Remix libraries**:  
```bash
yarn run build:libs
```

4️⃣ **Build the Remix project**:  
```bash
yarn build
```

5️⃣ **Run the project server**:  
```bash
yarn serve
```
💡 *For hot module reload support, use:*  
```bash
yarn serve:hot
```

🌍 **Open Remix IDE in your browser**:  
```bash
http://127.0.0.1:8080
```

📝 **Start developing in your text editor** – changes will be applied automatically in the browser.  

---

## 🏗️ Production Build  

To generate a **production build** for Remix IDE:  
```bash
yarn run build:production
```
The build will be available in:  
```bash
remix-project/dist/apps/remix-ide
```

To **serve the production build**, run:  
```bash
yarn run serve:production
```

🌍 **Production build will be available at**:  
- 🔗 `http://localhost:8080/`  
- 🔗 `http://127.0.0.1:8080/`  

---

## 🐳 Docker Setup  

### ✅ Prerequisites  

Before running Remix with Docker, install:  
- 🏗️ **Docker** → [Installation Guide](https://docs.docker.com/desktop/)  
- 🔄 **Docker Compose** → [Installation Guide](https://docs.docker.com/compose/install/)  

---

### 🚀 Run with Docker  

To run the latest **master branch build**, use:  
```bash
docker pull remixproject/remix-ide:latest
docker run -p 8080:80 remixproject/remix-ide:latest
```

To run the **latest remix-live release**, use:  
```bash
docker pull remixproject/remix-ide:remix_live
docker run -p 8080:80 remixproject/remix-ide:remix_live
```

---

### 🏗️ Run with Docker-Compose  

To run Remix **locally without building**, just download `docker-compose.yaml` and execute:  
```bash
docker-compose pull
docker-compose up -d
```

🌍 **Access Remix IDE at:**  
🔗 [http://localhost:8080](http://localhost:8080)  

To fetch the `docker-compose.yaml` file **without cloning** the repo:  
```bash
curl https://raw.githubusercontent.com/ethereum/remix-project/master/docker-compose.yaml > docker-compose.yaml
```

---

## 🛠️ Troubleshooting  

If you experience build issues, check that you have the **correct versions** of:  
- Node.js  
- npm  
- nvm  
- Nx CLI  

📌 **Check versions with:**  
```bash
node --version
npm --version
nvm --version
```

For **Debian-based systems (Ubuntu 14.04LTS+):**  
```bash
sudo apt-get install build-essential
npm rebuild
```

---

## 🧪 Unit Testing  

Run **unit tests** for a specific library:  
```bash
nx test <project-name>
```
📌 Example:  
```bash
nx test remix-analyzer
```

---

## 🌐 Browser Testing  

To run **browser-based tests** using Nightwatch:

1️⃣ **Install WebDrivers** (for the first time):  
```bash
yarn install_webdriver
```

2️⃣ **Build & Serve Remix:**  
```bash
yarn serve
```

---

## ⚠️ Important Notes  

- 🏛️ **The `ballot` test suite** requires running **Ganache** locally.  
- 🔄 **The `remixd` test suite** requires running **remixd** locally.  
- 🔑 **The `gist` test suite** requires a **GitHub access token** in the `.env` file:  

```bash
gist_token = <token>  # Token must have permission to create a gist
```

### 🎯 Select a Specific Test  

To select a specific browser and test, use:  
```bash
yarn run select_test
```

📌 **Prerequisites:**  
✔️ Selenium must be running  
✔️ The IDE must be running  
✔️ (Optional) `remixd` or `ganache` should be running  

---

## 📌 Splitting Tests with Groups  

You can group tests within a test file to **run only a specific set of tests**.  

📌 **Key points:**  
- Group numbers are **file-specific** (e.g., `group1` in `ballot` ≠ `group1` in another test file).  
- Running a group executes **only the marked tests** + ungrouped tests from the file.  
- You **don't need sequential numbering** (`#group1`, `#group220`, `#group4` are all valid).  
- A test can belong to **multiple groups**.  
- Tests should be **independent** of each other.  

📌 **How to tag a test with a group:**  

```javascript
  'Should generate test file #group1': function (browser: NightwatchBrowser) {
    browser.waitForElementPresent('*[data-id="verticalIconsKindfilePanel"]')
```

---

## 🔄 Enable Group Testing  

To **split tests into groups**, follow these steps:  

1️⃣ **Disable the entire test file** by adding this to the test module:  
```javascript
module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done) // , 'http://localhost:8080', false)
  },
```

2️⃣ **Modify the `package.json` file** to run all group tests:  
```json
"nightwatch_local_debugger": "yarn run build:e2e && nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js dist/apps/remix-ide-e2e/src/tests/debugger_*.spec.js --env=chrome",
```

3️⃣ **Build test files** before running locally:  
```bash
yarn run build:e2e
```

---

## 🏃 Locally Testing Grouped Tests  

To **run a specific test group locally**, use:  

```bash
yarn run select_test
```

📌 **Ensure you have:**  
✔️ `nx` installed globally  
✔️ The correct group number specified  

---

## 🔄 Running Flaky Tests in CircleCI  

In **CircleCI**, tests are split across instances to run in parallel.  
You can also **run a single flaky test multiple times** across all instances.  

📌 **Mark a test as flaky by adding `#flaky` to the group:**  

```javascript
  'Static Analysis run with remixd #group3 #flaky': function (browser) {
```

Now, **group3** of this test will run **80 times in Firefox and Chrome**.  
If other tests are tagged with `#group3`, they will also run.  

---

## ⚙️ CircleCI Configuration  

To **enable flaky tests in CircleCI**, modify `.circleci/config.yml`:  
```yaml
parameters:
  run_flaky_tests:
    type: boolean
    default: true
```
📌 **Set `false`** to run normal tests.  
📌 **Set `true`** to run only flaky tests.  

---

## 🔗 Important Links 

[![🌐 Remix Project](https://img.shields.io/badge/Website-Remix%20Project-0d1117?style=for-the-badge&logo=google-chrome)](https://remix-project.org)
[![📖 Documentation](https://img.shields.io/badge/Docs-Read%20the%20Docs-1976D2?style=for-the-badge&logo=readthedocs&logoColor=white)](https://remix-ide.readthedocs.io/en/latest/)
[![📰 Medium Blog](https://img.shields.io/badge/Blog-Medium-12100E?style=for-the-badge&logo=medium)](https://medium.com/remix-ide)
[![🐦 Follow on X](https://img.shields.io/badge/Follow%20on-X-000000?style=for-the-badge&logo=x)](https://x.com/ethereumremix)
[![💬 Join Discord](https://img.shields.io/badge/Join-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/zUNteAzJs3) 

 

---

