import os from 'os';
import fs from 'fs';

/*
 * Nightwatch configuration for Remix Desktop E2E tests
 * 
 * Key fixes for CI environments (GitHub Actions):
 * 1. Detect CI environment using GITHUB_ACTIONS or CIRCLECI env vars
 * 2. Use headless mode and additional sandbox flags for CI
 * 3. Remove --inspect flag in CI (can cause hangs)
 * 4. Add virtual display setup for Linux environments
 * 5. Increase timeouts for CI environments
 * 6. Better error handling and binary existence checks
 */



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
          waitForConditionTimeout: process.env.GITHUB_ACTIONS ? 60000 : 30000,
          asyncHookTimeout: process.env.GITHUB_ACTIONS ? 60000 : 30000
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
            timeout: process.env.GITHUB_ACTIONS ? 120000 : 90000, // Increase timeout for GitHub Actions
            retry_attempts: process.env.GITHUB_ACTIONS ? 3 : 5
          },
          connection_retry_attempts: 5,
          connection_retry_timeout: 15000
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
            // Check if running on CI (CircleCI or GitHub Actions) or locally
            const isCI = process.env.CIRCLECI || process.env.GITHUB_ACTIONS;
            let args = isCI ? ["--e2e"] : ["--e2e-local"];
            
            if(useIsoGit) args = [...args, '--use-isogit'];
            if(useOffline) args = [...args, '--use-offline'];

            // CI-specific arguments for headless operation
            if (isCI) {
              args = [...args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--headless', '--remote-debugging-pipe'];
            } else {
              // Local development arguments (keep --inspect for debugging)
              args = [...args, '--remote-debugging-pipe', '--disable-gpu', '--disable-dev-shm-usage', '--inspect'];
            }

            // Set display size
            const windowSize = "--window-size=1000,1000";
            args = [...args, windowSize];

            // Add display configuration for Linux CI
            if (isCI && type === 'Linux') {
              // Set DISPLAY environment variable for headless operation
              process.env.DISPLAY = ':99';
              args = [...args, '--use-gl=osmesa', '--enable-logging', '--log-level=0'];
            }

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
            console.log('[CI DEBUG] OS Type:', type, 'Arch:', arch);
            console.log('[CI DEBUG] Is CI Environment:', !!isCI);
            console.log('[CI DEBUG] Environment Variables:', {
              CIRCLECI: process.env.CIRCLECI,
              GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
              DISPLAY: process.env.DISPLAY
            });
            console.log('[CI DEBUG] Launching Remix Desktop with the following parameters:');
            console.log('Binary Path:', binaryPath);
            console.log('Arguments:', args);
            
            // Check if binary exists
            if (!fs.existsSync(binaryPath)) {
              console.error('[ERROR] Binary not found at path:', binaryPath);
              console.log('[DEBUG] Current working directory:', process.cwd());
              console.log('[DEBUG] Listing files in release directory...');
              try {
                const releaseDir = type === 'Linux' ? 'release/linux-unpacked' : 'release';
                if (fs.existsSync(releaseDir)) {
                  console.log('Files in', releaseDir, ':', fs.readdirSync(releaseDir));
                } else {
                  console.log('Release directory does not exist:', releaseDir);
                }
              } catch (e) {
                console.log('Failed to list release directory:', e.message);
              }
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
