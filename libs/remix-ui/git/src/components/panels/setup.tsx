import React, { useEffect, useState } from 'react'
import { GetDeviceCode } from '../github/devicecode'
import { GitHubCredentials } from './githubcredentials'
import { IGitUi } from '../../types'

export const Setup = (props: IGitUi) => {

  const [screen, setScreen] = useState(0)

  if (screen === 0) {
    return (
      <>
        <h5>SETUP</h5>
        <div>
          <div className='mt-1 mb-2'>
          To ensure that your commits are properly attributed in Git, you need to configure a username and email address.
          These will be used to identify the author of the commit.
          </div>
          <GetDeviceCode plugin={props.plugin}></GetDeviceCode>
          <hr></hr>
          <GitHubCredentials plugin={props.plugin}></GitHubCredentials>
        </div>
      </>
    )
  } else if (screen === 1) {
    return (
      <>
        <h5>SETUP</h5>
        <h6>Step 2</h6>
        <div>
          To ensure that your commits are properly attributed in Git, you need to configure your username and email address.
          <GitHubCredentials plugin={props.plugin}></GitHubCredentials>
        </div>
      </>
    )
  }
}