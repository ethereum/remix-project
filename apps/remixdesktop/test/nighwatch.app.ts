const os = require('os');

module.exports = {
    src_folders: ['build-e2e/remixdesktop/test/tests/app'],
    output_folder: './reports/tests',
    custom_commands_path: ['build-e2e/remix-ide-e2e/src/commands'],
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
            timeout: 60000,
            retry_attempts: 3
          }
        },
        desiredCapabilities: {
          browserName: 'chrome',
          javascriptEnabled: true,
          acceptSslCerts: true,
          'goog:chromeOptions': (() => {
            const type = os.type();
            const arch = os.arch();
            let binaryPath = "";
            // Check if running on CircleCI or locally
            let args = process.env.CIRCLECI ? ["--e2e"] : ["--e2e-local"];
            
            switch (type) {
              case 'Windows_NT':
                binaryPath = "./release/win-unpacked/Remix-Desktop.exe";
                break;
              case 'Darwin':
                binaryPath = arch === 'x64' ? 
                  "release/mac/Remix-Desktop.app/Contents/MacOS/Remix-Desktop" :
                  "release/mac-arm64/Remix-Desktop.app/Contents/MacOS/Remix-Desktop";
                break;
              case 'Linux':
                binaryPath = "release/linux-unpacked/remixdesktop";
                break;
            }
            
            return {
              binary: binaryPath,
              args: args
            };
          })()
        }
      }
    }
};
