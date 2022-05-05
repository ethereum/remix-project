module.exports = {
  src_folders: ['dist/apps/remix-ide-e2e/src/tests'],
  output_folder: './reports/tests',
  custom_commands_path: ['dist/apps/remix-ide-e2e/src/commands'],
  custom_assertions_path: '',
  page_objects_path: '',
  globals_path: '',

  test_settings: {
    default: {
      selenium_port: 4444,
      selenium_host: 'localhost',
      globals: {
        waitForConditionTimeout: 10000,
        asyncHookTimeout: 100000
      },
      screenshots: {
        enabled: true,
        path: './reports/screenshots',
        on_failure: true,
        on_error: true
      },
      exclude: ['dist/apps/remix-ide-e2e/src/tests/runAndDeploy.test.js', 'dist/apps/remix-ide-e2e/src/tests/pluginManager.test.ts']
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'goog:chromeOptions': {
          args: ['window-size=2560,1440', 'start-fullscreen', '--no-sandbox', '--headless', '--verbose']
        }
      }
    },

    chromeDesktop: {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'goog:chromeOptions': {
          args: ['window-size=2560,1440', 'start-fullscreen', '--no-sandbox']
        }
      }
    },

    'chrome-runAndDeploy': {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'goog:chromeOptions': {
          args: ['window-size=2560,1440', 'start-fullscreen', '--no-sandbox', '--headless', '--verbose']
        }
      }
    },

    firefoxDesktop: {
      desiredCapabilities: {
        browserName: 'firefox',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'moz:firefoxOptions': {
          args: [
            '-width=2560',
            '-height=1440'
          ]
        }
      }
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'moz:firefoxOptions': {
          args: [
            '-headless',
            '-width=2560',
            '-height=1440'
          ]
        }
      }
    }
  }
}
