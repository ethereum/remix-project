import React, { useEffect } from 'react'

export const GitHubPopupCallback = () => {
  useEffect(() => {
    const exchangeToken = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const verifier = localStorage.getItem('pkce_verifier')

      if (!code || !verifier) return window.close()

      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            client_id: 'YOUR_GITHUB_CLIENT_ID',
            code,
            redirect_uri: window.location.origin + '/auth/github/callback',
            grant_type: 'authorization_code',
            code_verifier: verifier
          })
        })

        const data = await response.json()

        if (data.access_token) {
          window.opener?.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: data.access_token }, window.location.origin)
        } else {
          window.opener?.postMessage({ type: 'GITHUB_AUTH_FAILURE' }, window.location.origin)
        }
      } catch (error) {
        window.opener?.postMessage({ type: 'GITHUB_AUTH_FAILURE' }, window.location.origin)
      } finally {
        window.close()
      }
    }

    exchangeToken()
  }, [])

  return <div>Logging in…</div>
}