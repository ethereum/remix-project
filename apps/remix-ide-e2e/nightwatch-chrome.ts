import * as fs from 'fs'

const crxFile = fs.readFileSync('apps/remix-ide-e2e/src/extensions/chrome/11.13.1_0.crx')
const metamaskExtension = crxFile.toString('base64')

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

    'chrome': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          args: [
            'window-size=2560,1440',
            '--no-sandbox',
            '--headless=new',
            '--verbose',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
          ],
          extensions: [metamaskExtension]
        }
      }
    },

    'chromeDesktop': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          args: ['window-size=2560,1440', 'start-fullscreen', '--no-sandbox', '--verbose']
        }
      }
    },

    'chromeDesktopMetamask': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          args: ['window-size=2560,1440', '--no-sandbox', '--verbose']
          ,extensions: [metamaskExtension]
        }
      }
    },

    'chrome-runAndDeploy': {
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          args: ['window-size=2560,1440', 'start-fullscreen', '--no-sandbox', '--headless', '--verbose'],
          extensions: [metamaskExtension]
        }
      }
    }
  }
}
