let yo = require('yo-yo')
let csjs = require('csjs-inject')
let globalRegistry = require('../../../global/registry')
let CompilerImport = require('../../compiler/compiler-imports')
var modalDialogCustom = require('../modal-dialog-custom')
var tooltip = require('../tooltip')

let css = csjs`
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
  .homeContainer {
    height: 105%!important; /* @todo should be removed once swap_it and mainview will be separated */
    user-select:none;
  }
  .jumbotronContainer {
    /* margin: 50px 60px 0; */
    /* width: 80%; */
  }
  .thisJumboton {
    padding: 2.5rem 5rem;
    /* display: flex;*/
    /* justify-content: space-between;*/
    margin-bottom: 4rem;
  }
  .hpLogoContainer {
    margin:30px;
    padding-right: 90px;
  }
  .jumboBtnContainer {
    float: left;
    padding-top: 15px;
  }
  .headlineContainer {
    float: left;
    padding-top: 17px;
    margin: 0 100px 0 70px;
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
  .importFrom p {
    margin-right: 10px;
  }
  .logoContainer {
    margin-top: 7px;
    float: left;
  }
  .logoContainer img{
    height: 65px;
  }

}
`

import { BaseApi } from 'remix-plugin'

const profile = {
  name: 'home',
  displayName: 'Home',
  methods: [],
  events: [],
  description: ' - ',
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik03MC41ODIsNDI4LjkwNGMwLjgxMSwwLDEuNjIyLDAuMjg1LDIuNDM3LDAuODUzYzAuODExLDAuNTcxLDEuMjE4LDEuMzQsMS4yMTgsMi4zMTQNCgkJYzAsMi4yNzctMS4wNTksMy40OTYtMy4xNjgsMy42NTZjLTUuMDM4LDAuODE0LTkuMzgxLDIuMzU2LTEzLjAzNyw0LjYzYy0zLjY1NSwyLjI3Ni02LjY2Myw1LjExNy05LjAxNiw4LjUyOA0KCQljLTIuMzU3LDMuNDExLTQuMTA0LDcuMjcyLTUuMjM5LDExLjU3NWMtMS4xMzksNC4zMDctMS43MDYsOC44MTQtMS43MDYsMTMuNTI0djMyLjY1M2MwLDIuMjczLTEuMTM5LDMuNDExLTMuNDEyLDMuNDExDQoJCWMtMi4yNzcsMC0zLjQxMi0xLjEzOC0zLjQxMi0zLjQxMXYtNzQuMzIzYzAtMi4yNzMsMS4xMzUtMy40MTEsMy40MTItMy40MTFjMi4yNzMsMCwzLjQxMiwxLjEzOCwzLjQxMiwzLjQxMXYxNS4xMDgNCgkJYzEuNDYyLTIuNDM3LDMuMjA2LTQuNzUyLDUuMjM5LTYuOTQ1YzIuMDI5LTIuMTkzLDQuMjY0LTQuMTQzLDYuNzAxLTUuODQ4YzIuNDM3LTEuNzA2LDUuMDc2LTMuMDg1LDcuOTE5LTQuMTQzDQoJCUM2NC43NzEsNDI5LjQzMyw2Ny42NTgsNDI4LjkwNCw3MC41ODIsNDI4LjkwNHoiLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMTM3Ljc3Myw0MjcuMTk4YzUuNjg1LDAsMTAuOTY2LDEuMTgxLDE1LjgzOSwzLjUzNGM0Ljg3NCwyLjM1Niw5LjA1NSw1LjQ4MiwxMi41NSw5LjM4MQ0KCQljMy40OTIsMy44OTksNi4yMTQsOC40MDcsOC4xNjQsMTMuNTI0YzEuOTQ5LDUuMTE3LDIuOTI0LDEwLjQ0LDIuOTI0LDE1Ljk2MWMwLDAuOTc2LTAuMzY2LDEuNzktMS4wOTcsMi40MzgNCgkJYy0wLjczMSwwLjY1LTEuNTgzLDAuOTc1LTIuNTU5LDAuOTc1aC02Ny45ODdjMC40ODcsNC4yMjYsMS41ODQsOC4yODUsMy4yOSwxMi4xODRjMS43MDYsMy44OTksMy45MzcsNy4zMTIsNi43MDEsMTAuMjM0DQoJCWMyLjc2MSwyLjkyNSw2LjAwOCw1LjI4MSw5Ljc0OCw3LjA2N2MzLjczNSwxLjc4OSw3Ljg3NywyLjY4MSwxMi40MjgsMi42ODFjMTIuMDIxLDAsMjEuMzYtNC43OSwyOC4wMjMtMTQuMzc3DQoJCWMwLjY0Ny0xLjEzNiwxLjYyMi0xLjcwNiwyLjkyNC0xLjcwNmMyLjI3MywwLDMuNDEyLDEuMTM5LDMuNDEyLDMuNDEyYzAsMC4xNjMtMC4xNjQsMC43My0wLjQ4NywxLjcwNQ0KCQljLTMuNDEyLDYuMDEzLTguMjA1LDEwLjQ3OS0xNC4zNzcsMTMuNDAyYy02LjE3NiwyLjkyNC0xMi42NzEsNC4zODctMTkuNDk1LDQuMzg3Yy01LjY4OSwwLTEwLjkyOC0xLjE4MS0xNS43MTgtMy41MzMNCgkJYy00Ljc5My0yLjM1NC04LjkzNi01LjQ4My0xMi40MjgtOS4zODJjLTMuNDk1LTMuODk5LTYuMjE0LTguNDA3LTguMTYzLTEzLjUyNGMtMS45NS01LjExOC0yLjkyNC0xMC40MzctMi45MjQtMTUuOTYyDQoJCWMwLTUuNTIxLDAuOTc1LTEwLjg0NCwyLjkyNC0xNS45NjFjMS45NDktNS4xMTcsNC42NjgtOS42MjUsOC4xNjMtMTMuNTI0YzMuNDkyLTMuODk4LDcuNjM0LTcuMDI0LDEyLjQyOC05LjM4MQ0KCQlDMTI2Ljg0Niw0MjguMzc5LDEzMi4wODQsNDI3LjE5OCwxMzcuNzczLDQyNy4xOTh6IE0xNjkuOTQsNDY2LjE4OGMtMC4zMjgtNC4yMjMtMS4zNDEtOC4yODUtMy4wNDYtMTIuMTg0DQoJCWMtMS43MDYtMy44OTktMy45ODItNy4zMTItNi44MjMtMTAuMjM1Yy0yLjg0NC0yLjkyNC02LjE3NS01LjI3Ny05Ljk5MS03LjA2N2MtMy44MTktMS43ODUtNy45Mi0yLjY4LTEyLjMwNi0yLjY4DQoJCWMtNC41NSwwLTguNjkyLDAuODk1LTEyLjQyOCwyLjY4Yy0zLjczOSwxLjc5LTYuOTg3LDQuMTQ0LTkuNzQ4LDcuMDY3Yy0yLjc2NCwyLjkyNC00Ljk5NSw2LjMzNi02LjcwMSwxMC4yMzUNCgkJYy0xLjcwNiwzLjg5OC0yLjgwMiw3Ljk2MS0zLjI5LDEyLjE4NEgxNjkuOTR6Ii8+DQoJPHBhdGggZmlsbD0iIzQxNDA0MiIgZD0iTTMwNC42OSw0MjcuNDQxYzUuMDM0LDAsOS41MDQsMS4wMTgsMTMuNDAyLDMuMDQ3YzMuODk5LDIuMDMzLDcuMTg5LDQuNjcyLDkuODcsNy45Mg0KCQljMi42OCwzLjI1MSw0LjcwOSw3LjA2Niw2LjA5MiwxMS40NTJjMS4zNzksNC4zODcsMi4wNyw4Ljg1NiwyLjA3LDEzLjQwMnY0My42MmMwLDAuOTc1LTAuMzY1LDEuNzg5LTEuMDk3LDIuNDM4DQoJCWMtMC43MywwLjY0Ni0xLjUwMywwLjk3NS0yLjMxMywwLjk3NWMtMi4yNzYsMC0zLjQxMi0xLjE0LTMuNDEyLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTI5LTcuMTA0LTEuNTg0LTEwLjYNCgkJYy0xLjA1OS0zLjQ5MS0yLjYwMi02LjYxOC00LjYzLTkuMzgyYy0yLjAzMy0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4OC0xLjYyMS02LjY2Mi0yLjQzNi0xMC43MjItMi40MzYNCgkJYy01LjIsMC05LjU4NywxLjIxOC0xMy4xNTksMy42NTRjLTMuNTc0LDIuNDM4LTYuNDU3LDUuNTY2LTguNjUsOS4zODJjLTIuMTkzLDMuODE5LTMuODE4LDguMDQyLTQuODc0LDEyLjY3Mg0KCQljLTEuMDU5LDQuNjMtMS41ODQsOS4wNTgtMS41ODQsMTMuMjh2MzMuNjI5YzAsMC45NzUtMC4zNjUsMS43ODktMS4wOTYsMi40MzhjLTAuNzMxLDAuNjQ2LTEuNTA1LDAuOTc1LTIuMzE1LDAuOTc1DQoJCWMtMi4yNzYsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTMtNy4xMDQtMS41ODUtMTAuNmMtMS4wNTgtMy40OTEtMi42MDEtNi42MTgtNC42MjktOS4zODINCgkJYy0yLjAzNC0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4Ny0xLjYyMS02LjY2My0yLjQzNi0xMC43MjItMi40MzZjLTUuMDM3LDAtOS4zNDQsMC44OTUtMTIuOTE1LDIuNjgNCgkJYy0zLjU3NSwxLjc5LTYuNTQyLDQuMjY2LTguODk1LDcuNDMzYy0yLjM1NywzLjE2Ny00LjA2Myw2Ljk0NC01LjExNywxMS4zMzFjLTEuMDU5LDQuMzg2LTEuNTg0LDkuMS0xLjU4NCwxNC4xMzR2My44OTl2MC4yNDMNCgkJdjMyLjg5N2MwLDIuMjcyLTEuMTM4LDMuNDEyLTMuNDEyLDMuNDEyYy0yLjI3NiwwLTMuNDExLTEuMTQtMy40MTEtMy40MTJ2LTc0LjU2N2MwLTIuMjczLDEuMTM1LTMuNDExLDMuNDExLTMuNDExDQoJCWMyLjI3MywwLDMuNDEyLDEuMTM4LDMuNDEyLDMuNDExdjEyLjQyOGMyLjkyNC01LjE5Nyw2Ljg2MS05LjM4MiwxMS44MTktMTIuNTVjNC45NTQtMy4xNjcsMTAuNTE3LTQuNzUyLDE2LjY5Mi00Ljc1Mg0KCQljNi45ODMsMCwxMi45OTUsMS45OTEsMTguMDMyLDUuOTdjNS4wMzMsMy45ODMsOC42ODgsOS4yMjMsMTAuOTY2LDE1LjcxOWMyLjc2LTYuMzM2LDYuNzM5LTExLjUzMywxMS45NC0xNS41OTYNCgkJQzI5MS4xMjUsNDI5LjQ3NSwyOTcuMzgsNDI3LjQ0MSwzMDQuNjksNDI3LjQ0MXoiLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMzc4Ljc1Myw0MjkuMzkyYzAuODExLDAsMS41ODQsMC4zNjUsMi4zMTQsMS4wOTdjMC43MzEsMC43MywxLjA5NywxLjUwNCwxLjA5NywyLjMxNHY3NC4wOA0KCQljMCwwLjgxNC0wLjM2NSwxLjU4NC0xLjA5NywyLjMxNWMtMC43MywwLjczLTEuNTA0LDEuMDk3LTIuMzE0LDEuMDk3Yy0wLjk3NSwwLTEuNzktMC4zNjYtMi40MzgtMS4wOTcNCgkJYy0wLjY1LTAuNzMxLTAuOTc1LTEuNTAxLTAuOTc1LTIuMzE1di03NC4wOGMwLTAuODExLDAuMzI0LTEuNTg0LDAuOTc1LTIuMzE0QzM3Ni45NjMsNDI5Ljc1NywzNzcuNzc4LDQyOS4zOTIsMzc4Ljc1Myw0MjkuMzkyeiINCgkJLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNNDczLjM0LDQyOC42NmMyLjI3MywwLDMuNDEyLDEuMTM5LDMuNDEyLDMuNDExbC0wLjQ4NywxLjk1bC0yNC4zNjgsMzUuMzM0bDI0LjM2OCwzNS41NzcNCgkJYzAuMzIzLDAuOTc2LDAuNDg3LDEuNjI2LDAuNDg3LDEuOTVjMCwyLjI3Mi0xLjEzOSwzLjQxMi0zLjQxMiwzLjQxMmMtMS4zMDIsMC0yLjE5My0wLjQ4OC0yLjY4LTEuNDYzbC0yMi45MDYtMzMuMzg0DQoJCWwtMjIuNjYzLDMzLjM4NGMtMC44MTQsMC45NzUtMS43OSwxLjQ2My0yLjkyNCwxLjQ2M2MtMi4yNzcsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEyYzAtMC4zMjQsMC4xNTktMC45NzUsMC40ODYtMS45NQ0KCQlsMjQuMzY5LTM1LjU3N2wtMjQuMzY5LTM1LjMzNGwtMC40ODYtMS45NWMwLTIuMjcyLDEuMTM0LTMuNDExLDMuNDExLTMuNDExYzEuMTM0LDAsMi4xMDksMC40ODcsMi45MjQsMS40NjJsMjIuNjYzLDMzLjE0MQ0KCQlsMjIuOTA2LTMzLjE0MUM0NzEuMTQ2LDQyOS4xNDcsNDcyLjAzOCw0MjguNjYsNDczLjM0LDQyOC42NnoiLz4NCjwvZz4NCjxnPg0KCTxnPg0KCQk8ZyBvcGFjaXR5PSIwLjQ1Ij4NCgkJCTxnPg0KCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMTUwLjczNCwxOTYuMjEyIDI1NS45NjksMzQ0LjUwOCAyNTUuOTY5LDI1OC4zODcgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuOCI+DQoJCQk8Zz4NCgkJCQk8cG9seWdvbiBmaWxsPSIjMDEwMTAxIiBwb2ludHM9IjI1NS45NjksMjU4LjM4NyAyNTUuOTY5LDM0NC41MDggMzYxLjI2NywxOTYuMjEyIAkJCQkiLz4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBvcGFjaXR5PSIwLjYiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyNTUuOTY5LDEyNi43ODEgMTUwLjczMywxNzQuNjExIDI1NS45NjksMjM2LjgxOCAzNjEuMjA0LDE3NC42MTEgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuNDUiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIxNTAuNzM0LDE3NC42MTIgMjU1Ljk2OSwyMzYuODE4IDI1NS45NjksMTI2Ljc4MiAyNTUuOTY5LDAuMDAxIAkJCQkiLz4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBvcGFjaXR5PSIwLjgiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyNTUuOTY5LDAgMjU1Ljk2OSwxMjYuNzgxIDI1NS45NjksMjM2LjgxOCAzNjEuMjA0LDE3NC42MTEgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=',
  location: 'mainPanel'
}

