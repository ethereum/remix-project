const os = require('os');

const http = require('http');

const useIsoGit = process.argv.includes('--useIsoGit');

// Function to check if localhost:8080 is active
function checkLocalhost8080Active(callback) {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    if (res.statusCode === 200) {
      callback(true); // Server is active
    } else {
      callback(false); // Server is running but returned a non-success status code
    }
  });

  req.on('error', (error) => {
    //console.error(error);
    callback(false); // Server is not active
  });

  req.end();
}

// Determine if running on CircleCI or locally with --e2e-local
const isLocalE2E = process.argv.includes('--e2e-local') && !process.env.CIRCLECI;

if (isLocalE2E) {
  checkLocalhost8080Active((isActive) => {
    if (!isActive) {
      console.error('localhost:8080 is not active. Please start the server before running tests.');
      process.exit(1); // Exit if localhost:8080 is not active
    } else {
      console.log('localhost:8080 is active. Proceeding with tests.');
      // The script can continue to the Nightwatch configuration below if needed
    }
  });
}

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
            
            if(useIsoGit) args = [...args, '--useIsoGit'];

            if(!process.env.CIRCLECI){
              checkLocalhost8080Active((isActive)=>{
                if(!isActive){
                  console.error('localhost:8080 is not active. Please start the server before running tests.');
                  process.exit(1); // Exit if localhost:8080 is not active
                } else {
                  console.log('localhost:8080 is active. Proceeding with tests.');
                  // The script can continue to the Nightwatch configuration below if needed
                }
              });
            }

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
