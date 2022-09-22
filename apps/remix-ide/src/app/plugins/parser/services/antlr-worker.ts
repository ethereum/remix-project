let parser: any
// 'DedicatedWorkerGlobalScope' object (the Worker global scope) is accessible through the self keyword
// 'dom' and 'webworker' library files can't be included together https://github.com/microsoft/TypeScript/issues/20595
export default function (self) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types

    self.addEventListener('message', (e) => {
        const data: any = e.data
        switch (data.cmd) {
            case 'load':
                {
                    delete self.Module
                    // NOTE: workaround some browsers?
                    self.Module = undefined
                    // importScripts() method of synchronously imports one or more scripts into the worker's scope
                    self.importScripts(e.data.url)
                    // @ts-ignore
                    parser = SolidityParser as any;

                    self.postMessage({
                        cmd: 'loaded',
                    })
                    break
                }

            case 'parse':
                if (data.text && parser) {
                    
                    try {
                        let startTime = performance.now()
                        const blocks = parser.parseBlock(data.text, { loc: true, range: true, tolerant: true })
                        const blockDuration = performance.now() - startTime
                        startTime = performance.now()
                        const ast = parser.parse(data.text, { loc: true, range: true, tolerant: true })
                        const endTime = performance.now()

                        self.postMessage({
                            cmd: 'parsed',
                            timestamp: data.timestamp,
                            ast,
                            text: data.text,
                            file: data.file,
                            duration: endTime - startTime,
                            blockDuration,
                            blocks
                        })
                    } catch (e) {
                        // do nothing
                    }

                }
                break
        }
    }, false)
}
