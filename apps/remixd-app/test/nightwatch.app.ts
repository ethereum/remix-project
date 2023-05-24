module.exports = {
  src_folders: ['dist/remixd-app/test/tests/app'],
  output_folder: './reports/tests',
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
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'goog:chromeOptions': {
          "binary": "./out/Remix Connect-darwin-x64/Remix Connect.app/Contents/MacOS/Remix Connect",
          "args": [
            "--folder=test/contracts",
            "--remix-ide-url=http://localhost:8080",
            "--e2e"
          ]
        }
      }
    }
  }
}
