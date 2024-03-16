module.exports = {
    src_folders: ['build-e2e/remixdesktop/test/tests/app'],
    output_folder: './reports/tests',
    custom_commands_path: ['build-e2e/remix-ide-e2e/src/commands'],
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
        webdriver: {
          start_process: true,
          timeout_options: {
            timeout: 60000, // 15 seconds
            retry_attempts: 3
          }
        },
      },
      maclocal: {
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true,
          'goog:chromeOptions': {
            "binary": "release/mac/Remix-Desktop.app/Contents/MacOS/Remix-Desktop",
            "args": [
                "--e2e-local",
            ]
          }
        }
      },
      linuxlocal: {
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true,
          'goog:chromeOptions': {
            "binary": "release/linux-unpacked/remixdesktop",
            "args": [
                "--e2e-local",
            ]
          }
        }
      },
      linux: {
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true,
          'goog:chromeOptions': {
            "binary": "release/linux-unpacked/remixdesktop",
            "args": [
                "--e2e",
            ]
          }
        }
      },
      mac: {
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true,
          'goog:chromeOptions': {
            "binary": "release/mac-arm64/Remix-Desktop.app/Contents/MacOS/Remix-Desktop",
            "args": [
                "--e2e",
                '--no-sandbox',
                '--headless',
                '--verbose',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
            ]
          }
        }
      },
      winlocal: {
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true,
          'goog:chromeOptions': {
            "binary": "./release/win-unpacked/Remix-Desktop.exe",
            "args": [
              "--e2e-local",
            ]
          }
        }
      },
      win: {
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true,
          'goog:chromeOptions': {
            "binary": "./release/win-unpacked/Remix-Desktop.exe",
            "args": [
              "--e2e",
            ]
          }
        }
      },
    }
  }