export class LandingPage extends BaseApi {

  constructor (appManager, appStore) {
    super(profile)
    this.appStore = appStore
    this.appManager = appManager
  }

  render () {
    let load = function (service, item, examples, info) {
      let compilerImport = new CompilerImport()
      let fileProviders = globalRegistry.get('fileproviders').api
      const msg = yo`<div class="p-2"><span>Enter the ${item} you would like to load.</span>
      <div>${info}</div>
      <div>e.g ${examples.map((url) => { return yo`<div class="p-1"><a>${url}</a></div>` })}</div></div>`

      modalDialogCustom.prompt(`Import from ${service}`, msg, null, (target) => {
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
                  globalRegistry.get('verticalicon').api.select('fileExplorers')
                }
              }
            }
          )
        }
      })
    }
    let logo = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik03MC41ODIsNDI4LjkwNGMwLjgxMSwwLDEuNjIyLDAuMjg1LDIuNDM3LDAuODUzYzAuODExLDAuNTcxLDEuMjE4LDEuMzQsMS4yMTgsMi4zMTQNCgkJYzAsMi4yNzctMS4wNTksMy40OTYtMy4xNjgsMy42NTZjLTUuMDM4LDAuODE0LTkuMzgxLDIuMzU2LTEzLjAzNyw0LjYzYy0zLjY1NSwyLjI3Ni02LjY2Myw1LjExNy05LjAxNiw4LjUyOA0KCQljLTIuMzU3LDMuNDExLTQuMTA0LDcuMjcyLTUuMjM5LDExLjU3NWMtMS4xMzksNC4zMDctMS43MDYsOC44MTQtMS43MDYsMTMuNTI0djMyLjY1M2MwLDIuMjczLTEuMTM5LDMuNDExLTMuNDEyLDMuNDExDQoJCWMtMi4yNzcsMC0zLjQxMi0xLjEzOC0zLjQxMi0zLjQxMXYtNzQuMzIzYzAtMi4yNzMsMS4xMzUtMy40MTEsMy40MTItMy40MTFjMi4yNzMsMCwzLjQxMiwxLjEzOCwzLjQxMiwzLjQxMXYxNS4xMDgNCgkJYzEuNDYyLTIuNDM3LDMuMjA2LTQuNzUyLDUuMjM5LTYuOTQ1YzIuMDI5LTIuMTkzLDQuMjY0LTQuMTQzLDYuNzAxLTUuODQ4YzIuNDM3LTEuNzA2LDUuMDc2LTMuMDg1LDcuOTE5LTQuMTQzDQoJCUM2NC43NzEsNDI5LjQzMyw2Ny42NTgsNDI4LjkwNCw3MC41ODIsNDI4LjkwNHoiLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMTM3Ljc3Myw0MjcuMTk4YzUuNjg1LDAsMTAuOTY2LDEuMTgxLDE1LjgzOSwzLjUzNGM0Ljg3NCwyLjM1Niw5LjA1NSw1LjQ4MiwxMi41NSw5LjM4MQ0KCQljMy40OTIsMy44OTksNi4yMTQsOC40MDcsOC4xNjQsMTMuNTI0YzEuOTQ5LDUuMTE3LDIuOTI0LDEwLjQ0LDIuOTI0LDE1Ljk2MWMwLDAuOTc2LTAuMzY2LDEuNzktMS4wOTcsMi40MzgNCgkJYy0wLjczMSwwLjY1LTEuNTgzLDAuOTc1LTIuNTU5LDAuOTc1aC02Ny45ODdjMC40ODcsNC4yMjYsMS41ODQsOC4yODUsMy4yOSwxMi4xODRjMS43MDYsMy44OTksMy45MzcsNy4zMTIsNi43MDEsMTAuMjM0DQoJCWMyLjc2MSwyLjkyNSw2LjAwOCw1LjI4MSw5Ljc0OCw3LjA2N2MzLjczNSwxLjc4OSw3Ljg3NywyLjY4MSwxMi40MjgsMi42ODFjMTIuMDIxLDAsMjEuMzYtNC43OSwyOC4wMjMtMTQuMzc3DQoJCWMwLjY0Ny0xLjEzNiwxLjYyMi0xLjcwNiwyLjkyNC0xLjcwNmMyLjI3MywwLDMuNDEyLDEuMTM5LDMuNDEyLDMuNDEyYzAsMC4xNjMtMC4xNjQsMC43My0wLjQ4NywxLjcwNQ0KCQljLTMuNDEyLDYuMDEzLTguMjA1LDEwLjQ3OS0xNC4zNzcsMTMuNDAyYy02LjE3NiwyLjkyNC0xMi42NzEsNC4zODctMTkuNDk1LDQuMzg3Yy01LjY4OSwwLTEwLjkyOC0xLjE4MS0xNS43MTgtMy41MzMNCgkJYy00Ljc5My0yLjM1NC04LjkzNi01LjQ4My0xMi40MjgtOS4zODJjLTMuNDk1LTMuODk5LTYuMjE0LTguNDA3LTguMTYzLTEzLjUyNGMtMS45NS01LjExOC0yLjkyNC0xMC40MzctMi45MjQtMTUuOTYyDQoJCWMwLTUuNTIxLDAuOTc1LTEwLjg0NCwyLjkyNC0xNS45NjFjMS45NDktNS4xMTcsNC42NjgtOS42MjUsOC4xNjMtMTMuNTI0YzMuNDkyLTMuODk4LDcuNjM0LTcuMDI0LDEyLjQyOC05LjM4MQ0KCQlDMTI2Ljg0Niw0MjguMzc5LDEzMi4wODQsNDI3LjE5OCwxMzcuNzczLDQyNy4xOTh6IE0xNjkuOTQsNDY2LjE4OGMtMC4zMjgtNC4yMjMtMS4zNDEtOC4yODUtMy4wNDYtMTIuMTg0DQoJCWMtMS43MDYtMy44OTktMy45ODItNy4zMTItNi44MjMtMTAuMjM1Yy0yLjg0NC0yLjkyNC02LjE3NS01LjI3Ny05Ljk5MS03LjA2N2MtMy44MTktMS43ODUtNy45Mi0yLjY4LTEyLjMwNi0yLjY4DQoJCWMtNC41NSwwLTguNjkyLDAuODk1LTEyLjQyOCwyLjY4Yy0zLjczOSwxLjc5LTYuOTg3LDQuMTQ0LTkuNzQ4LDcuMDY3Yy0yLjc2NCwyLjkyNC00Ljk5NSw2LjMzNi02LjcwMSwxMC4yMzUNCgkJYy0xLjcwNiwzLjg5OC0yLjgwMiw3Ljk2MS0zLjI5LDEyLjE4NEgxNjkuOTR6Ii8+DQoJPHBhdGggZmlsbD0iIzQxNDA0MiIgZD0iTTMwNC42OSw0MjcuNDQxYzUuMDM0LDAsOS41MDQsMS4wMTgsMTMuNDAyLDMuMDQ3YzMuODk5LDIuMDMzLDcuMTg5LDQuNjcyLDkuODcsNy45Mg0KCQljMi42OCwzLjI1MSw0LjcwOSw3LjA2Niw2LjA5MiwxMS40NTJjMS4zNzksNC4zODcsMi4wNyw4Ljg1NiwyLjA3LDEzLjQwMnY0My42MmMwLDAuOTc1LTAuMzY1LDEuNzg5LTEuMDk3LDIuNDM4DQoJCWMtMC43MywwLjY0Ni0xLjUwMywwLjk3NS0yLjMxMywwLjk3NWMtMi4yNzYsMC0zLjQxMi0xLjE0LTMuNDEyLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTI5LTcuMTA0LTEuNTg0LTEwLjYNCgkJYy0xLjA1OS0zLjQ5MS0yLjYwMi02LjYxOC00LjYzLTkuMzgyYy0yLjAzMy0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4OC0xLjYyMS02LjY2Mi0yLjQzNi0xMC43MjItMi40MzYNCgkJYy01LjIsMC05LjU4NywxLjIxOC0xMy4xNTksMy42NTRjLTMuNTc0LDIuNDM4LTYuNDU3LDUuNTY2LTguNjUsOS4zODJjLTIuMTkzLDMuODE5LTMuODE4LDguMDQyLTQuODc0LDEyLjY3Mg0KCQljLTEuMDU5LDQuNjMtMS41ODQsOS4wNTgtMS41ODQsMTMuMjh2MzMuNjI5YzAsMC45NzUtMC4zNjUsMS43ODktMS4wOTYsMi40MzhjLTAuNzMxLDAuNjQ2LTEuNTA1LDAuOTc1LTIuMzE1LDAuOTc1DQoJCWMtMi4yNzYsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTMtNy4xMDQtMS41ODUtMTAuNmMtMS4wNTgtMy40OTEtMi42MDEtNi42MTgtNC42MjktOS4zODINCgkJYy0yLjAzNC0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4Ny0xLjYyMS02LjY2My0yLjQzNi0xMC43MjItMi40MzZjLTUuMDM3LDAtOS4zNDQsMC44OTUtMTIuOTE1LDIuNjgNCgkJYy0zLjU3NSwxLjc5LTYuNTQyLDQuMjY2LTguODk1LDcuNDMzYy0yLjM1NywzLjE2Ny00LjA2Myw2Ljk0NC01LjExNywxMS4zMzFjLTEuMDU5LDQuMzg2LTEuNTg0LDkuMS0xLjU4NCwxNC4xMzR2My44OTl2MC4yNDMNCgkJdjMyLjg5N2MwLDIuMjcyLTEuMTM4LDMuNDEyLTMuNDEyLDMuNDEyYy0yLjI3NiwwLTMuNDExLTEuMTQtMy40MTEtMy40MTJ2LTc0LjU2N2MwLTIuMjczLDEuMTM1LTMuNDExLDMuNDExLTMuNDExDQoJCWMyLjI3MywwLDMuNDEyLDEuMTM4LDMuNDEyLDMuNDExdjEyLjQyOGMyLjkyNC01LjE5Nyw2Ljg2MS05LjM4MiwxMS44MTktMTIuNTVjNC45NTQtMy4xNjcsMTAuNTE3LTQuNzUyLDE2LjY5Mi00Ljc1Mg0KCQljNi45ODMsMCwxMi45OTUsMS45OTEsMTguMDMyLDUuOTdjNS4wMzMsMy45ODMsOC42ODgsOS4yMjMsMTAuOTY2LDE1LjcxOWMyLjc2LTYuMzM2LDYuNzM5LTExLjUzMywxMS45NC0xNS41OTYNCgkJQzI5MS4xMjUsNDI5LjQ3NSwyOTcuMzgsNDI3LjQ0MSwzMDQuNjksNDI3LjQ0MXoiLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMzc4Ljc1Myw0MjkuMzkyYzAuODExLDAsMS41ODQsMC4zNjUsMi4zMTQsMS4wOTdjMC43MzEsMC43MywxLjA5NywxLjUwNCwxLjA5NywyLjMxNHY3NC4wOA0KCQljMCwwLjgxNC0wLjM2NSwxLjU4NC0xLjA5NywyLjMxNWMtMC43MywwLjczLTEuNTA0LDEuMDk3LTIuMzE0LDEuMDk3Yy0wLjk3NSwwLTEuNzktMC4zNjYtMi40MzgtMS4wOTcNCgkJYy0wLjY1LTAuNzMxLTAuOTc1LTEuNTAxLTAuOTc1LTIuMzE1di03NC4wOGMwLTAuODExLDAuMzI0LTEuNTg0LDAuOTc1LTIuMzE0QzM3Ni45NjMsNDI5Ljc1NywzNzcuNzc4LDQyOS4zOTIsMzc4Ljc1Myw0MjkuMzkyeiINCgkJLz4NCgk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNNDczLjM0LDQyOC42NmMyLjI3MywwLDMuNDEyLDEuMTM5LDMuNDEyLDMuNDExbC0wLjQ4NywxLjk1bC0yNC4zNjgsMzUuMzM0bDI0LjM2OCwzNS41NzcNCgkJYzAuMzIzLDAuOTc2LDAuNDg3LDEuNjI2LDAuNDg3LDEuOTVjMCwyLjI3Mi0xLjEzOSwzLjQxMi0zLjQxMiwzLjQxMmMtMS4zMDIsMC0yLjE5My0wLjQ4OC0yLjY4LTEuNDYzbC0yMi45MDYtMzMuMzg0DQoJCWwtMjIuNjYzLDMzLjM4NGMtMC44MTQsMC45NzUtMS43OSwxLjQ2My0yLjkyNCwxLjQ2M2MtMi4yNzcsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEyYzAtMC4zMjQsMC4xNTktMC45NzUsMC40ODYtMS45NQ0KCQlsMjQuMzY5LTM1LjU3N2wtMjQuMzY5LTM1LjMzNGwtMC40ODYtMS45NWMwLTIuMjcyLDEuMTM0LTMuNDExLDMuNDExLTMuNDExYzEuMTM0LDAsMi4xMDksMC40ODcsMi45MjQsMS40NjJsMjIuNjYzLDMzLjE0MQ0KCQlsMjIuOTA2LTMzLjE0MUM0NzEuMTQ2LDQyOS4xNDcsNDcyLjAzOCw0MjguNjYsNDczLjM0LDQyOC42NnoiLz4NCjwvZz4NCjxnPg0KCTxnPg0KCQk8ZyBvcGFjaXR5PSIwLjQ1Ij4NCgkJCTxnPg0KCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMTUwLjczNCwxOTYuMjEyIDI1NS45NjksMzQ0LjUwOCAyNTUuOTY5LDI1OC4zODcgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuOCI+DQoJCQk8Zz4NCgkJCQk8cG9seWdvbiBmaWxsPSIjMDEwMTAxIiBwb2ludHM9IjI1NS45NjksMjU4LjM4NyAyNTUuOTY5LDM0NC41MDggMzYxLjI2NywxOTYuMjEyIAkJCQkiLz4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBvcGFjaXR5PSIwLjYiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyNTUuOTY5LDEyNi43ODEgMTUwLjczMywxNzQuNjExIDI1NS45NjksMjM2LjgxOCAzNjEuMjA0LDE3NC42MTEgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIG9wYWNpdHk9IjAuNDUiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIxNTAuNzM0LDE3NC42MTIgMjU1Ljk2OSwyMzYuODE4IDI1NS45NjksMTI2Ljc4MiAyNTUuOTY5LDAuMDAxIAkJCQkiLz4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBvcGFjaXR5PSIwLjgiPg0KCQkJPGc+DQoJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIyNTUuOTY5LDAgMjU1Ljk2OSwxMjYuNzgxIDI1NS45NjksMjM2LjgxOCAzNjEuMjA0LDE3NC42MTEgCQkJCSIvPg0KCQkJPC9nPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo='

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
      globalRegistry.get('verticalicon').api.select('solidity')
    }
    let startVyper = () => {
      closeAll()
      this.appManager.ensureActivated('vyper')
      this.appManager.ensureActivated('run')
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
    let importFromGist = () => {
      let app = globalRegistry.get('app').api
      app.loadFromGist({gist: ''})
      globalRegistry.get('verticalicon').api.select('fileExplorers')
    }

    globalRegistry.get('themeModule').api.events.on('themeChanged', (theme) => {
      const invert = theme.quality === 'dark' ? 1 : 0
      const img = document.getElementById('remixLogo')
      if (img) {
        img.style.filter = `invert(${invert})`
      }
    })

    let container = yo`<div class="${css.homeContainer} bg-light">
      <div class="${css.jumbotronContainer}">
        <div class="alert alert-info clearfix ${css.thisJumboton}">
          <div class="${css.logoContainer}">
            <img id="remixLogo" src="${logo}" alt="remix logo">
          </div>
          <div class="${css.headlineContainer}">
            <h2 class="">The new layout has arrived</h2>
          </div>
          <div class="${css.jumboBtnContainer}">
            <button class="btn btn-primary btn-lg" href="#" onclick=${() => { learnMore() }} role="button">Learn more</button>
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
            <p class="mb-1">Import From:</p>
            <div class="btn-group">
              <button class="btn btn-sm btn-secondary" onclick=${() => { importFromGist() }}>Gist</button>
              <button class="btn btn-sm btn-secondary" onclick=${() => { load('Github', 'github URL', ['https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/crowdsale/Crowdsale.sol', 'https://github.com/OpenZeppelin/openzeppelin-solidity/blob/67bca857eedf99bf44a4b6a0fc5b5ed553135316/contracts/access/Roles.sol', 'github:OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#v2.1.2']) }}>Github</button>
              <button class="btn btn-sm btn-secondary" onclick=${() => { load('Swarm', 'bzz-raw URL', ['bzz-raw://<swarm-hash>']) }}>Swarm</button>
              <button class="btn btn-sm btn-secondary" onclick=${() => { load('Ipfs', 'ipfs URL', ['ipfs://<ipfs-hash>']) }}>Ipfs</button>
              <button class="btn btn-sm btn-secondary" onclick=${() => { load('Https', 'http/https raw content', ['https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/master/contracts/crowdsale/validation/IndividuallyCappedCrowdsale.sol']) }}>https</button>
              <button class="btn btn-sm btn-secondary" onclick=${() => { load('@resolver-engine', 'resolver-engine URL', ['github:OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#v2.1.2'], yo`<span>please checkout <a class='text-primary' href="https://github.com/Crypto-Punkers/resolver-engine" target='_blank'>https://github.com/Crypto-Punkers/resolver-engine</a> for more information</span>`) }}>Resolver-engine</button>
            </div><!-- end of btn-group -->
          </div><!-- end of div.file -->
        </div><!-- end of #col1 -->
        <div id="col2" class="col-sm-6">
          <div class="plugins mb-5">
            <h4>Featured Plugins</h4>
            <p class="mb-1 ${css.text}" onclick=${() => { startPipeline() }}>Pipeline</p>
            <p class="mb-1 ${css.text}" onclick=${() => { startDebugger() }}>Debugger</p>
            <p class="mb-1"><button onclick=${() => { startPluginManager() }} class="btn btn-sm btn-secondary ${css.seeAll}">See all Plugins <i class="fas fa-plug" ></i></button></p>
          </div>
          <div class="resources">
            <h4>Resources</h4>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://remix.readthedocs.io/en/latest/#">Documentation</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://gitter.im/ethereum/remix">Gitter channel</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://medium.com/remix-ide">Medium Posts</a></p>
            <p class="mb-1"><a class="${css.text}" target="__blank" href="https://remix.readthedocs.io/en/latest/">Tutorials</a></p>
          </div>
        </div><!-- end of #col2 -->
      </div><!-- end of hpSections -->
      </div>`

    return container
  }
}
