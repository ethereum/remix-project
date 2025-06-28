import { NightwatchBrowser, NightwatchAPI } from 'nightwatch'
import EventEmitter from 'events'

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

/*
  Switches between browser tabs
*/

class SwitchBrowserTab extends EventEmitter {
  command(this: NightwatchBrowser, indexOrTitle: number | string, forceReload = false): NightwatchBrowser {
    console.log('Switching to browser tab', indexOrTitle);
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
              console.log(`🌐 Tab ${i}: URL   → ${JSON.stringify(url)}`);
            });
          };

          handles.forEach((handle, i) => logTabInfo(handle, i));

          if (typeof indexOrTitle === 'string') {
            let matchedIndex = -1;
            const urlMatches: string[] = [];

            const checkNext = (i = 0) => {
              if (i >= handles.length) {
                if (matchedIndex >= 0 && !forceReload) {
                  browser.switchWindow(handles[matchedIndex]);
                  console.log(`✅ Switched to tab with title or URL matching "${indexOrTitle}"`);
                  return done();
                } else if (matchedIndex >= 0 && forceReload) {
                  console.log(`🔁 Force reloading tab with URL "${indexOrTitle}"`);
                  browser.switchWindow(handles[matchedIndex]);
                  browser.refresh(() => {
                    console.log(`✅ Reloaded tab with URL: ${indexOrTitle}`);
                    done();
                  });
                  return;
                } else if (isValidUrl(indexOrTitle)) {
                  console.log(`🔍 No tab matched, opening new tab with URL "${indexOrTitle}"`);
                  browser.openNewWindow('tab', () => {
                    browser.url(indexOrTitle, () => {
                      browser.pause(2000);
                      console.log(`✅ Opened and switched to new tab with URL: ${indexOrTitle}`);
                      done();
                    });
                  });
                  return;
                } else {
                  console.log(`❌ "${indexOrTitle}" is not a valid URL. No tab opened.`);
                  return done();
                }
              }

              browser.switchWindow(handles[i]);
              browser.pause(500);
              browser.getTitle((title) => {
                browser.getCurrentUrl((urlObj) => {
                  const url = typeof urlObj === 'object' && 'value' in urlObj ? urlObj.value : urlObj;
                  if ((title && title.includes(indexOrTitle)) || (typeof url === 'string' && url.includes(indexOrTitle))) {
                    matchedIndex = i;
                  }
                  checkNext(i + 1);
                });
              });
            };

            checkNext(0);
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
