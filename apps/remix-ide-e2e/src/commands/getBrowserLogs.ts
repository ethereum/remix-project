import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class GetBrowserLogs extends EventEmitter {
    command(this: NightwatchBrowser): NightwatchBrowser {
        if (this.api.isChrome()) {
            this.api.getLog('browser', function (logs) {
                if (logs && Array.isArray(logs)) {
                    logs.forEach(function (log) {
                        console.log(log)
                    }
                    )
                }
            }
            ).perform(() => {
                this.emit('complete')
            })
        } else {
            console.log('Browser logs are only available in Chrome')
            this.emit('complete')
        }
        return this
    }
}
module.exports = GetBrowserLogs