import React, { useState, useEffect } from 'react' // eslint-disable-line
import AssemblyItems from './assembly-items' // eslint-disable-line

export const CodeListView = ({ registerEvent, className = ""}) => {
  return (
    <div className={className} id='asmcodes'>
      <AssemblyItems registerEvent={registerEvent} />
    </div>
  )
}

export default CodeListView
