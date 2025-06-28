import os from 'os';
import fs from 'fs';



const useIsoGit = process.argv.includes('--use-isogit');
const useOffline = process.argv.includes('--use-offline');

// Function to read JSON file synchronously
function readJSONFileSync(filename: string): any {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}

const packageData: any = readJSONFileSync('package.json');
const version = packageData.version;

let channel: string = ''

if (version.includes('beta')) {
  channel = 'Beta';
} else if (version.includes('alpha')) {
  channel = 'Alpha';
} else if (version.includes('insiders')) {
  channel = 'Insiders';
}

module.exports = {
    src_folders: ['build-e2e/remixdesktop/test/tests/app'],
    output_folder: './reports/tests',
    custom_commands_path: ['build-e2e/remix-ide-e2e/src/commands'],
    page_objects_path: '',
    globals_path: '',
    test_settings: {
      default: {
        enable_fail_fast: true,
        selenium_port: 4444,
        selenium_host: 'localhost',
        globals: {
          waitForConditionTimeout: 30000,
          asyncHookTimeout: 30000
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
            timeout: 90000,
            retry_attempts: 5
          },
          connection_retry_attempts: 3,
          connection_retry_timeout: 10000
        },
        retries: {
          attempts: 2,
          retry_on_failure: true
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
            
            if(useIsoGit) args = [...args, '--use-isogit'];
            if(useOffline) args = [...args, '--use-offline'];

            // add '--remote-debugging-pipe'
            args = [...args, '--remote-debugging-pipe', '--disable-gpu', '--disable-dev-shm-usage', '--inspect'];

            // Set display size
            const windowSize = "--window-size=1000,1000";
            args = [...args];

            switch (type) {
              case 'Windows_NT':
                binaryPath = `./release/win-unpacked/Remix-Desktop${channel ? '-' + channel : ''}.exe`;
                break;
              case 'Darwin':
                binaryPath = arch === 'x64' ? 
                  `release/mac/Remix-Desktop${channel ? '-' + channel : ''}.app/Contents/MacOS/Remix-Desktop${channel ? '-' + channel : ''}` :
                  `release/mac-arm64/Remix-Desktop${channel ? '-' + channel : ''}.app/Contents/MacOS/Remix-Desktop${channel ? '-' + channel : ''}`;
                break;
              case 'Linux':
                binaryPath = "release/linux-unpacked/remixdesktop";
                break;
            }
            
            console.log('binaryPath', binaryPath);
            console.log('[CI DEBUG] Launching Remix Desktop with the following parameters:');
            console.log('Binary Path:', binaryPath);
            console.log('Arguments:', args);
            return {
              binary: binaryPath,
              args: args
            };
          })()
        }
      }
    }
};
