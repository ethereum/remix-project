import { NightwatchBrowser, NightwatchAPI } from 'nightwatch'
import EventEmitter from 'events'

/*
  Switches between browser tabs
*/

class SwitchBrowserTab extends EventEmitter {
  command(this: NightwatchBrowser, indexOrTitle: number | string): NightwatchBrowser {
    this.api.perform((browser: NightwatchAPI, done) => {
      const runtimeBrowser = browser.options.desiredCapabilities.browserName;
      browser.windowHandles((result) => {
        console.log('switching to window', result);
        if (Array.isArray(result.value)) {
          const handles = result.value;

          const logTabInfo = (handle: string, i: number) => {
            browser.switchWindow(handle);
            browser.getTitle((title) => {
              console.log(`🪟 Tab ${i}: Title → ${title}`);
            });
            browser.getCurrentUrl((url) => {
              console.log(`🌐 Tab ${i}: URL   → ${url}`);
            });
          };

          handles.forEach((handle, i) => logTabInfo(handle, i));

          if (typeof indexOrTitle === 'string') {
            let switched = false;
            const trySwitch = (i = 0) => {
              if (i >= handles.length) {
                console.log(`❌ No tab with title including "${indexOrTitle}" found.`);
                return done();
              }
              browser.switchWindow(handles[i]);
              browser.getTitle((title) => {
                if (title && title == indexOrTitle) {
                  console.log(`✅ Switched to tab with title matching "${indexOrTitle}"`);
                  switched = true;
                  done();
                } else {
                  trySwitch(i + 1);
                }
              });
            };
            trySwitch();
          } else {
            const targetHandle = handles[indexOrTitle] || handles[0];
            browser.switchWindow(targetHandle);
            browser.getTitle((title) => {
              if (title) {
                console.log(`✅ Switched to tab with title "${title}"`);
                done();
              } else {
                console.log(`❌ No tab with index ${indexOrTitle} found.`);
              }
            })

          }
        } else {
          done();
        }
      });
      this.emit('complete');
    });
    return this;
  }
}

module.exports = SwitchBrowserTab
