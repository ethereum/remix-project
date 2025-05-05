const metamaskExtensionPath = 'apps/remix-ide-e2e/src/extensions/chrome/metamask';

module.exports = {
  src_folders: ['dist/apps/remix-ide-e2e/src/tests'],
  output_folder: './reports/tests',
  custom_commands_path: ['dist/apps/remix-ide-e2e/src/commands'],
  custom_assertions_path: '',
  page_objects_path: '',
  globals_path: '',

  webdriver: {
    start_process: true,
    port: 0,                               // pick a random free port
    server_path: '/usr/local/bin/chromedriver',
    host: '127.0.0.1',                     // bind only to IPv4
    cli_args: ['--host=127.0.0.1'],         // ensure chromedriver itself uses IPv4
    status_poll_interval: 500,   // wait 500 ms between /status checks
    max_status_poll_tries: 60,   // try up to 60 times → 30 s total wait
    process_create_timeout: 300000, // overall 5 min timeout for process startup
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
      webdriver: {
        "keep_alive": { "enabled": true, "keepAliveMsecs": 60000 },
        timeout_options: { timeout: 30000, retry_attempts: 10 }
      },
      desiredCapabilities: {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'goog:chromeOptions': {
          args: [
            'window-size=2560,1440',
            '--headless=new',
            '--verbose',
            '--disable-dev-shm-usage',
            '--disable-software-rasterizer',
            '--disable-gpu-sandbox',
            '--remote-debugging-port=0',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
          ]
        }
        , pageLoadStrategy: 'eager',
        timeouts: { pageLoad: 30000 }  // e.g. 30 s max
      }
    },

    // at the bottom of test_settings
    'chromeIdleTest': {
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
          ]
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
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'goog:chromeOptions': {
          args: [
            `--load-extension=${metamaskExtensionPath}`,
            '--window-size=2560,1440',
            '--no-sandbox',
            '--verbose',
            '--disable-gpu',
          ]
        }
      }
    },

    'chromeMetamask': {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'goog:chromeOptions': {
          args: [
            `--load-extension=${metamaskExtensionPath}`,
            '--window-size=2560,1440',
            '--verbose',
            '--headless=new',
            '--disable-gpu',
          ]
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
          extensions: []
        }
      }
    }
  }
}
