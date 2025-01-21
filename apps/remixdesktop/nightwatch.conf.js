//
// Refer to the online docs for more details:
// https://nightwatchjs.org/guide/configuration/nightwatch-configuration-file.html
//
//  _   _  _         _      _                     _          _
// | \ | |(_)       | |    | |                   | |        | |
// |  \| | _   __ _ | |__  | |_ __      __  __ _ | |_   ___ | |__
// | . ` || | / _` || '_ \ | __|\ \ /\ / / / _` || __| / __|| '_ \
// | |\  || || (_| || | | || |_  \ V  V / | (_| || |_ | (__ | | | |
// \_| \_/|_| \__, ||_| |_| \__|  \_/\_/   \__,_| \__| \___||_| |_|
//             __/ |
//            |___/
//

module.exports = {
  src_folders: [],
  page_objects_path: ['node_modules/nightwatch/examples/pages/'],
  custom_commands_path: ['node_modules/nightwatch/examples/custom-commands/'],
  custom_assertions_path: '',
  plugins: [],
  globals_path: '',
  webdriver: {},

  test_settings: {
    default: {
      disable_error_log: false,
      launch_url: 'https://nightwatchjs.org',

      globals: {
        waitForConditionTimeout: 30000,
        retryAssertionTimeout: 30000,
        asyncHookTimeout: 30000,
      },

      screenshots: {
        enabled: false,
        path: 'screens',
        on_failure: true
      },

      desiredCapabilities: {
        browserName: 'firefox'
      },

      webdriver: {
        start_process: true,
        server_path: '',
        timeout_options: {
          timeout: 60000,
          pageLoadTimeout: 60000,
          retry_attempts: 3
        }
      }
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        alwaysMatch: {
          acceptInsecureCerts: true,
          'moz:firefoxOptions': {
            args: []
          }
        }
      },
      webdriver: {
        start_process: true,
        server_path: '',
        timeout_options: {
          timeout: 60000,
          pageLoadTimeout: 60000,
          retry_attempts: 3
        }
      }
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1280,800'
          ]
        }
      },
      webdriver: {
        start_process: true,
        server_path: '',
        timeout_options: {
          timeout: 60000,
          pageLoadTimeout: 60000,
          retry_attempts: 3
        }
      }
    },

    edge: {
      desiredCapabilities: {
        browserName: 'MicrosoftEdge',
        'ms:edgeOptions': {
          w3c: true,
          args: []
        }
      },
      webdriver: {
        start_process: true,
        server_path: '',
        timeout_options: {
          timeout: 60000,
          pageLoadTimeout: 60000,
          retry_attempts: 3
        }
      }
    },

    'cucumber-js': {
      src_folders: ['examples/cucumber-js/features/step_definitions'],
      test_runner: {
        type: 'cucumber',
        options: {
          feature_path: 'node_modules/nightwatch/examples/cucumber-js/*/*.feature'
        }
      }
    },

    browserstack: {
      selenium: {
        host: 'hub.browserstack.com',
        port: 443
      },
      desiredCapabilities: {
        'bstack:options': {
          userName: '${BROWSERSTACK_USERNAME}',
          accessKey: '${BROWSERSTACK_ACCESS_KEY}',
        }
      },
      disable_error_log: true,
      webdriver: {
        timeout_options: {
          timeout: 60000,
          retry_attempts: 3
        },
        keep_alive: true,
        start_process: false
      }
    },

    'browserstack.local': {
      extends: 'browserstack',
      desiredCapabilities: {
        'browserstack.local': true
      }
    },

    'browserstack.chrome': {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          w3c: true
        }
      }
    },

    'browserstack.firefox': {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'firefox'
      }
    },

    'browserstack.ie': {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'internet explorer',
        browserVersion: '11.0'
      }
    },

    'browserstack.safari': {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'safari'
      }
    },

    'browserstack.local_chrome': {
      extends: 'browserstack.local',
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },

    'browserstack.local_firefox': {
      extends: 'browserstack.local',
      desiredCapabilities: {
        browserName: 'firefox'
      }
    },

    saucelabs: {
      selenium: {
        host: 'ondemand.saucelabs.com',
        port: 443
      },
      desiredCapabilities: {
        'sauce:options': {
          username: '${SAUCE_USERNAME}',
          accessKey: '${SAUCE_ACCESS_KEY}',
          screenResolution: '1280x1024'
        }
      },
      disable_error_log: false,
      webdriver: {
        start_process: false,
        timeout_options: {
          timeout: 60000,
          pageLoadTimeout: 60000,
          retry_attempts: 3
        }
      }
    },

    'saucelabs.chrome': {
      extends: 'saucelabs',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        javascriptEnabled: true,
        acceptSslCerts: true,
        timeZone: 'London',
        chromeOptions: {
          w3c: true
        }
      }
    },

    'saucelabs.firefox': {
      extends: 'saucelabs',
      desiredCapabilities: {
        browserName: 'firefox',
        browserVersion: 'latest',
        javascriptEnabled: true,
        acceptSslCerts: true,
        timeZone: 'London'
      }
    },

    selenium_server: {
      selenium: {
        start_process: true,
        port: 4444,
        server_path: '',
        command: 'standalone',
        cli_args: {}
      },
      webdriver: {
        start_process: false,
        default_path_prefix: '/wd/hub',
        timeout_options: {
          timeout: 60000,
          pageLoadTimeout: 60000,
          retry_attempts: 3
        }
      }
    },

    'selenium.chrome': {
      extends: 'selenium_server',
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          w3c: true
        }
      }
    },

    'selenium.firefox': {
      extends: 'selenium_server',
      desiredCapabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: []
        }
      }
    }
  },

  test_workers: {
    enabled: true,
    workers: 'auto'
  },

  output_folder: 'tests_output',
  live_output: true,
  detailed_output: true,

  max_retries: {
    test: 2,
    testcase: 1
  }
};