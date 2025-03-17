import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const crxFile = fs.readFileSync('apps/remix-ide-e2e/src/extensions/chrome/11.13.1_0.crx');
const metamaskExtension = crxFile.toString('base64');

// Function to find the Brave binary path based on the OS
const getBravePath = () => {
  const platform = os.platform();
  if (platform === 'darwin') {
    return '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
  } else if (platform === 'win32') {
    const possiblePaths = [
      'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    ];
    return possiblePaths.find(fs.existsSync) || 'brave.exe'; // Default to PATH lookup
  } else {
    return '/usr/bin/brave-browser'; // Linux default
  }
};

const braveBinary = getBravePath();

module.exports = {
  src_folders: ['dist/apps/remix-ide-e2e/src/tests'],
  output_folder: './reports/tests',
  custom_commands_path: ['dist/apps/remix-ide-e2e/src/commands'],
  custom_assertions_path: '',
  page_objects_path: '',
  globals_path: '',

  webdriver: {
    start_process: true,
    port: 9515,
    server_path: './tmp/webdrivers/node_modules/chromedriver/bin/chromedriver',
  },

  test_settings: {
    'default': {
      globals: {
        waitForConditionTimeout: 10000,
        asyncHookTimeout: 10000000
      },
      screenshots: {
        enabled: true,
        path: './reports/screenshots',
        on_failure: true,
        on_error: true
      },
      exclude: ['dist/apps/remix-ide-e2e/src/tests/runAndDeploy.test.js', 'dist/apps/remix-ide-e2e/src/tests/pluginManager.test.ts']
    },

    'brave': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          binary: braveBinary,  // Dynamic Brave binary path
          args: [
            'window-size=2560,1440',
            '--no-sandbox',
            '--headless=new',  // Enable headless mode for CI
            '--verbose',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
          ],
          extensions: [metamaskExtension]
        }
      }
    },

    'braveDesktop': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          binary: braveBinary,
          args: ['window-size=2560,1440', 'start-fullscreen', '--no-sandbox', '--verbose']
        }
      }
    },

    'braveDesktopMetamask': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          binary: braveBinary,
          args: ['window-size=2560,1440', '--no-sandbox', '--verbose'],
          extensions: [metamaskExtension]
        }
      }
    },

    'brave-runAndDeploy': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          binary: braveBinary,
          args: ['window-size=2560,1440', 'start-fullscreen', '--no-sandbox', '--headless', '--verbose'],
          extensions: [metamaskExtension]
        }
      }
    }
  }
};