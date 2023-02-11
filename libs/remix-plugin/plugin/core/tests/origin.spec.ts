import { checkOrigin } from "../src"

declare const global  // Needed to mock fetch

describe('Origin', () => {
  test('Check origin', async () => {
    const port = 8080
    const origins = 'package://'
    const goodOrigin = 'http://remix.ethereum.org'
    const wrongOrigin = 'http://remix.ethereum.com'
    const goodLocalOrigin = `http://127.0.0.1:${port}`
    const wrongLocalOrigin = `http://localhost:${port + 1}`
    const wrongExternalOrigin = `${origins}wrong`
    const goodExternalOrigin = origins
    const allowOrigins = [goodLocalOrigin, goodExternalOrigin]

    // Mock fetch api
    const mockFetchPromise = Promise.resolve({
      json: () => Promise.resolve([
        "http://remix-alpha.ethereum.org",
        "http://remix.ethereum.org",
        "https://remix-alpha.ethereum.org",
        "https://remix.ethereum.org"
      ])
    })
    global.fetch = jest.fn().mockImplementation(() => mockFetchPromise)

    expect(await checkOrigin(goodOrigin)).toBeTruthy()
    expect(await checkOrigin(wrongOrigin)).toBeTruthy() // Check origin only with devmode & allowOrigins
    expect(await checkOrigin(goodLocalOrigin, { allowOrigins })).toBeTruthy()
    expect(await checkOrigin(wrongLocalOrigin, { allowOrigins })).toBeFalsy()
    expect(await checkOrigin(goodExternalOrigin, { allowOrigins })).toBeTruthy()
    expect(await checkOrigin(wrongExternalOrigin, { allowOrigins })).toBeFalsy()
  })
})