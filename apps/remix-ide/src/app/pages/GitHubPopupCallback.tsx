import React, { useEffect } from 'react'

const extractCode = () => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('code')) return searchParams.get('code')

    // If not found in search, check the hash
    const hashParams = new URLSearchParams(window.location.hash.slice(1)) // strip #
    return hashParams.get('code')
}

export const GitHubPopupCallback = () => {
    useEffect(() => {
        const exchangeToken = async () => {
            console.log('[GitHubPopupCallback] Starting exchangeToken...')
            const params = new URLSearchParams(window.location.search)
            const code = extractCode()

            console.log('[GitHubPopupCallback] code:', code)

            if (!code) {
                console.warn('[GitHubPopupCallback] Missing code', { code })
                window.opener?.postMessage({ type: 'GITHUB_AUTH_FAILURE' }, window.location.origin)
                //window.close()
                return
            }

            try {
                const response = await fetch('http://localhost:4000/github-login-proxy/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: 'Ov23li1dOIgMqxY9vRJS',
                        code,
                        redirect_uri: window.location.origin + '/auth/github/callback'
                    })
                })

                const data = await response.json()
                console.log('[GitHubPopupCallback] GitHub response:', data)

                if (data.access_token) {
                    console.log('[GitHubPopupCallback] Posting success message')
                    window.opener?.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: data.access_token }, window.location.origin)
                } else {
                    console.log('[GitHubPopupCallback] Posting failure message')
                    window.opener?.postMessage({ type: 'GITHUB_AUTH_FAILURE' }, window.location.origin)
                }
            } catch (error) {
                console.error('[GitHubPopupCallback] Token exchange error:', error)
                window.opener?.postMessage({ type: 'GITHUB_AUTH_FAILURE' }, window.location.origin)
            } finally {
                localStorage.removeItem('pkce_verifier')
                //window.close()
            }

        }

        exchangeToken()
    }, [])

    return <div>Logging in…</div>
}