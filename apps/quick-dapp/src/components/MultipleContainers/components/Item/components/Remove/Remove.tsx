import React from 'react';

import { Action, ActionProps } from '../Action';

export function Remove(props: ActionProps) {
  return (
    <Action
      {...props}
      active={{
        fill: 'rgba(255, 70, 70, 0.95)',
        background: 'rgba(255, 70, 70, 0.1)',
      }}
    >
      <i className="fas fa-times"></i>
    </Action>
  );
}
