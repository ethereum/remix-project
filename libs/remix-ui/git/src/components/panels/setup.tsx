import React, { useEffect, useState } from 'react'
import { gitUIPanels } from '../../types'
import GitUIButton from '../buttons/gituibutton'
import { FormattedMessage } from 'react-intl'

export const Setup = ({ callback }) => {

  const startSettingUp = () => {
    callback(gitUIPanels.GITHUB)
  }

  return (
    <>
      <h6>SETUP REQUIRED</h6>
      <div>
        <div className='mt-1 mb-2'>
          To ensure that your commits are properly attributed in Git, you need to <a href='#' onClick={startSettingUp} className='cursor-pointer me-1'>configure a username and email OR connect to GitHub.</a>
          These credentials will be used to identify the author of the commit.

          <a href='#' onClick={startSettingUp} className='ms-1 cursor-pointer'>
            <FormattedMessage id='git.setup' /></a>
        </div>
        <hr></hr>
      </div>
    </>
  )

}
