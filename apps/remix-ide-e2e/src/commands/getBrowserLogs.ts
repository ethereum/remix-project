import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class GetBrowserLogs extends EventEmitter {
    command(this: NightwatchBrowser): NightwatchBrowser {
        this.api.getLog('browser', function (logs) {
            if (logs && Array.isArray(logs)) {
                logs.forEach(function (log) {
                    console.log(log)
                }
                )
            }
        }).perform(() => {
            this.emit('complete')
        })
        return this
    }
}
module.exports = GetBrowserLogs