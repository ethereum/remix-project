module.exports = {
    baseURL: 'https://selenium-release.storage.googleapis.com',
    drivers: {
      chromiumedge: {
        version: '114.0.1776.0',
        arch: process.arch,
        baseURL: 'https://msedgedriver.azureedge.net/'
      }
    }
  }