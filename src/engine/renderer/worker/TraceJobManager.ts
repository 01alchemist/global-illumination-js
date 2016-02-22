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

    private width:number;
    private height:number;
    private pixelMemory:Uint8ClampedArray;
    private sampleMemory:Float32Array;
    private sceneMemory:DirectMemory;
    private flags:Uint8Array;
    private traceParameters:any;
    private threads:Thread[];
    private initCount:number = 0;
    public maxLoop:number = 1;
    private currentLoop:number = 0;
    private midTime:number = 10;//ms
    private totalThreads:number = 0;
    private _initialized:boolean;
    private _finished:boolean;
    private _await:boolean;

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
        this.width = param.width;
        this.height = param.height;

        this.sceneMemory = scene.getMemory();
        this.flags = new Uint8Array(this.sceneMemory.data.buffer, 0, 3);
        this.pixelMemory = new Uint8ClampedArray(new SharedArrayBuffer(this.width * this.height * 3));
        this.sampleMemory = new Float32Array(new SharedArrayBuffer(4 * this.width * this.height * 3));

        this.traceParameters = {
            pixelBuffer: this.pixelMemory.buffer,
            sampleBuffer: this.sampleMemory.buffer,
            sceneBuffer: this.sceneMemory.buffer,
            camera: param.camera,
            cameraSamples: param.cameraSamples,
            hitSamples: param.hitSamples,
            bounces: param.bounces,
            full_width: this.width,
            full_height: this.height
        };
    }

    add(job:TraceJob) {
        this.queue.push(job);
    }

    clear() {
        for (var y:number = 0; y < this.height; y++) {
            for (var x:number = 0; x < this.width; x++) {
                var si:number = (y * (this.width * 3)) + (x * 3);
                this.pixelMemory[si] = this.sampleMemory[si] = 0;
                this.pixelMemory[si + 1] = this.sampleMemory[si + 1] = 0;
                this.pixelMemory[si + 2] = this.sampleMemory[si + 2] = 0;
            }
        }

        if (this.updatePixels) {
            this.updatePixels({
                xoffset: 0,
                yoffset: 0,
                width: this.width,
                height: this.height,
                pixels: this.pixelMemory
            });
        }
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

    pause() {
        this.flags[0] = 1;
        this._await = true;
    }

    resume() {
        this.flags[0] = 0;
        this._await = false;
    }

    stop() {
        this.flags[0] = 1;
        this._await = true;
        var thread:Thread;
        for (var i:number = 0; i < this.threads.length; i++) {
            thread = this.threads[i];
            thread.terminate();
        }
    }

    restart() {
        this.flags[0] = 0;
        this.queue = this.deferredQueue.concat(this.queue);
        this.deferredQueue = [];
        this._await = false;
        this.start();
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

    start() {
        console.log("queue:" + this.queue.length);
        console.time('trace::start');
        var self = this;
        if (this._initialized) {

            var thread:Thread;
            var job:TraceJob;

            for (var i:number = 0; i < this.threads.length; i++) {
                thread = this.threads[i];
                if (self.queue.length > 0) {
                    job = self.queue.shift();
                    self.deferredQueue.push(job);
                    job.start(thread, function (_job, _thread) {
                        if (!self._await) {
                            self.processQueue.call(self, _job, _thread);
                        }
                    });
                } else {
                    break;
                }
            }
        }
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
            job.start(thread, function (_job, _thread) {
                if (!self._await) {
                    self.processQueue.call(self, _job, _thread);
                }
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
        /*self.deferredQueue.sort(function (a, b) {
         return b.time - a.time;
         });*/
        /*console.log("Trace time");
        console.log("   min:" + self.deferredQueue[self.deferredQueue.length - 1].time);
        console.log("   max:" + self.deferredQueue[0].time);*/

        if (this.currentLoop > 1) {

            /*if (this.midTime === 0) {
             //this.midTime = self.deferredQueue[self.deferredQueue.length - 1].time;
             this.midTime = self.deferredQueue[Math.floor(self.deferredQueue.length / 2)].time;
             }*/

            self.queue = self.deferredQueue;
            /*self.queue = self.deferredQueue.filter(function (a) {
             return a.time > self.midTime;
             });*/
        } else {
            self.queue = self.deferredQueue;
        }

        self.deferredQueue = [];

        console.time('trace::start');
        this.start();
    }
}
