// editor.ts
import { Plugin } from '@remixproject/engine';
import { PluginViewWrapper } from '@remix-ui/helper'
import { EditorUI, EditorWrapper } from '@remix-ui/editor';
import * as packageJson from '../../../../../package.json';
import React from 'react';
import { EventManager } from '@remix-project/remix-lib';
import { LayoutState } from '@remix-ui/panel';
import { commitChange } from '@remix-api';

const profile = {
  displayName: 'Editor',
  name: 'editor',
  description: 'Tabbed Editor plugin',
  version: packageJson.version,
  methods: ['highlight', 'discardHighlight', 'clearAnnotations', 'addLineText', 'discardLineTexts', 'addAnnotation', 'gotoLine', 'revealRange', 'getCursorPosition', 'open', 'addModel','addErrorMarker', 'clearErrorMarkers', 'getText', 'getPositionAt', 'openReadOnly'],
};

interface EditorPluginState {
  
}

export class Editor extends Plugin {
  dispatch: ((state: EditorPluginState) => void) | null = null;
  layout: LayoutState;
  event: any;
  activated: boolean;
  constructor() {
    super(profile);
    this.dispatch = null;
    this.event = new EventManager()
  }


  async onActivation () {
    this.activated = true
    /*
    this.on('sidePanel', 'focusChanged', (name) => {
      this.keepDecorationsFor(name, 'sourceAnnotationsPerFile')
      this.keepDecorationsFor(name, 'markerPerFile')
    })
    this.on('sidePanel', 'pluginDisabled', (name) => {
      this.clearAllDecorationsFor(name)
    })
    this.on('theme', 'themeLoaded', (theme) => {
      this.currentThemeType = theme.quality
      this.renderComponent()
    })
    this.on('fileManager', 'noFileSelected', async () => {
      this.currentFile = null
      this.renderComponent()
    })
    try {
      this.currentThemeType = (await this.call('theme', 'currentTheme')).quality
    } catch (e) {
      console.log('unable to select the theme ' + e.message)
    }
    */
    this.renderComponent()
  }

  async discardLineTexts() {
  }

  async clearErrorMarkers() {
  }

  async revealLine(line: number, column: number) {
    //this.layout.revealLine(line, column);
  }

  async revealRange(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {
    //this.layout.revealRange(startLineNumber, startColumn, endLineNumber, endColumn);
  }
  async getCursorPosition() {
    //return this.layout.getCursorPosition();
  }
  async getText() {
    //return this.layout.getText();
  }
  async getPositionAt(line: number, column: number) {
    //return this.layout.getPositionAt(line, column);
  }
  async highlight(line: number, column: number) {
    //this.layout.highlight(line, column);
  }
  async discardHighlight() {
    //this.layout.discardHighlight();
  }

  async addLineText(line: number, text: string) {
    //this.layout.addLineText(line, text);
  }

  async clearAnnotations() {
    //this.layout.clearAnnotations();
  }

  async addAnnotation(line: number, text: string) {
    //this.layout.addAnnotation(line, text);
  }

  async gotoLine(line: number) {
    //this.layout.gotoLine(line);
  }

  async addErrorMarker(line: number, text: string) {
    //this.layout.addErrorMarker(line, text);
  }

  async openReadOnly(path: string, content: string) {
    const label = path.split('/').pop();
  
    this.layout.openTab({
      id: path,
      label,
      type: 'editor',
      content: <EditorWrapper filePath={path} content={content} language="solidity" />
    });
  
    this.layout.focusTab(path);
  }


ß
  async focus() {
    //this.layout.focusTab(this.layout.activeTab);
  }

  async open(path: string, content: string) {
    console.log('open editor', path, content, this.layout);
    const label = path.split('/').pop();
  
    this.layout.openTab({
      id: path,
      label,
      type: 'editor',
      content: <EditorWrapper filePath={path} content={content} language="solidity" />
    });
  
    this.layout.focusTab(path);
  }

  get(path: string): string | undefined {
    const panel = this.layout.panels.find(panel =>
      panel.tabs.some(tab => tab.id === path)
    );
    const tab = panel?.tabs.find(tab => tab.id === path);
  
    // Assuming the content is a React element like <EditorWrapper ... />
    if (tab?.content?.props?.filePath === path) {
      return tab.content?.props?.content; // original content loaded
    }
    return undefined;
  }

  discard(path: string): void {
    //delete this.editorInstances[path];
    // Optionally remove the tab:
    this.layout.closeTab(path);
  }

  async openDiff(change: commitChange): Promise<void> {
    const { path, original, modified } = change;
  
    this.layout.openTab({
      id: `diff-${path}`,
      label: `Diff: ${path.split('/').pop()}`,
      type: 'diff',
      content: (
        <EditorWrapper
          filePath={path}
          content={modified}
          language="solidity"
          diffContent={original}
          mode="diff"
        />
      ),
    });
  
    this.layout.focusTab(`diff-${path}`);
  }

  async current(): Promise<string | null> {
    if (!this.layout || !this.layout.panels) return '';
    const focusedGroup = this.layout.panels.find(
      (panel) => panel.id === this.layout.focusedGroupId
    );
  
    if (!focusedGroup) return '';
  
    const tab = focusedGroup.tabs.find((t) => t.id === focusedGroup.activeTabId);
    return tab?.id ?? '';
  }

  renderComponent () {
    this.dispatch({
    })
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch;
  }

  updateComponent() {
    return <EditorUI plugin={this} />;
  }

  render() {
    return <PluginViewWrapper plugin={this} />;
  }
}

export type EditorPluginType = InstanceType<typeof Editor>;