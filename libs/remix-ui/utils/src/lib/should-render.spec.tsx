import React from 'react';
import { render } from '@testing-library/react';

import ShouldRender from './should-render';

describe(' ShouldRender', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShouldRender />);
    expect(baseElement).toBeTruthy();
  });
});
