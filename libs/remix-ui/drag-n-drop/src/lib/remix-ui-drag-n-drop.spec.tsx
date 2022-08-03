import { render } from '@testing-library/react';

import RemixUiDragNDrop from './remix-ui-drag-n-drop';

describe('RemixUiDragNDrop', () => {
  it('should render successfully', () => {
    const { baseElement } = render(< RemixUiDragNDrop />);
    expect(baseElement).toBeTruthy();
  });
});
