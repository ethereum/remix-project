// e.g. in libs/remix-ui/git/src/lib/pkce.ts
export async function generatePKCE() {
  const encoder = new TextEncoder()
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const codeVerifier = btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const hashed = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier))
  const base64encoded = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return { codeVerifier, codeChallenge: base64encoded }
}