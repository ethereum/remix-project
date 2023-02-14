let parser: any
self.onmessage = (e: MessageEvent) => {
    const data: any = e.data
    switch (data.cmd) {
        case 'load':
            {
                (self as any).importScripts(e.data.url)
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
}