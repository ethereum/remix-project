import React, { useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { LayoutProvider, useLayoutContext } from '@remix-ui/panel';
import { EditorProvider } from './context/editorContext';
import { DynamicPanelGroup } from '@remix-ui/panel';

type EditorUIProps = {
  plugin: any;
};

const EditorWithLayout: React.FC<{ plugin: any }> = ({ plugin }) => {
  const layout = useLayoutContext();

  useEffect(() => {
    // Inject layout methods into plugin instance
    console.log('layout', layout);
    plugin.layout = layout;
  }, [layout]);

  return <DynamicPanelGroup />;
};

export const EditorUI: React.FC<EditorUIProps> = ({ plugin }) => {
  const monaco = useMonaco();

  if (!monaco) return <div>Loading editor...</div>;

  return (
    <EditorProvider plugin={plugin} monaco={monaco} events={plugin.event}>
      <LayoutProvider>
        <EditorWithLayout plugin={plugin} />
      </LayoutProvider>
    </EditorProvider>
  );
};