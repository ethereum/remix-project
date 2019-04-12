let yo = require('yo-yo')
let csjs = require('csjs-inject')
let globalRegistry = require('../../../global/registry')
let CompilerImport = require('../../compiler/compiler-imports')
var modalDialogCustom = require('../modal-dialog-custom')
var tooltip = require('../tooltip')

let css = csjs`
  .sectionContainer {
    display         : flex;
    flex-direction  : column;
    flex-wrap       : wrap;
    align-content   : space-around;
    padding         : 20px;
    max-width       : 300px;
    min-height      : 200px;
    background-color: var(--light);
  }
  .landingPage {
    height          : 100%;
    width           : 100%;
    flex-wrap       : wrap;
    justify-content : space-evenly;
    user-select     : none;
  }
  .im {
    display         : grid;
    max-width       : 200px;
    max-height      : 200px;
    width           : 100%;
    height          : 100%;
    padding         : 20px;
    background-color: var(--bg-light);
    align-self      : center;
  }
  .im:hover {
  }
  .getStarted {
    margin-top      : 50px;
    width           : 100%;
    font-size       : xx-large;
    align-self      : center;
  }
  .text {
    cursor: pointer;
    font-weight: normal;
    max-width: 300px;
    user-select: none;
    color: var(--primary);
  }
  .text:hover {
    text-decoration: underline;
  }
  .jumbotronContainer {
    margin: 0 60px;
    width: 80%;
  }
  .thisJumboton {
    padding: 2.5rem 5rem;
  }
  .hpLogoContainer {
    margin:30px;
    padding-right: 90px;
  }
  .jumboBtnContainer {
    float: left;
    vertical-align: bottom;
    padding-top: 0px;
  }
  .headlineContainer {
    float: left;
    padding-right: 90px;
  }
  .hpSections {
    margin: 0 60px;
  }
  .solidityBtn {
    margin-right: 40px;
  }
  .labelIt {
    margin-bottom: 0;
  }
  .seeAll {
    margin-top: 7px;
  }

}
`

import { BaseApi } from 'remix-plugin'

const profile = {
  displayName: 'Home',
  name: 'home',
  methods: [],
  events: [],
  description: ' - ',
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxnPjxwYXRoIGQ9IiAgIE0yNSwxQzExLjc0NSwxLDEsMTEuNzQ1LDEsMjVzMTAuNzQ1LDI0LDI0LDI0czI0LTEwLjc0NSwyNC0yNFMzOC4yNTUsMSwyNSwxTDI1LDF6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PHBhdGggZD0iICBNNDAuNjk2LDYuODMyYzAsMC0xMy4xNjksOC4yMTItMTEuNTMyLDIyLjMzMmMxLjE0Miw5Ljg1OCwxMS45MzUsMTMuMzc3LDExLjkzNSwxMy4zNzciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNNy4zODUsOC45MTNjMCwwLDMuMDQxLDYuNDc2LDMuMDQxLDE4LjE2OWMwLDkuMjQ2LTMuNTgzLDEyLjkxMS0zLjU4MywxMi45MTEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNMS44NTIsMjIuOTMyYzAsMCw2LjQ5Myw2LjIzMiwyMy4xNDgsNi4yMzJzMjMuNDM4LTYuMjQ2LDIzLjQzOC02LjI0NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyLjA1ODMiLz48cGF0aCBkPSIgIE0yNS42NDgsMS41NDhjMCwwLTYuODk1LDcuOTM1LTYuODk1LDIzLjQ1MkMxOC43NTQsNDAuNTE4LDI1LDQ4LjYyNSwyNSw0OC42MjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PC9zdmc+',
  location: 'mainPanel'
}

export class LandingPage extends BaseApi {

  constructor (appManager, appStore) {
    super(profile)
    this.appStore = appStore
    this.appManager = appManager
  }

