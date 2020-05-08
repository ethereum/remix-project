module.exports = {
  version: '3.8.1',
  baseURL: 'https://selenium-release.storage.googleapis.com',
  drivers: {
    chrome: {
      version: '2.39',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    }
  }
}
