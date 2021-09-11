/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment } from 'react'
import IconKind from './IconKind'

function ShowIcons () {
  return (
    <Fragment>
      <IconKind
        idName="fileexplorer"
      />
      <IconKind
        idName="compiler"
      />
      <IconKind
        idName="udapp"
      />
      <IconKind
        idName="testing"
      />
      <IconKind
        idName="analysis"
      />
      <IconKind
        idName="debugging"
      />
      <IconKind
        idName="none"
      />
      <IconKind
        idName="settings"
      />
    </Fragment>
  )
}

export default ShowIcons
