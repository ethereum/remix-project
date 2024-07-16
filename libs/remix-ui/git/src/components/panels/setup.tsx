import React, { useState } from 'react'
import { GetDeviceCode } from '../github/devicecode'
import { GitHubCredentials } from './githubcredentials'

export const Setup = () => {
  const [screen, setScreen] = useState(0)

  return (
    <>
      {screen === 0 ? (
        <div className="px-3">
          <h6>SETUP</h6>
          <div>
            <div className="mt-1 mb-2">
              To ensure that your commits are properly attributed in Git, you need to configure a username and email address. These will be used to identify the author of the commit.
            </div>
            <GetDeviceCode />
            <hr />
            <GitHubCredentials />
          </div>
        </div>
      ) : (
        <div className="px-3">
          <h5>SETUP</h5>
          <h6>Step 2</h6>
          <div>
            To ensure that your commits are properly attributed in Git, you need to configure your username and email address.
            <GitHubCredentials />
          </div>
        </div>
      )}
    </>
  )
}
