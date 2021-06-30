import React from 'react'

import './remix-ui-plugin-manager.css';

/* eslint-disable-next-line */
export interface RemixUiPluginManagerProps {
  name: 'pluginManager',
  displayName: 'Plugin manager',
  methods: [],
  events: [],
  icon: 'assets/img/pluginManager.webp',
  description: 'Start/stop services, modules and plugins',
  kind: 'settings',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/plugin_manager.html',
  version: string
}

export const RemixUiPluginManager = (props: RemixUiPluginManagerProps) => {
  return (
    <div>
      <h1>Welcome to remix-ui-plugin-manager!</h1>
    </div>
  );
};

export default RemixUiPluginManager;
