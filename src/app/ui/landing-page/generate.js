/* global */
import LandingPage from './landing-page'
import Section from './section'
import { defaultWorkspaces } from './workspace'
var globalRegistry = require('../../../global/registry')

export function homepageProfile () {
  return {
    displayName: 'Home',
    name: 'home',
    methods: [],
    events: [],
    description: ' - ',
    icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxnPjxwYXRoIGQ9IiAgIE0yNSwxQzExLjc0NSwxLDEsMTEuNzQ1LDEsMjVzMTAuNzQ1LDI0LDI0LDI0czI0LTEwLjc0NSwyNC0yNFMzOC4yNTUsMSwyNSwxTDI1LDF6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PHBhdGggZD0iICBNNDAuNjk2LDYuODMyYzAsMC0xMy4xNjksOC4yMTItMTEuNTMyLDIyLjMzMmMxLjE0Miw5Ljg1OCwxMS45MzUsMTMuMzc3LDExLjkzNSwxMy4zNzciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNNy4zODUsOC45MTNjMCwwLDMuMDQxLDYuNDc2LDMuMDQxLDE4LjE2OWMwLDkuMjQ2LTMuNTgzLDEyLjkxMS0zLjU4MywxMi45MTEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNMS44NTIsMjIuOTMyYzAsMCw2LjQ5Myw2LjIzMiwyMy4xNDgsNi4yMzJzMjMuNDM4LTYuMjQ2LDIzLjQzOC02LjI0NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyLjA1ODMiLz48cGF0aCBkPSIgIE0yNS42NDgsMS41NDhjMCwwLTYuODk1LDcuOTM1LTYuODk1LDIzLjQ1MkMxOC43NTQsNDAuNTE4LDI1LDQ4LjYyNSwyNSw0OC42MjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PC9zdmc+',
    prefferedLocation: 'mainPanel'
  }
}

export function generateHomePage (appManager, appStore) {
  var actions1 = [
    { label: 'New file',
      type: 'callback',
      payload: () => {
        let fileManager = globalRegistry.get('fileexplorerbrowser').api
        fileManager.creatNewFile()
      }
    },
    {label: 'Import from GitHub', type: `callback`, payload: () => { this.alert(`-imported from GitHub-`) }},
    {label: 'Import from gist', type: `callback`, payload: () => { this.alert(`-imported from gist-`) }}
  ]

  var actions3 = [
    {label: 'Remix documentation', type: `link`, payload: `https://remix.readthedocs.io/en/latest/#`},
    {label: 'GitHub repository', type: `link`, payload: `https://github.com/ethereum/remix-ide`},
    {label: 'Access local file system with remixd', type: `link`, payload: `https://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html`},
    {label: 'npm module for remixd', type: `link`, payload: `https://www.npmjs.com/package/remixd`},
    {label: 'Medium posts', type: `link`, payload: `https://medium.com/remix-ide`},
    {label: 'Tutorials', type: `link`, payload: `https://github.com/ethereum/remix-workshops`}
  ]

  var actions4 = [
    {label: 'Remix plugins & modules', type: `link`, payload: `https://github.com/ethereum/remix-plugin/blob/master/readme.md`},
    {label: 'Repository on GitHub', type: `link`, payload: `https://github.com/ethereum/remix-plugin`},
    {label: 'Examples', type: `link`, payload: `https://github.com/ethereum/remix-plugin/tree/master/examples`},
    {label: 'Build a plugin for Remix', type: `link`, payload: `https://medium.com/remix-ide/build-a-plugin-for-remix-90d43b209c5a`}
  ]

  var actions5 = [
    {label: 'Gitter channel', type: `link`, payload: `https://gitter.im/ethereum/remix`},
    {label: 'Stack Overflow', type: `link`, payload: `https://stackoverflow.com/questions/tagged/remix`},
    {label: 'Reddit', type: `link`, payload: `https://www.reddit.com/r/ethdev/search?q=remix&restrict_sr=1`}
  ]

  var sectionStart = new Section('Start', actions1)
  var sectionLearn = new Section('Learn', actions3)
  var sectionPlugins = new Section('Plugins', actions4)
  var sectionHelp = new Section('Help', actions5)

  var sectionsWorkspaces = []
  sectionsWorkspaces.push({
    label: 'Close All Modules',
    type: 'callback',
    payload: () => {
      appStore.getActives()
      .filter(({profile}) => !profile.required)
      .forEach((profile) => { appManager.deactivateOne(profile.name) })
    }})
  defaultWorkspaces(appManager).forEach((workspace) => {
    sectionsWorkspaces.push({
      label: workspace.title,
      type: 'callback',
      payload: () => { workspace.activate() }
    })
  })
  var sectionWorkspace = new Section('Workspaces', sectionsWorkspaces)

  return new LandingPage([sectionWorkspace, sectionStart, sectionLearn, sectionPlugins, sectionHelp])
}
