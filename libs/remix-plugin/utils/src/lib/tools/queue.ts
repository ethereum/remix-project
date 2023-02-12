import { PluginQueueInterface } from '../types/queue'
import type {
    PluginRequest,
} from '../types/message'
import { Profile } from '../types/profile'
import { Api } from '../types/api'
import { PluginOptions } from '../types/options'

export class PluginQueueItem<T extends Api = any> implements PluginQueueInterface {
    private resolve: (value:unknown) => void
    private reject: (reason:any) => void
    private timer: any
    private running: boolean
    private args: any[]

    public method:  Profile<T>['methods'][number]
    public timedout: boolean
    public canceled: boolean
    public finished: boolean
    public request: PluginRequest
    private options: PluginOptions = {}

    constructor(resolve: (value:unknown) => void, reject: (reason:any) => void, request: PluginRequest, method: Profile<T>['methods'][number], options: PluginOptions, args: any[]){
        this.resolve = resolve
        this.reject = reject
        this.method = method
        this.request = request
        this.timer = undefined
        this.timedout = false
        this.canceled = false
        this.finished = false
        this.running = false
        this.args = args
        this.options = options
    }

    setCurrentRequest(request: PluginRequest): void {
        throw new Error('Cannot call this directly')
    }

    callMethod(method: string, args: any[]): void {
        throw new Error('Cannot call this directly')
    }

    letContinue(): void {
        throw new Error('Cannot call this directly')
    }

    cancel(): void {
        this.canceled = true
        clearTimeout(this.timer)
        this.reject(`[CANCEL] Canceled call ${this.method} from ${this.request.from}`)
        if(this.running)
            this.letContinue()
    }

    async run(){
        if(this.canceled) { 
            this.letContinue()
            return
        }
        this.timer = setTimeout(()=>{
            this.timedout = true
            this.reject(`[TIMEOUT] Timeout for call ${this.method} from ${this.request.from}`)
            this.letContinue()
        }, this.options.queueTimeout || 10000)

        this.running = true
        this.setCurrentRequest(this.request)
        try{
            const result = await this.callMethod(this.method, this.args)
            if(this.timedout || this.canceled) return
            this.resolve(result) 
        }catch(err){
            this.reject(err)
        }
        this.finished = true
        this.running = false
        clearTimeout(this.timer)
        this.letContinue();
    }
}