import React from 'react';
import { render } from '@testing-library/react';

import ButtonNavigation from './button-navigator';

describe(' ButtonNavigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonNavigation />);
    expect(baseElement).toBeTruthy();
  });
});
