var yo = require('yo-yo')
var csjs = require('csjs-inject')

const FilePanel = require('../panels/file-panel')
const CompileTab = require('../tabs/compile-tab')
const SettingsTab = require('../tabs/settings-tab')
const AnalysisTab = require('../tabs/analysis-tab')
const DebuggerTab = require('../tabs/debugger-tab')
const SupportTab = require('../tabs/support-tab')
const TestTab = require('../tabs/test-tab')
const RunTab = require('../tabs/run-tab')

var registry = require('../../global/registry')

// const styleguide = require('../ui/styles-guide/theme-chooser')
// const styles = styleguide.chooser()

const PluginManagerProxy = require('./plugin-manager-proxy')

const EventEmitter = require('events')

class PluginManagerComponent {

  constructor ({ app, udapp, fileManager, sourceHighlighters, config, txListener }) {
    this.event = new EventEmitter()
    this.modulesDefinition = {
      // service module. They can be seen as daemon
      // they usually don't have UI and only represent the minimal API a plugins can access.
      'App': { name: 'App', target: app },
      'Udapp': { name: 'Udapp', target: udapp },
      'FileManager': { name: 'FileManager', target: fileManager },
      'SourceHighlighters': { name: 'SourceHighlighters', target: sourceHighlighters },
      'Config': { name: 'Config', target: config },
      'TxListener': { name: 'TxListener', target: txListener },
      // internal components. They are mostly views, they don't provide external API for plugins
      'SolidityCompile': { name: 'SolidityCompile', class: 'evm-compiler', Type: CompileTab, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik00NiwxNXYtNCAgYzAtMS4xMDQtMC44OTYtMi0yLTJjMCwwLTI0LjY0OCwwLTI2LDBjLTEuNDY5LDAtMi40ODQtNC00LTRIM0MxLjg5Niw1LDEsNS44OTYsMSw3djR2Mjl2NGMwLDEuMTA0LDAuODk2LDIsMiwyaDM5ICBjMS4xMDQsMCwyLTAuODk2LDItMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTEsNDRsNS0yNyAgYzAtMS4xMDQsMC44OTYtMiwyLTJoMzljMS4xMDQsMCwyLDAuODk2LDIsMmwtNSwyNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+' },
      'FilePanel': { name: 'FilePanel', Type: FilePanel, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwb2x5bGluZSBmaWxsPSJub25lIiBwb2ludHM9IjQ0LDIxIDQ0LDQ5IDYsNDkgICA2LDIxICIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlsaW5lIGZpbGw9Im5vbmUiIHBvaW50cz0iMTksNDkgMTksMjggMzEsMjggICAzMSw0OSAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwb2x5Z29uIHBvaW50cz0iMzUsNSAzNSw4LjAxNiAzNywxMC4wOTQgMzcsNyAzOSw3IDM5LDEyLjIwMyA0MSwxNC4yNjYgNDEsNSAiLz48cG9seWxpbmUgZmlsbD0ibm9uZSIgcG9pbnRzPSIgIDEuMTEsMjUuOTQyIDI1LDEuMDUzIDQ4Ljg5LDI1Ljk0MyAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==' },
      'Test': { name: 'Test', dep: 'SolidityCompile', Type: TestTab, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik00OSw0djI1YzAsMC01LjI3MywzLTEyLDMgIGMtMTEuOTI5LDAtMTUuODY5LTQtMjQtNFMxLDMwLDEsMzBWM2MwLDAsMi4wODUtMiwxMi0yczE0LjA0Nyw2LDI0LDZDNDMuMjgxLDcsNDguMTMsNC40NzEsNDksNHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIgeDE9IjEiIHgyPSIxIiB5MT0iMyIgeTI9IjQ5Ii8+PC9zdmc+' },
      'Run': { name: 'Run', Type: RunTab, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik00My43MzQsMjFjLTMuNjMxLDAtMTUuMDkyLDAtMTUuMDkyLDAgIFMxNi4yNSw1LjE4OCwxNi4wNDcsNC45MzhzLTAuNDIyLTAuNTk0LTEuMTI1LTAuNjcyYy0wLjg1OS0wLjA5NS0xLjk2OS0wLjIwMy0yLjMyOC0wLjIzNGMtMC40MDYtMC4wMzUtMC43MTksMC4xNDEtMC40OTYsMC43MzQgIEMxMi4zODgsNS41MzksMTguNzQ4LDIxLDE4Ljc0OCwyMUg2LjAzNGMwLDAtMi40NTgtNC43MjItMi44NzgtNS41MzFDMi45NjUsMTUuMTAxLDIuNTU3LDE1LjAxNCwyLDE1SDEuMjk3ICBjLTAuMTI1LDAtMC4zMTIsMC0wLjI4MSwwLjM0NEMxLjA1OCwxNS44MTEsMywyNSwzLDI1cy0xLjg4OCw5LjE5Ny0xLjk4NCw5LjY1NkMwLjk1MywzNC45NTMsMS4xNzIsMzUsMS4yOTcsMzVIMiAgYzAuOTY2LTAuMDA5LDAuOTU0LTAuMDc5LDEuMTU2LTAuNDY5QzMuNTc2LDMzLjcyMiw2LjAzNCwyOSw2LjAzNCwyOWgxMi43MTRjMCwwLTYuMzYsMTUuNDYxLTYuNjUsMTYuMjM0ICBjLTAuMjIzLDAuNTk0LDAuMDksMC43NywwLjQ5NiwwLjczNGMwLjM1OS0wLjAzMSwxLjQ2OS0wLjEzOSwyLjMyOC0wLjIzNGMwLjcwMy0wLjA3OCwwLjkyMi0wLjQyMiwxLjEyNS0wLjY3MlMyOC42NDMsMjksMjguNjQzLDI5ICBzMTEuNDYxLDAsMTUuMDkyLDBjMy43NjYsMCw1LjI2NC0zLjAzMSw1LjI2NC00UzQ3LjQ4NCwyMSw0My43MzQsMjF6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+' },
      'SolidityStaticAnalysis': { name: 'SolidityStaticAnalysis', Type: AnalysisTab, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxjaXJjbGUgY3g9IjIiIGN5PSIyNSIgcj0iMiIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTkiIHI9IjIiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjExIiByPSIyIi8+PGNpcmNsZSBjeD0iMzUiIGN5PSIxNyIgcj0iMiIvPjxjaXJjbGUgY3g9IjQ4IiBjeT0iNSIgcj0iMiIvPjxjaXJjbGUgY3g9IjIiIGN5PSIzOSIgcj0iMiIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iNDEiIHI9IjIiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjMzIiByPSIyIi8+PGNpcmNsZSBjeD0iMzUiIGN5PSI0MyIgcj0iMiIvPjxjaXJjbGUgY3g9IjQ4IiBjeT0iMzEiIHI9IjIiLz48cG9seWxpbmUgZmlsbD0ibm9uZSIgcG9pbnRzPSIyLDI1IDE1LDE5IDI1LDExICAgMzUsMTcgNDgsNSAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwb2x5bGluZSBmaWxsPSJub25lIiBwb2ludHM9IjIsMzkgMTUsNDEgMjUsMzMgICAzNSw0MyA0OCwzMSAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==' },
      'Debugger': { name: 'Debugger', Type: DebuggerTab, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik00NiwxNXYtNCAgYzAtMS4xMDQtMC44OTYtMi0yLTJjMCwwLTI0LjY0OCwwLTI2LDBjLTEuNDY5LDAtMi40ODQtNC00LTRIM0MxLjg5Niw1LDEsNS44OTYsMSw3djR2Mjl2NGMwLDEuMTA0LDAuODk2LDIsMiwyaDM5ICBjMS4xMDQsMCwyLTAuODk2LDItMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTEsNDRsNS0yNyAgYzAtMS4xMDQsMC44OTYtMiwyLTJoMzljMS4xMDQsMCwyLDAuODk2LDIsMmwtNSwyNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+' },
      'Support': { name: 'Support', Type: SupportTab, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik0zMC45MzMsMzIuNTI4Yy0wLjE0Ni0xLjYxMi0wLjA5LTIuNzM3LTAuMDktNC4yMWMwLjczLTAuMzgzLDIuMDM4LTIuODI1LDIuMjU5LTQuODg4YzAuNTc0LTAuMDQ3LDEuNDc5LTAuNjA3LDEuNzQ0LTIuODE4ICBjMC4xNDMtMS4xODctMC40MjUtMS44NTUtMC43NzEtMi4wNjVjMC45MzQtMi44MDksMi44NzQtMTEuNDk5LTMuNTg4LTEyLjM5N2MtMC42NjUtMS4xNjgtMi4zNjgtMS43NTktNC41ODEtMS43NTkgIGMtOC44NTQsMC4xNjMtOS45MjIsNi42ODYtNy45ODEsMTQuMTU2Yy0wLjM0NSwwLjIxLTAuOTEzLDAuODc4LTAuNzcxLDIuMDY1YzAuMjY2LDIuMjExLDEuMTcsMi43NzEsMS43NDQsMi44MTggIGMwLjIyLDIuMDYyLDEuNTgsNC41MDUsMi4zMTIsNC44ODhjMCwxLjQ3MywwLjA1NSwyLjU5OC0wLjA5MSw0LjIxQzE5LjM2NywzNy4yMzgsNy41NDYsMzUuOTE2LDcsNDVoMzggIEM0NC40NTUsMzUuOTE2LDMyLjY4NSwzNy4yMzgsMzAuOTMzLDMyLjUyOHoiLz48L3N2Zz4=' },
      'PluginManager': { name: 'PluginManager', target: this, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9IiAgTTMyLDM1YzAsMCw4LjMxMiwwLDkuMDk4LDBDNDUuNDYzLDM1LDQ5LDMxLjQ2Myw0OSwyNy4wOTlzLTMuNTM3LTcuOTAyLTcuOTAyLTcuOTAyYy0wLjAyLDAtMC4wMzgsMC4wMDMtMC4wNTgsMC4wMDMgIGMwLjA2MS0wLjQ5NCwwLjEwMy0wLjk5NCwwLjEwMy0xLjUwNGMwLTYuNzEtNS40MzktMTIuMTUtMTIuMTUtMTIuMTVjLTUuMjI5LDAtOS42NzIsMy4zMDktMTEuMzg2LDcuOTQxICBjLTEuMDg3LTEuMDg5LTIuNTkxLTEuNzY0LTQuMjUxLTEuNzY0Yy0zLjMxOSwwLTYuMDA5LDIuNjktNi4wMDksNi4wMDhjMCwwLjA4NSwwLjAxLDAuMTY3LDAuMDEzLDAuMjUxICBDMy42OTUsMTguOTk1LDEsMjIuMzQ0LDEsMjYuMzMxQzEsMzEuMTE5LDQuODgxLDM1LDkuNjcsMzVjMC44MjcsMCw4LjMzLDAsOC4zMywwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48cG9seWxpbmUgZmlsbD0ibm9uZSIgcG9pbnRzPSIzMCw0MSAyNSw0NiAyMCw0MSAgICIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIiB4MT0iMjUiIHgyPSIyNSIgeTE9IjI2IiB5Mj0iNDUuNjY4Ii8+PC9zdmc+' },
      'Settings': { name: 'Settings', Type: SettingsTab, icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik00OSwyNy45NTR2LTZsLTcuMTQxLTEuMTY3ICBjLTAuNDIzLTEuNjkxLTEuMDg3LTMuMjgxLTEuOTYyLTQuNzM3bDQuMTYyLTUuOTMybC00LjI0My00LjI0MWwtNS44NTYsNC4yMWMtMS40Ni0wLjg4NC0zLjA2LTEuNTU4LTQuNzYzLTEuOTgybC0xLjI0NS03LjEwNmgtNiAgbC0xLjE1Niw3LjA4M2MtMS43MDQsMC40MTgtMy4zMTMsMS4wODMtNC43NzcsMS45NjNMMTAuMTgsNS44NzNsLTQuMjQzLDQuMjQxbDQuMTA3LDUuODc0Yy0wLjg4OCwxLjQ3LTEuNTYzLDMuMDc3LTEuOTkyLDQuNzkyICBMMSwyMS45NTR2Nmw3LjA0NCwxLjI0OWMwLjQyNSwxLjcxMSwxLjEwMSwzLjMxOCwxLjk5Miw0Ljc5bC00LjE2Myw1LjgyM2w0LjI0MSw0LjI0NWw1Ljg4MS00LjExOSAgYzEuNDY4LDAuODgyLDMuMDczLDEuNTUyLDQuNzc3LDEuOTczbDEuMTgsNy4wODdoNmwxLjI2MS03LjEwNWMxLjY5NS0wLjQzLDMuMjk3LTEuMTA1LDQuNzUxLTEuOTlsNS45MjIsNC4xNTVsNC4yNDItNC4yNDUgIGwtNC4yMjctNS44N2MwLjg3NS0xLjQ1NiwxLjUzOS0zLjA0OCwxLjk1OC00LjczOUw0OSwyNy45NTR6IE0yNSwzM2MtNC40MTgsMC04LTMuNTgyLTgtOHMzLjU4Mi04LDgtOHM4LDMuNTgyLDgsOFMyOS40MTgsMzMsMjUsMzMgIHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==' }
    }
    this.activated = {} // list all activated modules
    // this.activated = [] // list all activated modules
    this.plugins = []
    this.data = {}
    this.data.proxy = new PluginManagerProxy()

    // This load the state from localstorage first then from the second parameter is nothing is found in localstorage
    // this.store = Store.fromLocal('***', {}) // Or EntityStore.fromLocal('***', {}, 'id')
  }

  proxy () {
    return this.data.proxy
  }

  initDefault () {
    this.activateInternal('App')
    this.activateInternal('Udapp')
    this.activateInternal('FileManager')
    this.activateInternal('SourceHighlighters')
    this.activateInternal('Config')
    this.activateInternal('TxListener')

    this.activateInternal('FilePanel')
    this.activateInternal('SolidityCompile')
    this.activateInternal('Run')
    this.activateInternal('PluginManager')
    this.activateInternal('Settings')
    this.activateInternal('Support')
  }

  render () {
    // var self = this
    // loop over all this.modules and this.plugins
    let pluginManagerDiv = yo`
      <div id='pluginManager' class=${css.plugins} >
      <h2>Plugin Manager</h2>
      </div>
    `
    for (var mod in this.modulesDefinition) {
      if (this.modulesDefinition[mod].icon) {
        pluginManagerDiv.appendChild(this.renderItem(mod))
      }
    }
    console.log(this.activated)
    return pluginManagerDiv
  }

  renderItem (item) {
    let ctrBtns

    let action = (event) => {
      if (this.activated.hasOwnProperty(item)) {
        this.deactivateInternal(item)
        event.target.innerHTML = 'activate'
      } else {
        this.activateInternal(item)
        event.target.innerHTML = 'deactivate'
      }
    }

    ctrBtns = yo`<div id='${item}Activation'>
        <button onclick=${(event) => { action(event) }} >${this.activated[item] ? 'deactivate' : 'activate'}</button>
        </div>`
    
    this.plugins.push(item)
    // var self = this
    this.view = yo`
      <div id='pluginManager' class=${css.plugin} >
        ${this.modulesDefinition[item].name}
        ${ctrBtns}
      </div>
    `
    return this.view
  }

  activatePlugin (jsonProfile, api) {
    // let profile = { json: jsonProfile, api }
    // let plugin = new Plugin(profile, api)
    // this.appManager.addPlugin(plugin)
    // this.event.emit('displayableModuleActivated', jsonProfile, plugin.render())
    // this.activated[jsonProfile.name] = plugin
  }

  deactivateInternal (name) {
    if (!this.activated[name]) return
    this.event.emit('removingItem', this.activated[name])
    delete this.activated[name]
  }

  activateInternal (name) {
    if (this.activated[name]) return
    const mod = this.modulesDefinition[name]
    let dep
    if (mod.dep) dep = this.activateInternal(mod.dep)
    let instance = mod.target
    if (!instance && mod.Type) instance = new mod.Type(registry, dep)
    if (!instance) return console.log(`PluginManagerComponent: no Type or instance to add: ${JSON.stringify(mod)}`)
    registry.put({api: instance, name: mod.name.toLocaleLowerCase()})
    if (instance.profile && typeof instance.profile === 'function') {
      this.event.emit('requestActivation', instance.profile(), instance)
    }
    if (mod.icon && instance.render && typeof instance.render === 'function') {
      this.event.emit('requestContainer', mod, instance.render())
    }
    // if of type evm-compiler, we forward to the internal components
    if (mod.class === 'evm-compiler') {
      this.data.proxy.register(mod, instance)
    }
    this.activated[mod.name] = mod    
    return instance
  }

  _activate (item) {
    this.event.emit('activation', item)
  }

  _deactivate (item) {
    this.event.emit('deactivation', item)
  }
}

module.exports = PluginManagerComponent

const css = csjs`
  .plugins {
    width          : 300px;
  }
  .plugin {
    border-bottom: 1px black solid;
    padding: 10px 20px;
    margin-bottom: 20px;
  }
  .plugItIn.active {
    display: block;
  }
  .plugin button {
    cursor: pointer;
  }
`
