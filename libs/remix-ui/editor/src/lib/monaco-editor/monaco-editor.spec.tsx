import React from 'react';
import { render } from '@testing-library/react';

import MonacoEditor from './monaco-editor';

describe(' MonacoEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MonacoEditor />);
    expect(baseElement).toBeTruthy();
  });
});
