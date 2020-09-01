import React from 'react';
import { render } from '@testing-library/react';

import RemixUiTreeView from './remix-ui-tree-view';

describe(' RemixUiTreeView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RemixUiTreeView />);
    expect(baseElement).toBeTruthy();
  });
});
