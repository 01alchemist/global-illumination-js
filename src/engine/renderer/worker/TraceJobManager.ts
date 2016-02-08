import {TraceJob} from "./TraceJob";
import {ThreadPool} from "./ThreadPool";
import {DirectMemory} from "../../../pointer/DirectMemory";
import {SharedScene} from "../../scene/SharedScene";
import {TraceWorker} from "./TraceWorker";
import {Thread} from "./Thread";
/**
 * Created by Nidin Vinayakan on 08-02-2016.
 */
export class TraceJobManager {

    queue:TraceJob[];
    iterations:number = 0;
    updatePixels:Function;

    private pixelMemory:Uint8ClampedArray;
    private sceneMemory:DirectMemory;
    private traceParameters:any;
    private threads:Thread[];
    private initCount:number = 0;
    private totalThreads:number = 0;
    private _initialized:boolean;
    private _finished:boolean;

    get initialized():boolean {
        return this._initialized;
    }

    get finished():boolean {
        return this._finished;
    }

    get pixels():Uint8ClampedArray {
        return this.pixelMemory;
    }

    constructor() {
        this.queue = [];
    }

    configure(param, scene:SharedScene) {

        console.log("configure");
        var width:number = param.width;
        var height:number = param.height;

        this.sceneMemory = scene.getMemory();
        this.pixelMemory = new Uint8ClampedArray(new SharedArrayBuffer(width * height * 3));

        this.traceParameters = {
            pixelBuffer: this.pixelMemory.buffer,
            sceneBuffer: this.sceneMemory.buffer,
            camera: param.camera,
            cameraSamples: param.cameraSamples,
            hitSamples: param.hitSamples,
            bounces: param.bounces,
            full_width: width,
            full_height: height
        };
    }

    add(job:TraceJob) {
        this.queue.push(job);
    }

    init():void {
        console.time("init");
        this.threads = ThreadPool.getThreads();
        this.totalThreads = this.threads.length;
        this.initNext();
    }

    initNext() {
        var self = this;
        if (this.initCount == this.totalThreads) {
            this._initialized = true;
            console.timeEnd("init");
            this.start();
            return;
        }

        this.threads[this.initCount++].init(this.traceParameters, [
            this.traceParameters.pixelBuffer, this.traceParameters.sceneBuffer
        ], function () {
            self.initNext.bind(self)();
        });
    }

    start() {
        console.log("queue:" + this.queue.length);
        console.time('trace::start');
        var self = this;
        if (this._initialized) {
            this.threads.forEach(function (thread:Thread) {
                var job = self.queue.shift();
                job.start(thread, function(t){
                    self.processQueue.call(self, job, t);
                });
            });
        }
    }

    processQueue(job:TraceJob, thread:Thread) {
        if(this.updatePixels){
            this.updatePixels(job.param);
        }
        if (this._finished) {
            return;
        }
        var self = this;
        if (this.queue.length > 0) {

            var job = self.queue.shift();
            job.start(thread, function(t){
                self.processQueue.call(self, job, t);
            });

        } else {
            this._finished = true;
            console.timeEnd('trace::start');
        }
    }
}
