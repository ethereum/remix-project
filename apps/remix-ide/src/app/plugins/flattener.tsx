import { ViewPlugin } from '@remixproject/engine-web'
import { FlattenerAPI, FlattenerUI } from '@remix-ui/flattener'
import React from 'react' // eslint-disable-line
import { customAction } from '@remixproject/plugin-api'
import { concatSourceFiles, getDependencyGraph } from "./flattener/index";
import copy from 'copy-to-clipboard';
import { PluginViewWrapper } from '@remix-ui/helper';


const profile = {
  name: 'flattener',
  displayName: 'Flattener',
  description: 'Flattens compiled smart contracts',
  methods: ["flattenFileCustomAction"],
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/flattener.html',
  version: '0.0.1',
  icon: 'assets/img/flattener-logo.webp',
  events: [],
  maintainedBy: 'Remix'
}

export class Flattener extends ViewPlugin implements FlattenerAPI {
  autoFlatten = false
  compilationTarget: string = ''
  flattenedSources: string = ''
  compilationResult: any = null
  fileName: string = ''
  flatFileName: string = ''
  dispatch: any = null

  constructor() {
    super(profile)
    this.dispatch = null
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
    this.renderComponent()
  }


  onActivation = () => {
    this.setCompilationListener()
  }

  flattenFile = async (file: string) => {

    try {
      await this.call('fileManager', 'readFile', file)
      this.emit("statusChanged", {
        key: "loading",
        type: "info",
        title: "Verifying ...",
      })

      this.autoFlatten = true
      console.log('auto file', file)
      this.call('solidity', 'compile', file)
    } catch (e) {
      this.call('notification', 'alert', {
        id: 'flattener',
        message: `${file} does not exist!`
      })
    }
  }

  flatten = async () => {

    const ast = this.compilationResult.data.sources;
    const sources = this.compilationResult.source.sources;

    const dependencyGraph = getDependencyGraph(ast, this.compilationTarget);

    const sortedFiles = dependencyGraph.isEmpty()
      ? [this.compilationTarget]
      : dependencyGraph.sort().reverse();


    this.flattenedSources = concatSourceFiles(sortedFiles, sources)
    this.flatFileName = this.getFlattenedFilePath()
    this.fileName = this.compilationTarget
    this.renderComponent()

    this.emit('statusChanged', { key: 'succeed', type: 'success', title: 'Contract flattened' })
    this.call('notification', 'toast', 'Contract flattened and copied to clipboard')
    copy(this.flattenedSources)

  }
  flattenAndSave = async () => {
    await this.flatten()
    await this.save()
  }

  getFlattenedFilePath = () => {
    const filePathTokens = this.compilationTarget.split('/');
    const fileNameWithExtension = filePathTokens[filePathTokens.length - 1];
    const path = filePathTokens.slice(0, filePathTokens.length - 1).join('/');
    const fileNameTokens = fileNameWithExtension.split('.');
    const flattenedFilePath = `${path}/${fileNameTokens[0]}_flat.sol`;
    return flattenedFilePath
  }


  save = async () => {
    try {
      await this.call('fileManager', 'writeFile', this.getFlattenedFilePath(), this.flattenedSources);
      this.emit('statusChanged', { key: 'succeed', type: 'success', title: 'File saved' });
      this.call('notification', 'toast', 'File saved')
      await this.call('fileManager', 'open', this.getFlattenedFilePath())
    } catch (e) {
      console.log('error', e)
      this.call('notification', 'alert', {
        id: 'flattener',
        message: `Error saving file: ${e}`
      })
    }
  }

  flattenFileCustomAction = async (action: customAction) => {
    if (!action.path[0]) return
    await this.flattenFile(action.path[0])
  }


  setCompilationListener = () => {
    const plugin = this
    this.on(
      "solidity",
      "compilationFinished",
      async function (target, source, version, data) {
        plugin.emit('statusChanged', { key: 'none' })

        plugin.flatFileName = ''
        plugin.fileName = target

        plugin.renderComponent()


        plugin.compilationTarget = target
        plugin.flattenedSources = ''
        plugin.compilationResult = { data, source };

        if (plugin.autoFlatten) {
          plugin.autoFlatten = false
          await plugin.flattenAndSave()
        }
      }
    )
  }


  updateComponent(state) {
    return <FlattenerUI plugin={state.plugin}></FlattenerUI>
  }

  render() {
    return <div id='staticAnalyserView'><PluginViewWrapper plugin={this} /></div>
  }


  renderComponent() {
    this.dispatch && this.dispatch({
      plugin: this
    })
  }


}