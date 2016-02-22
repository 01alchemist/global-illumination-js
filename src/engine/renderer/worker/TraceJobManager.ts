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
    deferredQueue:TraceJob[];
    iterations:number = 0;
    updatePixels:Function;

    private pixelMemory:Uint8ClampedArray;
    private sampleMemory:Float32Array;
    private sceneMemory:DirectMemory;
    private traceParameters:any;
    private threads:Thread[];
    private initCount:number = 0;
    public maxLoop:number = 1;
    private currentLoop:number = 0;
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
        this.deferredQueue = [];
    }

    configure(param, scene:SharedScene) {

        console.log("configure");
        var width:number = param.width;
        var height:number = param.height;

        this.sceneMemory = scene.getMemory();
        this.pixelMemory = new Uint8ClampedArray(new SharedArrayBuffer(width * height * 3));
        this.sampleMemory = new Float32Array(new SharedArrayBuffer(4 * width * height * 3));

        this.traceParameters = {
            pixelBuffer: this.pixelMemory.buffer,
            sampleBuffer: this.sampleMemory.buffer,
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

    init(callback?):void {
        console.time("init");
        this.threads = ThreadPool.getThreads();
        this.totalThreads = this.threads.length;
        this.initNext(callback);
    }

    private initNext(callback) {
        var self = this;
        if (this.initCount == this.totalThreads) {
            this._initialized = true;
            console.timeEnd("init");
            if (callback) {
                callback();
            } else {
                this.start();
            }
            return;
        }

        this.threads[this.initCount++].init(this.traceParameters, [
            this.traceParameters.pixelBuffer,
            this.traceParameters.sampleBuffer,
            this.traceParameters.sceneBuffer
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
                self.deferredQueue.push(job);
                job.start(thread, function (t) {
                    self.processQueue.call(self, job, t);
                });
            });
        }
    }

    private isAllThreadsFree() {

        var thread:Thread;
        for (var i:number = 0; i < this.threads.length; i++) {
            thread = this.threads[i];
            if (thread.isTracing) {
                return false;
            }
        }
        return true;
    }

    private processQueue(job:TraceJob, thread:Thread) {
        if (this.updatePixels) {
            this.updatePixels(job.param);
        }
        if (this._finished) {
            return;
        }
        var self = this;
        if (this.queue.length > 0) {

            var job = self.queue.shift();
            self.deferredQueue.push(job);
            job.start(thread, function (t) {
                self.processQueue.call(self, job, t);
            });

        } else {
            if (this.isAllThreadsFree()) {
                this._finished = true;
                console.timeEnd('trace::start');
                this.initDeferredQueue();
            }
        }
    }

    private initDeferredQueue() {

        if (this.currentLoop >= this.maxLoop) {
            console.log("Rendering finished");
            return;
        }

        this.currentLoop++;
        this._finished = false;
        var self = this;
        self.deferredQueue.sort(function (a, b) {
            return b.time - a.time;
        });
        console.log("Trace time");
        console.log("   min:" + self.deferredQueue[self.deferredQueue.length - 1].time);
        console.log("   max:" + self.deferredQueue[0].time);

        if(this.currentLoop > 1){
            self.queue = self.deferredQueue.filter(function (a) {
                return a.time > 10;
            });
        }else {
            self.queue = self.deferredQueue;
        }

        self.deferredQueue = [];

        console.time('trace::start');

        if (this._initialized) {
            this.threads.forEach(function (thread:Thread) {
                var job = self.queue.shift();
                self.deferredQueue.push(job);
                job.start(thread, function (t) {
                    self.processQueue.call(self, job, t);
                });
            });
        }
    }
}
