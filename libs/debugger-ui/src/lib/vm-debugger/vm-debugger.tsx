import React, { useState } from 'react';
import './vm-debugger.css';

export const VmDebugger = ({ vmDebuggerLogic }) => {
  const [state, setState] = useState({
    asmCode 
  })

  return (
    <div>
      <h1>Welcome to vmDebugger!</h1>
    </div>
  );
};

export default VmDebugger;
