module.exports = {
    baseURL: 'https://selenium-release.storage.googleapis.com',
    drivers: {
      chrome: {
        version: '114.0.1788.0',
        arch: process.arch,
        baseURL: 'https://chromedriver.storage.googleapis.com'
      },
      chromiumedge: {
        version: '114.0.1788.0',
        arch: process.arch,
        baseURL: 'https://msedgedriver.azureedge.net/'
      }
    }
  }