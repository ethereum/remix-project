import React, { useState, useEffect } from 'react';

import { terrareal UI } from '@remix-ui/terrareal-ui' // eslint-disable-line

import { terrareal } from './terrareal'

const remix = new terrareal ClientApi()

export const App = () => {  
  return (
    <div className="terrareal">
      <terrareal UI terrarealAPI={remix} />
    </div>
  );
};

export default App;
