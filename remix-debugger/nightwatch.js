'use strict'
var TRAVIS_JOB_NUMBER = process.env.TRAVIS_JOB_NUMBER

module.exports = {
  'src_folders': ['./test-browser/test'],
  'output_folder': './test-browser/test/reports',
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
      'username': 'yanneth',
      'access_key': '1f5a4560-b02b-41aa-b52b-f033aad30870',
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
        'platform': 'OS X 10.11',
        'version': '10.0',
        'acceptSslCerts': true,
        'build': 'build-' + TRAVIS_JOB_NUMBER,
        'tunnel-identifier': 'remix_tests_' + TRAVIS_JOB_NUMBER
      }
    },

    'ie': {
      'desiredCapabilities': {
        'browserName': 'internet explorer',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'platform': 'WIN8.1',
        'version': '11',
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