  get profile () {
    return {
      displayName: 'Home',
      name: 'home',
      methods: [],
      events: [],
      description: ' - ',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxnPjxwYXRoIGQ9IiAgIE0yNSwxQzExLjc0NSwxLDEsMTEuNzQ1LDEsMjVzMTAuNzQ1LDI0LDI0LDI0czI0LTEwLjc0NSwyNC0yNFMzOC4yNTUsMSwyNSwxTDI1LDF6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PHBhdGggZD0iICBNNDAuNjk2LDYuODMyYzAsMC0xMy4xNjksOC4yMTItMTEuNTMyLDIyLjMzMmMxLjE0Miw5Ljg1OCwxMS45MzUsMTMuMzc3LDExLjkzNSwxMy4zNzciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNNy4zODUsOC45MTNjMCwwLDMuMDQxLDYuNDc2LDMuMDQxLDE4LjE2OWMwLDkuMjQ2LTMuNTgzLDEyLjkxMS0zLjU4MywxMi45MTEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PHBhdGggZD0iICBNMS44NTIsMjIuOTMyYzAsMCw2LjQ5Myw2LjIzMiwyMy4xNDgsNi4yMzJzMjMuNDM4LTYuMjQ2LDIzLjQzOC02LjI0NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyLjA1ODMiLz48cGF0aCBkPSIgIE0yNS42NDgsMS41NDhjMCwwLTYuODk1LDcuOTM1LTYuODk1LDIzLjQ1MkMxOC43NTQsNDAuNTE4LDI1LDQ4LjYyNSwyNSw0OC42MjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMi4wNTgzIi8+PC9zdmc+',
      location: 'mainPanel'
    }
  }

