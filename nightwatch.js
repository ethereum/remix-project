'use strict'

var buildId = process.env.CIRCLE_BUILD_NUM || process.env.TRAVIS_JOB_NUMBER

module.exports = {
  'src_folders': ['test-browser/tests'],
  'output_folder': 'reports',
  'custom_commands_path': '',
  'custom_assertions_path': '',
  'page_objects_path': '',
  'globals_path': '',

  'test_settings': {
    'default': {
      'launch_url': 'http://ondemand.saucelabs.com:80',
      'selenium_host': 'ondemand.saucelabs.com',
      'selenium_port': 80,
      'silent': true,
      'username': 'chriseth',
      'access_key': 'b781828a-9e9c-43d8-89d4-2fbb879595ca',
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
        'build': 'build-' + buildId,
        'tunnel-identifier': 'browsersolidity_tests_' + buildId
      }
    },

    'chrome': {
      'desiredCapabilities': {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true,
        'build': 'build-' + buildId,
        'tunnel-identifier': 'browsersolidity_tests_' + buildId,
        'chromeOptions': {
          'args': ['window-size=2560,1440', 'start-fullscreen']
        }
      }
    },

    'safari': {
      'desiredCapabilities': {
        'browserName': 'safari',
        'javascriptEnabled': true,
        'platform': 'OS X 10.11',
        'version': '10.0',
        'acceptSslCerts': true,
        'build': 'build-' + buildId,
        'tunnel-identifier': 'browsersolidity_tests_' + buildId
      }
    },

    'ie': {
      'desiredCapabilities': {
        'browserName': 'internet explorer',
        'javascriptEnabled': true,
        'platform': 'Windows 10',
        'acceptSslCerts': true,
        'version': '11.103',
        'build': 'build-' + buildId,
        'tunnel-identifier': 'browsersolidity_tests_' + buildId
      }
    },

    'local': {
      'launch_url': 'http://localhost:8080',
      'selenium_port': 4444,
      'selenium_host': 'localhost',
      'desiredCapabilities': {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    }
  }
}
