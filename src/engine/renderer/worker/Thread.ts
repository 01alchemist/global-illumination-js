import {TraceWorker} from "./TraceWorker";
/**
 * Created by Nidin on 4/1/2016.
 */
export class Thread {

    instance:Worker;

    onTraceComplete:Function;
    onInitComplete:Function;

    initialized:boolean;
    isTracing:boolean;

    constructor(name:string, public id:number) {

        //console.log("Thread:"+name);

        this.instance = new Worker("../workerBootstrap.js");

        var self = this;

        this.instance.onmessage = function (event) {
            if (event.data == TraceWorker.INITED) {
                self.initialized = true;
                self.isTracing = false;
                if (self.onInitComplete) {
                    self.onInitComplete(self);
                }
            }
            if (event.data == TraceWorker.TRACED) {
                self.isTracing = false;
                if (self.onTraceComplete) {
                    self.onTraceComplete(self);
                }
            }
        }
    }

    init(param:any, transferable:any[], onInit:Function) {
        this.onInitComplete = onInit;
        this.sendCommand(TraceWorker.INIT);
        param.id = this.id;
        this.sendData(param, transferable);
    }

    trace(param:any, onComplete:Function):void {
        this.onTraceComplete = onComplete;
        this.isTracing = true;
        this.sendCommand(TraceWorker.TRACE);
        this.sendData(param);
    }

    sendCommand(message:string):void {
        this.instance.postMessage(message);
    }

    sendData(data:any, buffers?):void {
        this.instance.postMessage(data, buffers);
    }
}