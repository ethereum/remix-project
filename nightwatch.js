'use strict'
var TRAVIS_JOB_NUMBER = process.env.TRAVIS_JOB_NUMBER

module.exports = {
  'src_folders': ['./test-browser'],
  'output_folder': './test-browser/reports',
  'custom_commands_path': '',
  'custom_assertions_path': '',
  'globals_path': '',
  'page_objects_path': '',

  'selenium': {
    'start_process': false,
    'server_path': '',
    'log_path': '',
    'host': '127.0.0.1',
    'port': 4444,
    'cli_args': {
      'webdriver.chrome.driver': '',
      'webdriver.ie.driver': '',
      'webdriver.firefox.profile': ''
    }
  },

  'test_settings': {
    'default': {
      'launch_url': 'http://ondemand.saucelabs.com:80',
      'selenium_host': 'ondemand.saucelabs.com',
      'selenium_port': 80,
      'silent': true,
      'username': 'yann300',
      'access_key': 'e6f430f2-daa0-48bb-90fd-8bee20f429eb',
      'use_ssl': false,
      'globals': {
        'waitForConditionTimeout': 10000,
        'asyncHookTimeout': 100000
      },
      'screenshots': {
        'enabled': false,
        'path': ''
      },
      'desiredCapabilities': {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'build': 'build-' + TRAVIS_JOB_NUMBER,
        'tunnel-identifier': 'remix_tests_' + TRAVIS_JOB_NUMBER
      }
    },

    'chrome': {
      'desiredCapabilities': {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'build': 'build-' + TRAVIS_JOB_NUMBER,
        'tunnel-identifier': 'remix_tests_' + TRAVIS_JOB_NUMBER
      }
    },

    'safari': {
      'desiredCapabilities': {
        'browserName': 'safari',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'build': 'build-' + TRAVIS_JOB_NUMBER,
        'tunnel-identifier': 'remix_tests_' + TRAVIS_JOB_NUMBER
      }
    },

    'internetexplorer': {
      'desiredCapabilities': {
        'browserName': 'internetexplorer',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'build': 'build-' + TRAVIS_JOB_NUMBER,
        'tunnel-identifier': 'remix_tests_' + TRAVIS_JOB_NUMBER
      }
    },

    'local': {
      'launch_url': 'http://localhost',
      'selenium_host': '127.0.0.1',
      'selenium_port': 4444,
      'silent': true,
      'screenshots': {
        'enabled': false,
        'path': ''
      },
      'desiredCapabilities': {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    }
  }
}
