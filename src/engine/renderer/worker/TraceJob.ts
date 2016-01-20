import {TraceWorker} from "./TraceWorker";
import {Thread} from "./Thread";
import {ByteArrayBase} from "../../../pointer/ByteArrayBase";

export class TraceJob {

    private id:number;
    public finished:boolean;
    public thread:Thread;
    private onInit:Function;

    constructor(private param) {
        this.id = param.id;
        this.finished = false;
        var self = this;

        this.thread = new Thread("Worker: " + this.id);
        this.thread.onInitComplete = function(){
            //console.timeEnd("INIT_"+self.id);
            self.finished = true;
            if(self.onInit){
                self.onInit(self.id);
            }
        };
        this.thread.onTraceComplete = function(){
            //console.timeEnd("TRACE_"+id);
            self.finished = true;
        };
    }
    init(onInit?:Function){
        this.onInit = onInit;
        this.thread.sendCommand(TraceWorker.INIT);
        this.thread.sendData(this.param,[this.param.pixelBuffer, this.param.sceneBuffer]);
    }
    run(iterations:number):void {
        if(this.thread.initialized && !this.thread.isTracing){
            this.finished = false;
            this.thread.trace();
            this.thread.sendData({
                iterations:iterations
            });
        }
    }
}
