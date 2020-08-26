import React from 'react';
import { render } from '@testing-library/react';

import StepManager from './step-manager';

describe(' StepManager', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepManager />);
    expect(baseElement).toBeTruthy();
  });
});
