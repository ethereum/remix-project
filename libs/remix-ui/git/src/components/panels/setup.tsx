import React, { useEffect, useState } from 'react'
import { gitUIPanels } from '../../types'
import GitUIButton from '../buttons/gituibutton'
import { FormattedMessage } from 'react-intl'

export const Setup = ({ callback }) => {

  const startSetingUp = () => {
    callback(gitUIPanels.GITHUB)
  }

  return (
    <>
      <h5>SETUP REQUIRED</h5>
      <div>
        <div className='mt-1 mb-2'>
          To ensure that your commits are properly attributed in Git, you need to <a href='#' onClick={startSetingUp} className='cursor-pointer mr-1'>configure a username and email address or connect to GitHub.</a>
          These credentials will be used to identify the author of the commit.

          <a href='#' onClick={startSetingUp} className='ml-1 cursor-pointer'>
            <FormattedMessage id='git.setup' /></a>
        </div>
        <hr></hr>
      </div>
    </>
  )

}