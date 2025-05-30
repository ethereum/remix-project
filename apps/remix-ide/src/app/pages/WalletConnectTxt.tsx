import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpointUrls } from "@remix-endpoints-helper"

export const WalletConnectTxt = () => {
  const [content, setContent] = useState<string>('Loading...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get(`${endpointUrls.commonCorsProxy}/.well-known/walletconnect.txt`) 
      .then((res) => setContent(res.data))
      .catch((err) => {
        setError('Failed to load file')
        console.error(err)
      })
  }, [])

  return (
    <pre >
      {error ? error : content}
    </pre>
  )
}