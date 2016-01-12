import {Camera} from "../../scene/Camera";
import {Scene} from "../../scene/Scene";
import {RGBA} from "../../math/Color";
import {Color} from "../../math/Color";
import {Ray} from "../../math/Ray";
import {Cube} from "../../scene/shapes/Cube";
import {Vector3} from "../../math/Vector3";
import {DiffuseMaterial} from "../../scene/materials/DiffuseMaterial";
import {Sphere} from "../../scene/shapes/Sphere";
import {LightMaterial} from "../../scene/materials/LightMaterial";
import {LinearAttenuation} from "../../scene/materials/Attenuation";
import {Renderer} from "../Renderer";
import {SpecularMaterial} from "../../scene/materials/SpecularMaterial";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class TraceWorker {

    static INIT:string = "INIT";
    static INITED:string = "INITED";
    static TRACE:string = "TRACE";
    static TRACED:string = "TRACED";
    static id:number;

    command:any;
    pixelMemory:Uint8ClampedArray;
    camera:Camera;
    scene:Scene;
    full_width:number;
    full_height:number;
    width:number;
    height:number;
    xoffset:number;
    yoffset:number;
    samples:Color[];
    cameraSamples:number;
    absCameraSamples:number;
    hitSamples:number;
    bounces:number;
    iterations:number = 1;

    constructor() {
        var self = this;
        console.log("Worker init");

        /*this.scene = new Scene();
        this.scene.add(Sphere.newSphere(new Vector3(1.5, 1, 0), 1, new SpecularMaterial(Color.hexColor(0x334D5C), 2)));
        this.scene.add(Sphere.newSphere(new Vector3(-1, 1, 2), 1, new SpecularMaterial(Color.hexColor(0xEFC94C), 2)));
        this.scene.add(Cube.newCube(new Vector3(-100, -1, -100), new Vector3(100, 0, 100), new DiffuseMaterial(new Color(1, 1, 1))));
        this.scene.add(Sphere.newSphere(new Vector3(-1, 4, -1), 0.5, new LightMaterial(new Color(1, 1, 1), 3, new LinearAttenuation(1))));
        this.scene.compile();*/
        //this.camera = Camera.lookAt(new Vector3(0, 2, -5), new Vector3(0, 0, 3), new Vector3(0, 1, 0), 45);

        addEventListener('message', (e:any) => {

            if (self.command == null) {
                self.command = e.data;
            } else if (self.command == TraceWorker.INIT) {

                self.command = null;
                self.pixelMemory = new Uint8ClampedArray(e.data.pixelMemory);

                TraceWorker.id = e.data.id;
                if(!self.camera){
                    self.camera = Camera.fromJson(e.data.camera);
                }
                if(!self.scene){
                    self.scene = Scene.fromJson(e.data.scene);
                    self.scene.compile();
                }
                //this.scene.add(Sphere.newSphere(new Vector3(-1, 4, -1), 0.5, new LightMaterial(new Color(1, 1, 1), 3, new LinearAttenuation(1))));
                //self.scene.rays = 0;

                self.full_width = e.data.full_width;
                self.full_height = e.data.full_height;
                self.cameraSamples = e.data.cameraSamples;
                self.hitSamples = e.data.hitSamples;
                self.bounces = e.data.bounces;

                self.init(
                    e.data.width,
                    e.data.height,
                    e.data.xoffset,
                    e.data.yoffset
                );

                postMessage(TraceWorker.INITED);

            } else if (self.command == TraceWorker.TRACE) {
                self.command = null;
                self.run();
                postMessage(TraceWorker.TRACED);
            }
        }, false);
    }

    init(width:number, height:number, xoffset:number, yoffset:number):void {
        this.width = width;
        this.height = height;
        this.xoffset = xoffset;
        this.yoffset = yoffset;

        this.samples = [];
        this.absCameraSamples = Math.round(Math.abs(this.cameraSamples));
    }

    run():void {

        //console.time("render");
        for (var y:number = this.yoffset; y < this.yoffset + this.width; y++) {

            for (var x:number = this.xoffset; x < this.xoffset + this.width; x++) {

                var _x:number = x - this.xoffset;
                var _y:number = y - this.yoffset;

                var c:Color = new Color();

                if (this.cameraSamples <= 0) {
                    // random subsampling
                    for (let i = 0; i < this.absCameraSamples; i++) {
                        var fu = Math.random();
                        var fv = Math.random();
                        var ray = this.camera.castRay(x, y, this.full_width, this.full_height, fu, fv);
                        //var ray = this.camera.castRay(_x, _y, this.width, this.height, fu, fv);
                        c = c.add(this.scene.sample(ray, true, this.hitSamples, this.bounces))
                    }
                    c = c.divScalar(this.absCameraSamples)
                } else {
                    // stratified subsampling
                    var n:number = Math.round(Math.sqrt(this.cameraSamples));
                    for (var u = 0; u < n; u++) {
                        for (var v = 0; v < n; v++) {
                            var fu = (u + 0.5) / n;
                            var fv = (v + 0.5) / n;
                            var ray:Ray = this.camera.castRay(x, y, this.full_width, this.full_height, fu, fv);
                            //var ray = this.camera.castRay(_x, _y, this.width, this.height, fu, fv);
                            c = c.add(this.scene.sample(ray, true, this.hitSamples, this.bounces));
                        }
                    }
                    c = c.divScalar(n * n);
                }
                c = c.pow(1 / 2.2);

                var ci:number = (_y * this.width) + _x;

                if (!this.samples[ci]) {
                    this.samples[ci] = c;
                } else {
                    this.samples[ci] = this.samples[ci].add(c);
                }

                var avg_rgba:RGBA = this.samples[ci].divScalar(this.iterations).RGBA();

                var screen_index:number = (y * (this.full_width * 3)) + (x * 3);
                this.drawColor(screen_index, avg_rgba);
                if (Renderer.DEBUG && x == this.xoffset || Renderer.DEBUG && y == this.yoffset) {
                    this.drawPixelInt(screen_index, 0xFFFF00F);
                }
            }
        }
        this.iterations++;
        //console.timeEnd("render");
    }

    drawColor(i:number, rgba:RGBA):void {

        this.pixelMemory[i] = rgba.r;
        this.pixelMemory[i + 1] = rgba.g;
        this.pixelMemory[i + 2] = rgba.b;

    }
    drawPixelInt(i:number, color:number) {

        var red = (color >> 16) & 255;
        var green = (color >> 8) & 255;
        var blue = color & 255;

        this.pixelMemory[i] = red;
        this.pixelMemory[i + 1] = green;
        this.pixelMemory[i + 2] = blue;
    }
}
new TraceWorker();