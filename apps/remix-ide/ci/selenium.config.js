module.exports = {
    baseURL: 'https://selenium-release.storage.googleapis.com',
    drivers: {
      chromiumedge: {
        version: '112.0.1722.39',
        arch: process.arch,
        baseURL: 'https://msedgedriver.azureedge.net/'
      }
    }
  }