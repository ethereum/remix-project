import React, { useState, useEffect } from 'react';

import { DebuggerUI } from '@remix-ui/debugger-ui' // eslint-disable-line

import { DebuggerClientApi } from './debugger'

const remix = new DebuggerClientApi()

export const App = () => {  
  return (
    <div className="debugger">
      <DebuggerUI debuggerAPI={remix} />
    </div>
  );
};

export default App;
