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
        }
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