  render () {
    let load = function (item) {
      let compilerImport = new CompilerImport()
      let fileProviders = globalRegistry.get('fileproviders').api
      modalDialogCustom.prompt(null, 'Enter the ' + item + ' you would like to load.', null, (target) => {
        if (target !== '') {
          compilerImport.import(
            target,
            (loadingMsg) => { tooltip(loadingMsg) },
            (error, content, cleanUrl, type, url) => {
              if (error) {
                modalDialogCustom.alert(error)
              } else {
                if (fileProviders[type]) {
                  fileProviders[type].addReadOnly(cleanUrl, content, url)
                }
              }
            }
          )
        }
      })
    }
    let logo = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNjEzLjM2NXB4IiBoZWlnaHQ9IjIwOS44NzNweCIgdmlld0JveD0iMjI3LjM4NyA5OS4wNTEgNjEzLjM2NSAyMDkuODczIg0KCSBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDIyNy4zODcgOTkuMDUxIDYxMy4zNjUgMjA5Ljg3MyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNNDM0LjU4MiwxNzYuMjA2YzAuODExLDAsMS42MjIsMC4yODUsMi40MzgsMC44NTNjMC44MTEsMC41NzEsMS4yMTcsMS4zNCwxLjIxNywyLjMxNA0KCQljMCwyLjI3Ni0xLjA1OSwzLjQ5Ni0zLjE2OCwzLjY1NWMtNS4wMzcsMC44MTQtOS4zODEsMi4zNTYtMTMuMDM2LDQuNjMxYy0zLjY1NSwyLjI3NS02LjY2Myw1LjExNi05LjAxNyw4LjUyNw0KCQljLTIuMzU2LDMuNDExLTQuMTA0LDcuMjcyLTUuMjM4LDExLjU3NWMtMS4xMzksNC4zMDctMS43MDcsOC44MTQtMS43MDcsMTMuNTI0djMyLjY1MmMwLDIuMjczLTEuMTM5LDMuNDExLTMuNDExLDMuNDExDQoJCWMtMi4yNzcsMC0zLjQxMi0xLjEzOC0zLjQxMi0zLjQxMXYtNzQuMzIyYzAtMi4yNzMsMS4xMzUtMy40MTEsMy40MTItMy40MTFjMi4yNzIsMCwzLjQxMSwxLjEzOCwzLjQxMSwzLjQxMXYxNS4xMDcNCgkJYzEuNDYzLTIuNDM3LDMuMjA3LTQuNzUyLDUuMjQtNi45NDVjMi4wMjgtMi4xOTIsNC4yNjQtNC4xNDMsNi43LTUuODQ4YzIuNDM4LTEuNzA2LDUuMDc2LTMuMDg1LDcuOTE5LTQuMTQzDQoJCUM0MjguNzcxLDE3Ni43MzQsNDMxLjY1OCwxNzYuMjA2LDQzNC41ODIsMTc2LjIwNnoiLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNNTAxLjc3MywxNzQuNWM1LjY4NSwwLDEwLjk2NiwxLjE4MSwxNS44MzgsMy41MzRjNC44NzUsMi4zNTUsOS4wNTYsNS40ODEsMTIuNTUxLDkuMzgxDQoJCWMzLjQ5MiwzLjg5OCw2LjIxNCw4LjQwNiw4LjE2NCwxMy41MjNjMS45NDksNS4xMTcsMi45MjQsMTAuNDQsMi45MjQsMTUuOTYxYzAsMC45NzctMC4zNjYsMS43OS0xLjA5OCwyLjQzOA0KCQljLTAuNzMsMC42NDktMS41ODIsMC45NzUtMi41NTksMC45NzVoLTY3Ljk4NmMwLjQ4Niw0LjIyNywxLjU4NCw4LjI4NSwzLjI4OSwxMi4xODVjMS43MDcsMy44OTgsMy45MzgsNy4zMTIsNi43MDEsMTAuMjMzDQoJCWMyLjc2MiwyLjkyNSw2LjAwOCw1LjI4MSw5Ljc0OCw3LjA2N2MzLjczNSwxLjc4OSw3Ljg3NywyLjY4MSwxMi40MjgsMi42ODFjMTIuMDIxLDAsMjEuMzYtNC43OSwyOC4wMjMtMTQuMzc3DQoJCWMwLjY0Ni0xLjEzNiwxLjYyMi0xLjcwNiwyLjkyNC0xLjcwNmMyLjI3MywwLDMuNDEyLDEuMTQsMy40MTIsMy40MTJjMCwwLjE2My0wLjE2NCwwLjczLTAuNDg2LDEuNzA1DQoJCWMtMy40MTIsNi4wMTMtOC4yMDUsMTAuNDc5LTE0LjM3NywxMy40MDJjLTYuMTc3LDIuOTI0LTEyLjY3Miw0LjM4Ny0xOS40OTYsNC4zODdjLTUuNjg4LDAtMTAuOTI4LTEuMTgxLTE1LjcxNy0zLjUzMw0KCQljLTQuNzkzLTIuMzU0LTguOTM3LTUuNDgyLTEyLjQyOS05LjM4MmMtMy40OTUtMy44OTktNi4yMTQtOC40MDctOC4xNjMtMTMuNTI0cy0yLjkyNC0xMC40MzctMi45MjQtMTUuOTYyDQoJCWMwLTUuNTIxLDAuOTc1LTEwLjg0NCwyLjkyNC0xNS45NjFzNC42NjgtOS42MjUsOC4xNjMtMTMuNTIzYzMuNDkyLTMuODk4LDcuNjM0LTcuMDI0LDEyLjQyOS05LjM4MQ0KCQlDNDkwLjg0NiwxNzUuNjgxLDQ5Ni4wODQsMTc0LjUsNTAxLjc3MywxNzQuNXogTTUzMy45MzksMjEzLjQ4OWMtMC4zMjgtNC4yMjMtMS4zNC04LjI4NC0zLjA0NS0xMi4xODQNCgkJYy0xLjcwNy0zLjg5OC0zLjk4Mi03LjMxMi02LjgyNC0xMC4yMzVjLTIuODQ0LTIuOTI0LTYuMTc0LTUuMjc2LTkuOTktNy4wNjZjLTMuODE5LTEuNzg1LTcuOTItMi42OC0xMi4zMDctMi42OA0KCQljLTQuNTQ5LDAtOC42OTEsMC44OTUtMTIuNDI4LDIuNjhjLTMuNzM4LDEuNzktNi45ODYsNC4xNDQtOS43NDgsNy4wNjZjLTIuNzY0LDIuOTI1LTQuOTk0LDYuMzM3LTYuNzAxLDEwLjIzNQ0KCQljLTEuNzA1LDMuODk4LTIuODAxLDcuOTYxLTMuMjg5LDEyLjE4NEg1MzMuOTM5eiIvPg0KCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik02NjguNjg5LDE3NC43NDNjNS4wMzUsMCw5LjUwNCwxLjAxOCwxMy40MDIsMy4wNDdjMy44OTksMi4wMzMsNy4xODksNC42NzIsOS44Nyw3LjkyDQoJCWMyLjY4MSwzLjI1MSw0LjcwOSw3LjA2NSw2LjA5MywxMS40NTJjMS4zNzksNC4zODcsMi4wNjksOC44NTUsMi4wNjksMTMuNDAxdjQzLjYyYzAsMC45NzYtMC4zNjUsMS43ODktMS4wOTcsMi40MzgNCgkJYy0wLjczLDAuNjQ2LTEuNTA0LDAuOTc1LTIuMzEzLDAuOTc1Yy0yLjI3NiwwLTMuNDExLTEuMTQtMy40MTEtMy40MTJ2LTQzLjYyYzAtMy41Ny0wLjUyOS03LjEwNC0xLjU4NS0xMC42DQoJCWMtMS4wNTktMy40OTEtMi42MDItNi42MTgtNC42My05LjM4MmMtMi4wMzMtMi43NjEtNC41OTItNC45NTMtNy42NzctNi41OGMtMy4wODgtMS42MjEtNi42NjItMi40MzctMTAuNzIyLTIuNDM3DQoJCWMtNS4yLDAtOS41ODgsMS4yMTktMTMuMTU5LDMuNjU0Yy0zLjU3NCwyLjQzOC02LjQ1Nyw1LjU2Ni04LjY1LDkuMzgyYy0yLjE5MiwzLjgxOS0zLjgxNyw4LjA0Mi00Ljg3NCwxMi42NzINCgkJYy0xLjA1OSw0LjYzMS0xLjU4NCw5LjA1OS0xLjU4NCwxMy4yOHYzMy42MjljMCwwLjk3Ni0wLjM2NSwxLjc4OS0xLjA5NiwyLjQzOGMtMC43MywwLjY0Ni0xLjUwNSwwLjk3NS0yLjMxNSwwLjk3NQ0KCQljLTIuMjc2LDAtMy40MTEtMS4xNC0zLjQxMS0zLjQxMnYtNDMuNjJjMC0zLjU3LTAuNTI5LTcuMTA0LTEuNTg0LTEwLjZjLTEuMDU5LTMuNDkxLTIuNjAyLTYuNjE4LTQuNjMtOS4zODINCgkJYy0yLjAzNC0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4Ny0xLjYyMS02LjY2My0yLjQzNy0xMC43MjMtMi40MzdjLTUuMDM2LDAtOS4zNDQsMC44OTYtMTIuOTE0LDIuNjgxDQoJCWMtMy41NzUsMS43OS02LjU0Miw0LjI2Ni04Ljg5Niw3LjQzM2MtMi4zNTYsMy4xNjctNC4wNjIsNi45NDQtNS4xMTYsMTEuMzMxYy0xLjA2LDQuMzg2LTEuNTg0LDkuMS0xLjU4NCwxNC4xMzR2My44OTl2MC4yNDMNCgkJdjMyLjg5NmMwLDIuMjcyLTEuMTM5LDMuNDEyLTMuNDEyLDMuNDEyYy0yLjI3NiwwLTMuNDEyLTEuMTQtMy40MTItMy40MTJ2LTc0LjU2NmMwLTIuMjczLDEuMTM2LTMuNDExLDMuNDEyLTMuNDExDQoJCWMyLjI3MiwwLDMuNDEyLDEuMTM4LDMuNDEyLDMuNDExdjEyLjQyOGMyLjkyNC01LjE5Nyw2Ljg2LTkuMzgyLDExLjgxOC0xMi41NWM0Ljk1NC0zLjE2NywxMC41MTgtNC43NTIsMTYuNjkxLTQuNzUyDQoJCWM2Ljk4NCwwLDEyLjk5NiwxLjk5LDE4LjAzMyw1Ljk3YzUuMDMyLDMuOTgzLDguNjg4LDkuMjIzLDEwLjk2NSwxNS43MTljMi43NjEtNi4zMzYsNi43NC0xMS41MzMsMTEuOTQtMTUuNTk2DQoJCUM2NTUuMTI1LDE3Ni43NzYsNjYxLjM4LDE3NC43NDMsNjY4LjY4OSwxNzQuNzQzeiIvPg0KCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik03NDIuNzUzLDE3Ni42OTNjMC44MTIsMCwxLjU4NCwwLjM2NSwyLjMxMywxLjA5OGMwLjczMSwwLjcyOSwxLjA5OCwxLjUwNCwxLjA5OCwyLjMxM3Y3NC4wOA0KCQljMCwwLjgxNC0wLjM2NSwxLjU4NC0xLjA5OCwyLjMxNWMtMC43MjksMC43MjktMS41MDQsMS4wOTctMi4zMTMsMS4wOTdjLTAuOTc2LDAtMS43OS0wLjM2Ni0yLjQzOC0xLjA5Nw0KCQljLTAuNjQ5LTAuNzMxLTAuOTc1LTEuNTAxLTAuOTc1LTIuMzE1di03NC4wOGMwLTAuODExLDAuMzI0LTEuNTg0LDAuOTc1LTIuMzEzQzc0MC45NjMsMTc3LjA1OSw3NDEuNzc3LDE3Ni42OTMsNzQyLjc1MywxNzYuNjkzeiINCgkJLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNODM3LjM0LDE3NS45NjJjMi4yNzMsMCwzLjQxMiwxLjEzOSwzLjQxMiwzLjQxMWwtMC40ODcsMS45NWwtMjQuMzY4LDM1LjMzNGwyNC4zNjgsMzUuNTc2DQoJCWMwLjMyMywwLjk3NywwLjQ4NywxLjYyNiwwLjQ4NywxLjk1YzAsMi4yNzItMS4xMzksMy40MTItMy40MTIsMy40MTJjLTEuMzAyLDAtMi4xOTMtMC40ODgtMi42OC0xLjQ2M2wtMjIuOTA2LTMzLjM4NA0KCQlsLTIyLjY2MywzMy4zODRjLTAuODEzLDAuOTc1LTEuNzksMS40NjMtMi45MjQsMS40NjNjLTIuMjc3LDAtMy40MTEtMS4xNC0zLjQxMS0zLjQxMmMwLTAuMzI0LDAuMTU5LTAuOTc1LDAuNDg2LTEuOTUNCgkJbDI0LjM2OS0zNS41NzZsLTI0LjM2OS0zNS4zMzRsLTAuNDg2LTEuOTVjMC0yLjI3MiwxLjEzNC0zLjQxMSwzLjQxMS0zLjQxMWMxLjEzNCwwLDIuMTA5LDAuNDg3LDIuOTI0LDEuNDYybDIyLjY2MywzMy4xNDENCgkJbDIyLjkwNi0zMy4xNDFDODM1LjE0NiwxNzYuNDQ5LDgzNi4wMzgsMTc1Ljk2Miw4MzcuMzQsMTc1Ljk2MnoiLz4NCjwvZz4NCjxnPg0KCTxnPg0KCQk8ZyBvcGFjaXR5PSIwLjQ1Ij4NCgkJCTxnPg0KCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMjI3LjM4NywyMTguNTgzIDI5My4yODgsMzA4LjkyNCAyOTMuMjg4LDI1Ni40NTkgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuOCI+DQoJCQk8Zz4NCgkJCQk8cG9seWdvbiBmaWxsPSIjMDEwMTAxIiBwb2ludHM9IjI5My4yODgsMjU2LjQ1OSAyOTMuMjg4LDMwOC45MjQgMzU5LjIyOSwyMTguNTgzIAkJCQkiLz4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBvcGFjaXR5PSIwLjYiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyOTMuMjg4LDE3Ni4yODUgMjI3LjM4NywyMDUuNDIzIDI5My4yODgsMjQzLjMxOSAzNTkuMTg4LDIwNS40MjMgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuNDUiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyMjcuMzg3LDIwNS40MjQgMjkzLjI4OCwyNDMuMzE5IDI5My4yODgsMTc2LjI4NiAyOTMuMjg4LDk5LjA1MiAJCQkJIi8+DQoJCQk8L2c+DQoJCTwvZz4NCgkJPGcgb3BhY2l0eT0iMC44Ij4NCgkJCTxnPg0KCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMjkzLjI4OCw5OS4wNTEgMjkzLjI4OCwxNzYuMjg1IDI5My4yODgsMjQzLjMxOSAzNTkuMTg4LDIwNS40MjMgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo='

    let learnMore = () => { tooltip('not implemented') }

    let closeAll = () => {
      this.appStore.getActives()
      .filter(({profile}) => !profile.required)
      .forEach((profile) => { this.appManager.deactivateOne(profile.name) })
    }
    let startSolidity = () => {
      closeAll()
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('run')
      this.appManager.ensureActivated('solidityStaticAnalysis')
      this.appManager.ensureActivated('solidityUnitTesting')
      globalRegistry.get('filemanager').api.switchFile()
      globalRegistry.get('verticalicon').api.select('solidity')
    }
    let startVyper = () => {
      closeAll()
      this.appManager.ensureActivated('vyper')
      this.appManager.ensureActivated('run')
      globalRegistry.get('filemanager').api.switchFile()
      globalRegistry.get('verticalicon').api.select('vyper')
    }

    let startPipeline = () => {
      this.appManager.ensureActivated('solidity')
      this.appManager.ensureActivated('pipeline')
      this.appManager.ensureActivated('run')
    }
    let startDebugger = () => {
      this.appManager.ensureActivated('debugger')
      globalRegistry.get('verticalicon').api.select('debugger')
    }
    let startPluginManager = () => {
      this.appManager.ensureActivated('pluginManager')
      globalRegistry.get('verticalicon').api.select('pluginManager')
    }

    let createNewFile = () => {
      let fileExplorer = globalRegistry.get('fileexplorer/browser').api
      fileExplorer.createNewFile()
    }
    let connectToLocalhost = () => {
      this.appManager.ensureActivated('remixd')
    }
    let importFromExternal = () => { load('URL') }
    let importFromGist = () => {
      let app = globalRegistry.get('app').api
      app.loadFromGist({gist: ''})
    }

    let container = yo`<div>
      <div class="${css.hpLogoContainer}"><img src="${logo}" style="height:45px;" alt="Remix logo" /></div>
      <div class="${css.jumbotronContainer}">
        <div class="jumbotron clearfix ${css.thisJumboton}">
          <div class="${css.headlineContainer}">
            <h3 class="">The new layout has arrived</h3>
          </div>
          <div class="${css.jumboBtnContainer}">
            <button class="btn btn-info btn-lg" href="#" onclick=${() => { learnMore() }} role="button">Learn more</button>
          </div>
        </div><!-- end of jumbotron -->
      </div><!-- end of jumbotron container -->
      <div class="row ${css.hpSections}">
        <div id="col1" class="col-sm-6">
          <div class="environment mb-5">
            <h4>Environments</h4>
            <div>
              <button class="btn btn-lg btn-secondary ${css.solidityBtn}" onclick=${() => { startSolidity() }}>Solidity</button>
              <button class="btn btn-lg btn-secondary" onclick=${() => { startVyper() }}>Vyper</button>
            </div>
          </div>
          <div class="file">
            <h4>File</h4>
            <p class="mb-1 ${css.text}" onclick=${() => { createNewFile() }}>New File</p>
            <p class="mb-1">
              <label class="${css.labelIt} ${css.text}">
                Open Files
                <input title="open file" type="file" onchange="${
                  (event) => {
                    event.stopPropagation()
                    let fileExplorer = globalRegistry.get('fileexplorer/browser').api
                    fileExplorer.uploadFile(event)
                  }
                }" multiple />
              </label>
            </p>
            <p class="mb-1 ${css.text}" onclick=${() => { connectToLocalhost() }}>Connect to Localhost</p>
            <p class="mb-1 ${css.text} onclick=${() => { importFromExternal() }}">Import From:</p>
              <button class="btn btn-lg btn-secondary" onclick=${() => { importFromGist() }}>Gist</button>
              <button class="btn btn-lg btn-secondary" onclick=${() => { load('Github URL') }}>Github</button>
              <button class="btn btn-lg btn-secondary" onclick=${() => { load('bzz-raw URL') }}>Swarm</button>
              <button class="btn btn-lg btn-secondary" onclick=${() => { load('ipfs URL') }}>Ipfs</button>
            </div><!-- end of div.file -->
        </div><!-- end of #col1 -->
        <div id="col2" class="col-sm-6">
          <div class="plugins mb-5">
            <h4>Featured Plugins</h4>
            <p class="mb-1 ${css.text}" onclick=${() => { startPipeline() }}>Pipeline</p>
            <p class="mb-1 ${css.text}" onclick=${() => { startDebugger() }}>Debugger</p>
            <p class="mb-1"><button onclick=${() => { startPluginManager() }} class="btn btn-sm btn-info ${css.seeAll}">See all Plugins <i class="fa fa-plug" ></i></button></p>
          </div>
          <div class="resources">
            <h4>Resources</h4>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://remix.readthedocs.io/en/latest/#">Documentation</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://gitter.im/ethereum/remix">Gitter channel</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://medium.com/remix-ide">Medium Posts</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="">Tutorials</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="">Workshops Slides</a></p>
          </div>
        </div><!-- end of #col2 -->
      </div><!-- end of hpSections -->
      </div>`

    return container
  }
}
