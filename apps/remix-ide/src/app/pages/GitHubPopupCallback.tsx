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
            const verifier = localStorage.getItem('pkce_verifier')

            console.log('[GitHubPopupCallback] code:', code)
            console.log('[GitHubPopupCallback] verifier:', verifier)

            if (!code || !verifier) {
                console.warn('[GitHubPopupCallback] Missing code or verifier', { code, verifier })
                window.opener?.postMessage({ type: 'GITHUB_AUTH_FAILURE' }, window.location.origin)
                //window.close()
                return
            }

            try {
                const response = await fetch('https://github.remixproject.org/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: 'Ov23li1dOIgMqxY9vRJS',
                        code,
                        redirect_uri: window.location.origin + '/auth/github/callback',
                        code_verifier: verifier
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
                //window.close()
            }

        }

        exchangeToken()
    }, [])

    return <div>Logging in…</div>
}