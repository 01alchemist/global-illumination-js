///<reference path="worker/TraceWorkerManager.ts"/>
import {Camera} from "../scene/Camera";
import {Scene} from "../scene/Scene";
import {Color} from "../math/Color";
import {RGBA} from "../math/Color";
import {Ray} from "../math/Ray";
import {TraceWorkerManager} from "./worker/TraceWorkerManager";
import {SharedScene} from "../scene/SharedScene";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class Renderer {

    static DEBUG:boolean = false;

    workerManager:TraceWorkerManager;
    get initialized():boolean{
        return this.workerManager.initialized;
    }

    constructor(private userWorker:boolean = false) {
        if (this.userWorker) {
            this.workerManager = new TraceWorkerManager();
        }
    }

    static interval:number = 0;

    get iterations():number {
        return this.workerManager.iterations;
    }

    initParallelRender(scene:SharedScene, camera:Camera, w:number, h:number, cameraSamples:number, hitSamples:number, bounces:number):Uint8ClampedArray {
        if (!this.workerManager) {
            this.workerManager = new TraceWorkerManager();
        }
        this.workerManager.configure({
                camera:camera,
                width:w,
                height:h,
                cameraSamples:cameraSamples,
                hitSamples:hitSamples,
                bounces:bounces
            },
            scene
        );
        this.workerManager.init();
        this.workerManager.render();
        return this.workerManager.pixels;
    }

    iterateParallel() {
        this.workerManager.render();
    }

    render(scene:Scene, camera:Camera, w:number, h:number, cameraSamples:number, hitSamples:number, bounces:number):Uint8ClampedArray {
        var ncpu:number = navigator["hardwareConcurrency"] || 4;
        scene.compile();
        //var result = image.NewRGBA(image.Rect(0, 0, w, h));
        //var result:Uint8ClampedArray = new Uint8ClampedArray(w * h * 4);
        var result:RGBA[] = [];
        var pixels:Uint8ClampedArray = new Uint8ClampedArray(w * h * 4);
        //var ch = make(chan int, h);
        var ch = [];
        var absCameraSamples:number = Math.round(Math.abs(cameraSamples));
        //fmt.Printf("%d x %d pixels, %d x %d = %d samples, %d bounces, %d cores\n",
        //w, h, absCameraSamples, hitSamples, absCameraSamples*hitSamples, bounces, ncpu)
        var start:number = performance.now();
        console.time("render");
        scene.rays = 0;

        for (let i:number = 0; i < ncpu; i++) {

            function go(i:number) {

                //console.time("go");

                for (var y:number = i; y < h; y += ncpu) {

                    for (var x:number = 0; x < w; x++) {

                        var c:Color = new Color();

                        if (cameraSamples <= 0) {
                            // random subsampling
                            //console.log("random subsampling");
                            for (let i = 0; i < absCameraSamples; i++) {
                                var fu = Math.random();
                                var fv = Math.random();
                                var ray = camera.castRay(x, y, w, h, fu, fv);
                                c = c.add(scene.sample(ray, true, hitSamples, bounces))
                            }
                            c = c.divScalar(absCameraSamples)
                        } else {
                            // stratified subsampling
                            //console.log("stratified subsampling");
                            var n:number = Math.round(Math.sqrt(cameraSamples));
                            for (var u = 0; u < n; u++) {
                                for (var v = 0; v < n; v++) {
                                    var fu = (u + 0.5) / n;
                                    var fv = (v + 0.5) / n;
                                    var ray:Ray = camera.castRay(x, y, w, h, fu, fv);
                                    //console.log(ray.toString());
                                    /*if(Scene.interval % 100 == 0){
                                     console.log(ray);
                                     Scene.interval++;
                                     }*/

                                    c = c.add(scene.sample(ray, true, hitSamples, bounces));
                                }
                            }
                            c = c.divScalar(n * n);
                        }
                        c = c.pow(1 / 2.2);

                        //result.SetRGBA(x, y, c.RGBA());
                        var rgba:RGBA = c.RGBA();
                        var color_index:number = (y * w) + x;
                        var index:number = (y * (w * 4)) + (x * 4);
                        result[color_index] = rgba;
                        pixels[index] = rgba.r;
                        pixels[index + 1] = rgba.g;
                        pixels[index + 2] = rgba.b;
                        pixels[index + 3] = rgba.a;
                    }
                    //ch <- 1
                }


                console.timeEnd("go");
            }

            go(i);

        }
        console.timeEnd("render");
        return pixels;
    }

    showProgress(start, rayCount) {
    }

    iterativeRender(pathTemplate:string, iterations:number, scene:Scene, camera:Camera, w:number, h:number, cameraSamples:number, hitSamples:number, bounces:number) {
        scene.compile();
        var pixels:Color[] = [];
        var result = [];//image.NewRGBA(image.Rect(0, 0, w, h))
        for (var i = 1; i <= iterations; i++) {
            //console.log("\n[Iteration %d of %d]\n", i, iterations)
            var frame = this.render(scene, camera, w, h, cameraSamples, hitSamples, bounces);
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    var index = y * w + x;
                    var pi = y * (w * 4) + (x * 4);
                    var c = Color.newColor({
                        r:frame[pi],
                        g:frame[pi + 1],
                        b:frame[pi + 2],
                        a:frame[pi + 3]
                    });
                    pixels[index] = pixels[index].add(c);
                    var avg = pixels[index].divScalar(i);
                    result[index] = avg.RGBA();
                }
            }
            //TODO:draw to canvas
        }
        return null;
    }
}
