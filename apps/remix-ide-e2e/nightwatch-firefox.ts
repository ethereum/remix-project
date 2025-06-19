module.exports = {
  src_folders: ['dist/apps/remix-ide-e2e/src/tests'],
  output_folder: './reports/tests',
  custom_commands_path: ['dist/apps/remix-ide-e2e/src/commands'],
  custom_assertions_path: '',
  page_objects_path: '',
  globals_path: '',

  webdriver: {
    start_process: true,
    port: 4444,
    server_path: './tmp/webdrivers/node_modules/geckodriver/bin/geckodriver.js',
  },

  test_settings: {
    selenium_port: 4444,
    selenium_host: 'localhost',
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

    'firefoxDesktop': {
      desiredCapabilities: {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'moz:firefoxOptions': {
          args: ['-width=2560', '-height=1440', '--devtools']
        }
      }
    },

    'firefox': {
      desiredCapabilities: {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'moz:firefoxOptions': {
          args: ['-headless', '-width=2560', '-height=1440']
        }
      }
    }
  }
}
