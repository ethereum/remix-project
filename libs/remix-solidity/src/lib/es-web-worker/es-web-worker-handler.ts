class ESWebWorkerHandler {
    constructor() {

    }

    getWorker () {
        // @ts-ignore
        return new Worker(new URL('./compiler-worker', import.meta.url))
    }
}

export default ESWebWorkerHandler