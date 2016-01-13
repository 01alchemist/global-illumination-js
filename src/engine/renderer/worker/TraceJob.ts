import {TraceWorker} from "./TraceWorker";
import {Thread} from "./Thread";

export class TraceJob {

    private width:number;
    private height:number;
    private xoffset:number;
    private yoffset:number;
    private id:number;
    public finished:boolean;
    public thread:Thread;

    constructor(pixelMemory:Uint8Array, sceneMemory:Float32Array, param) {
        this.width = param.width;
        this.height = param.height;
        this.xoffset = param.xoffset;
        this.yoffset = param.yoffset;
        this.id = param.id;
        this.finished = false;
        var self = this;

        this.thread = new Thread("Worker: " + this.id);
        this.thread.onInitComplete = function(){
            //console.timeEnd("INIT_"+self.id);
            self.finished = true;
        };
        this.thread.onTraceComplete = function(){
            //console.timeEnd("TRACE_"+id);
            self.finished = true;
        };
        this.thread.sendCommand(TraceWorker.INIT);
        this.thread.sendData({
            id: this.id,
            pixelMemory: pixelMemory.buffer,
            sceneMemory: sceneMemory.buffer,
            camera: param.camera,
            cameraSamples: param.cameraSamples,
            hitSamples: param.hitSamples,
            bounces: param.bounces,
            full_width: param.full_width,
            full_height: param.full_height,
            width: param.width,
            height: param.height,
            xoffset: param.xoffset,
            yoffset: param.yoffset
        },[pixelMemory.buffer, sceneMemory.buffer]);
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
