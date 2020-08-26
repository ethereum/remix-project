import React from 'react';
import { render } from '@testing-library/react';

import Slider from './slider';

describe(' Slider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Slider />);
    expect(baseElement).toBeTruthy();
  });
});
