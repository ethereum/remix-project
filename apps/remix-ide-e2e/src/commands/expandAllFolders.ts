import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ExpandAllFolders extends EventEmitter {
  command (this: NightwatchBrowser, targetDirectory?: string) {
    this.api.perform((done) => {
      expandAllFolders(this.api, targetDirectory, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function expandAllFolders (browser: NightwatchBrowser, targetDirectory?: string, done?: VoidFunction) {
  // Ensure file panel is open
  browser.perform((bdone: VoidFunction) => {
    browser.isVisible('[data-id="remixIdeSidePanel"]', (result) => {
      if (result.value) {
        browser.element('css selector', '[data-id="verticalIconsKindfilePanel"] img[data-id="selected"]', (result) => {
          if (result.status === 0) {
            bdone()
          } else browser.clickLaunchIcon('filePanel').perform(() => {
            bdone()
          })
        })
      } else {
        browser.clickLaunchIcon('filePanel').perform(() => {
          bdone()
        })
      }
    })
  })
    .perform(() => {
      let iteration = 0
      const maxIterations = 20 // Prevent infinite loops

      const clickNext = () => {
        if (iteration >= maxIterations) {
          if (done) done()
          return
        }

        iteration++

        // Find folders that are not expanded, / in case no folder is passed
        const folderSelector = targetDirectory ?
          `li[data-id*="treeViewLitreeViewItem${targetDirectory}"] li[data-id*="treeViewLitreeViewItem"] .fa-folder:not(.fa-folder-open)` :
          'li[data-id*="treeViewLitreeViewItem"] .fa-folder:not(.fa-folder-open)'

        browser.element('css selector', folderSelector, (result) => {
          if (result.status === 0 && result.value) {
            // Found a closed folder, click its parent li element
            browser.element('css selector', folderSelector, (elementResult) => {
              if (elementResult.status === 0) {
                browser.elementIdElement((elementResult.value as any)['element-6066-11e4-a52e-4f735466cecf'], 'xpath', './..', (parentResult) => {
                  if (parentResult.status === 0) {
                    browser.elementIdClick((parentResult.value as any)['element-6066-11e4-a52e-4f735466cecf']) // click on folder name
                      .pause(100)
                      .perform(() => clickNext()) // recursive nested folders
                  } else {
                    if (done) done()
                  }
                })
              } else {
                if (done) done()
              }
            })
          } else {
            if (done) done()
          }
        })
      }

      clickNext()
    })
}

module.exports = ExpandAllFolders