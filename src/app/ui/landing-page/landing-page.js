var yo = require('yo-yo')
var csjs = require('csjs-inject')
var css = csjs`
  .container        {
    position        : static;

    box-sizing      : border-box;

    display         : flex;
    flex-direction  : column;
    flex-wrap       : wrap;
    align-items     : center;
    align-content   : space-around;
    
    border          : 2px solid black;
    width           : 400px;
    padding         : 50px;
    font-family     : "Lucida Console", Monaco, monospace;
  }
  .logo             {
    position        : absolute;
    opacity         : 0.3;
    z-index         : 0;
  }
  .section          {
    z-index         : 10;
  }
`

import { defaultWorkspaces } from './workspace'
import { ApiFactory } from 'remix-plugin'
import Section from './section'

export class LandingPage extends ApiFactory {

  constructor (appManager, appStore) {
    super()
    /*
    var actions1 = [
      {label: 'new file', type: `callback`, payload: () => { alert(`-new file created-`) }},
      {label: 'import from GitHub', type: `callback`, payload: () => { alert(`-imported from GitHub-`) }},
      {label: 'import from gist', type: `callback`, payload: () => { alert(`-imported from gist-`) }}
    ]

    var actions2 = [
      {label: '...', type: `callback`, payload: () => { alert(`-...-`) }}
    ]

    var actions3 = [
      {label: 'Remix documentation', type: `link`, payload: `https://remix.readthedocs.io/en/latest/#`},
      {label: 'GitHub repository', type: `link`, payload: `https://github.com/ethereum/remix-ide`},
      {label: 'acces local file system (remixd)', type: `link`, payload: `https://remix.readthedocs.io/en/latest/tutorial_remixd_filesystem.html`},
      {label: 'npm module for remixd', type: `link`, payload: `https://www.npmjs.com/package/remixd`},
      {label: 'medium posts', type: `link`, payload: `https://medium.com/remix-ide`},
      {label: 'tutorials', type: `link`, payload: `https://github.com/ethereum/remix-workshops`}
    ]

    var actions4 = [
      {label: 'Remix plugins & modules', type: `link`, payload: `https://github.com/ethereum/remix-plugin/blob/master/readme.md`},
      {label: 'repository on GitHub', type: `link`, payload: `https://github.com/ethereum/remix-plugin`},
      {label: 'examples', type: `link`, payload: `https://github.com/ethereum/remix-plugin/tree/master/examples`},
      {label: 'build plugin for Remix', type: `link`, payload: `https://medium.com/remix-ide/build-a-plugin-for-remix-90d43b209c5a`}
    ]

    var actions5 = [
      {label: 'Gitter channel', type: `link`, payload: `https://gitter.im/ethereum/remix`},
      {label: 'Stack Overflow', type: `link`, payload: `https://stackoverflow.com/questions/tagged/remix`},
      {label: 'Reddit', type: `link`, payload: `https://www.reddit.com/r/ethdev/search?q=remix&restrict_sr=1`}
    ]

    var section1 = new Section('Start', actions1)
    var section2 = new Section('Recent', actions2)
    var section3 = new Section('Learn', actions3)
    var section4 = new Section('Plugins', actions4)
    var section5 = new Section('Help', actions5)
    */
    const sectionsWorkspaces = []
    sectionsWorkspaces.push({
      label: 'Close All Modules',
      type: 'callback',
      payload: () => {
        appStore.getActives()
        .filter(({profile}) => !profile.required)
        .forEach((profile) => { appManager.deactivateOne(profile.name) })
      }})
    defaultWorkspaces(appManager).forEach((workspace) => {
      sectionsWorkspaces.push({label: workspace.title, type: 'callback', payload: () => { workspace.activate() }})
    })
    const sectionWorkspace = new Section('Workspaces', sectionsWorkspaces)
    this.sections = sectionWorkspace
  }

  get profile () {
    return {
      displayName: 'home',
      name: 'home',
      methods: [],
      events: [],
      description: ' - ',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxnPjxwYXRoIGQ9IiAgIE0yNSwxQzExLjc0NSwxLDEsMTEuNzQ1LDEsMjVzMTAuNzQ1LDI0LDI0LDI0czI0LTEwLjc0NSwyNC0yNFMzOC4yNTUsMSwyNSwxTDI1LDF6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PHBhdGggZD0iICBNNDAuNjk2LDYuODMyYzAsMC0xMy4xNjksOC4yMTItMTEuNTMyLDIyLjMzMmMxLjE0Miw5Ljg1OCwxMS45MzUsMTMuMzc3LDExLjkzNSwxMy4zNzciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNNy4zODUsOC45MTNjMCwwLDMuMDQxLDYuNDc2LDMuMDQxLDE4LjE2OWMwLDkuMjQ2LTMuNTgzLDEyLjkxMS0zLjU4MywxMi45MTEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNMS44NTIsMjIuOTMyYzAsMCw2LjQ5Myw2LjIzMiwyMy4xNDgsNi4yMzJzMjMuNDM4LTYuMjQ2LDIzLjQzOC02LjI0NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyLjA1ODMiLz48cGF0aCBkPSIgIE0yNS42NDgsMS41NDhjMCwwLTYuODk1LDcuOTM1LTYuODk1LDIzLjQ1MkMxOC43NTQsNDAuNTE4LDI1LDQ4LjYyNSwyNSw0OC42MjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PC9zdmc+',
      location: 'mainPanel'
    }
  }

  render () {
    var totalLook = yo`
      <div class="${css.container}">
        <img src="icon.png" class="${css.logo}" />
      </div>
    `
    for (var i = 0; i < this.sections.length; i++) {
      totalLook.appendChild(yo`
                <div class="${css.section}" > 
                    ${this.sections[i].render()}
                </div>
              `)
    }
    return totalLook
  }
}
