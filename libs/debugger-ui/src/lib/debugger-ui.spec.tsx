import React from 'react';
import { render } from '@testing-library/react';

import DebuggerUi from './debugger-ui';

describe(' DebuggerUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DebuggerUi />);
    expect(baseElement).toBeTruthy();
  });
});
