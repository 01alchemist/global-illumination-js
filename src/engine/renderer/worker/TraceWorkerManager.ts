import {TraceJob} from "./TraceJob";
import {SharedScene} from "../../scene/SharedScene";
import {ByteArrayBase} from "../../../pointer/ByteArrayBase";
import {DirectMemory} from "../../../pointer/DirectMemory";
/**
 * Created by Nidin on 4/1/2016.
 */

export class TraceWorkerManager {

    private sceneMemory:DirectMemory;
    private kdTreeMemory:SharedArrayBuffer;
    private pixelMemory:Uint8ClampedArray;

    private jobs:Array<TraceJob>;
    iterations:number = 0;

    constructor() {
    }

    configure(param, scene:SharedScene) {

        console.log("configure");
        var width:number = param.width;
        var height:number = param.height;

        //this.sceneMemory = new Float32Array(new SharedArrayBuffer(param.scene.size * Float32Array.BYTES_PER_ELEMENT));
        this.sceneMemory = scene.getMemory();
        this.pixelMemory = new Uint8ClampedArray(new SharedArrayBuffer(width * height * 3));

        this.jobs = [];

        var num_threads:number = param.num_threads;

        if (num_threads <= 0) {
            num_threads = navigator["hardwareConcurrency"] || 2;
        }

        num_threads = num_threads > 2 ? 2 : num_threads;

        num_threads = 4;//debug temp

        console.info("hardwareConcurrency:" + num_threads);

        this.jobs = [];

        var thread_id = 0;
        if (num_threads > 1) {

            var _width = width / num_threads;
            var _height = height / num_threads;

            for (var j = 0; j < num_threads; j++) {
                for (var i = 0; i < num_threads; i++) {
                    this.jobs.push(
                        new TraceJob(
                            {
                                id: ++thread_id,
                                pixelBuffer: this.pixelMemory.buffer,
                                sceneBuffer: this.sceneMemory.buffer,
                                camera: param.camera,
                                cameraSamples: param.cameraSamples,
                                hitSamples: param.hitSamples,
                                bounces: param.bounces,
                                full_width: width,
                                full_height: height,
                                width: _width,
                                height: _height,
                                xoffset: i * _width,
                                yoffset: j * _height
                            }
                        ));
                }
            }
        } else {
            this.jobs.push(
                new TraceJob(
                    {
                        pixelBuffer: this.pixelMemory.buffer,
                        sceneBuffer: this.sceneMemory.buffer,
                        camera: param.camera,
                        cameraSamples: param.cameraSamples,
                        hitSamples: param.hitSamples,
                        bounces: param.bounces,
                        full_width: width,
                        full_height: height,
                        width: width,
                        height: height,
                        xoffset: 0,
                        yoffset: 0,
                        id: 0
                    }
                ));
        }

        this.totalThreads = thread_id;
    }

    get numWorkers():number {
        return this.jobs.length;
    }

    get pixels():Uint8ClampedArray {
        return this.pixelMemory;
    }

    init():void {
        this.initNext();
    }

    private initCount:number = 0;
    private totalThreads:number = 0;

    initNext() {
        console.time("initNext");
        //console.log("initCount:" + this.initCount + ", totalThreads:" + this.totalThreads);
        var self = this;
        if (this.initCount == this.totalThreads) {
            return;
        }
        this.jobs[this.initCount++].init(function () {
            self.initNext.bind(self)();
            console.timeEnd("initNext");
        });
    }

    render():void {
        var self = this;
        if (this.workersFinished()) {
            self.iterations++;
            this.jobs.forEach(function (w:TraceJob) {
                w.run(self.iterations);
            });
        }
    }

    workersFinished():boolean {
        var isAllFinished:boolean = true;
        for (var i = 0; i < this.jobs.length; i++) {
            if (!this.jobs[i].thread.initialized || !this.jobs[i].finished) {
                isAllFinished = false;
            }
        }
        return isAllFinished;
    }
}