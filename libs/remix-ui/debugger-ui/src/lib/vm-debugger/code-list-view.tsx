import React, { useState, useEffect } from 'react' // eslint-disable-line
import AssemblyItems from './assembly-items' // eslint-disable-line

export const CodeListView = ({ registerEvent }) => {
  return (
    <div id='asmcodes'>
      <AssemblyItems registerEvent={registerEvent} />
    </div>
  )
}

export default CodeListView
