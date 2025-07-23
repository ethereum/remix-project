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
      let attempts = 0
      const maxAttempts = 200

      const expandNextClosedFolder = () => {
        if (attempts >= maxAttempts) {
          if (done) done()
          return
        }
        attempts++

        const closedFolderSelector = targetDirectory
          ? `li[data-id*="treeViewLitreeViewItem${targetDirectory}"] .fa-folder:not(.fa-folder-open)`
          : 'li[data-id*="treeViewLitreeViewItem"] .fa-folder:not(.fa-folder-open)'

        browser.element('css selector', closedFolderSelector, (result) => {
          if (result.status === 0 && result.value) {
            // Found a closed folder icon, now find its parent li element and click it
            browser.elementIdElement((result.value as any)['element-6066-11e4-a52e-4f735466cecf'], 'xpath', './..', (parentResult) => {
              if (parentResult.status === 0) {
                browser.elementIdClick((parentResult.value as any)['element-6066-11e4-a52e-4f735466cecf'])
                  .pause(100) // Wait for folder to expand and DOM to update
                  .perform(() => expandNextClosedFolder()) // Look for next closed folder
              } else {
                // Failed to find parent, try alternative approach
                browser.click(closedFolderSelector)
                  .pause(100)
                  .perform(() => expandNextClosedFolder()) // recursive call
              }
            })
          } else {
            if (done) done()
          }
        })
      }

      expandNextClosedFolder()
    })
}

module.exports = ExpandAllFolders