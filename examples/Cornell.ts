import {Color} from "../src/engine/math/Color";
import {LightMaterial} from "../src/engine/scene/materials/LightMaterial";
import {Vector3} from "../src/engine/math/Vector3";
import {Sphere} from "../src/engine/scene/shapes/Sphere";
import {Scene} from "../src/engine/scene/Scene";
import {SpecularMaterial} from "../src/engine/scene/materials/SpecularMaterial";
import {Camera} from "../src/engine/scene/Camera";
import {Renderer} from "../src/engine/renderer/Renderer";
import {Cube} from "../src/engine/scene/shapes/Cube";
import {NoAttenuation} from "../src/engine/scene/materials/Attenuation";
import {OBJLoader} from "../src/engine/data/OBJLoader";
import {CanvasDisplay} from "./CanvasDisplay";
import {DiffuseMaterial} from "../src/engine/scene/materials/DiffuseMaterial";
import {LinearAttenuation} from "../src/engine/scene/materials/Attenuation";
import {SharedScene} from "../src/engine/scene/SharedScene";
import {GlossyMaterial} from "../src/engine/scene/materials/GlossyMaterial";
import {MathUtils} from "../src/engine/utils/MathUtils";
import {QuadraticAttenuation} from "../src/engine/scene/materials/Attenuation";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Cornell extends CanvasDisplay {

    private renderer:Renderer;
    private pixels:Uint8ClampedArray;
    public paused:boolean = false;

    constructor() {
        super();
        console.info("Cornell");
    }

    onInit() {
        console.info("onInit");
        var scene:Scene = new SharedScene();

        white := new DiffuseMaterial(pt.Color{0.740, 0.742, 0.734})
        red := new DiffuseMaterial(pt.Color{0.366, 0.037, 0.042})
        green := new DiffuseMaterial(pt.Color{0.163, 0.409, 0.083})
        light := new LightMaterial(pt.Color{0.780, 0.780, 0.776}, 10, pt.QuadraticAttenuation(0.1))
        scene := pt.Scene{}
        n := 10.0
        scene.Add(pt.NewCube(pt.Vector{-n, -11, -n}, pt.Vector{n, -10, n}, white))
        scene.Add(pt.NewCube(pt.Vector{-n, 10, -n}, pt.Vector{n, 11, n}, white))
        scene.Add(pt.NewCube(pt.Vector{-n, -n, 10}, pt.Vector{n, n, 11}, white))
        scene.Add(pt.NewCube(pt.Vector{-11, -n, -n}, pt.Vector{-10, n, n}, red))
        scene.Add(pt.NewCube(pt.Vector{10, -n, -n}, pt.Vector{11, n, n}, green))
        scene.Add(pt.NewSphere(pt.Vector{3, -7, -3}, 3, white))
        cube := pt.NewCube(pt.Vector{-3, -4, -3}, pt.Vector{3, 4, 3}, white)
        transform := pt.Rotate(pt.Vector{0, 1, 0}, pt.Radians(30)).Translate(pt.Vector{-3, -6, 4})
        scene.Add(pt.NewTransformedShape(cube, transform))
        scene.Add(pt.NewCube(pt.Vector{-2, 9.8, -2}, pt.Vector{2, 10, 2}, light))
        camera := pt.LookAt(pt.Vector{0, 0, -20}, pt.Vector{0, 0, 1}, pt.Vector{0, 1, 0}, 65)
        
        
        this.renderer = new Renderer();
        this.i_width = 2560 / 2;
        this.i_height = 1440 / 2;
        var cameraSamples:number = 2;
        var hitSamples:number = 4;
        var bounces:number = 5;

        this.pixels = this.renderer.initParallelRender(
            scene, camera, this.i_width, this.i_height, cameraSamples, hitSamples, bounces
        );
        this.drawPixels(this.pixels, {x: 0, y: 0, width: this.i_width, height: this.i_height});

        requestAnimationFrame(this.render.bind(this));

    }

    render() {
        if (!this.paused) {
            this.renderer.iterateParallel();
            this.updatePixels(this.pixels, this.renderer.iterations);
            requestAnimationFrame(this.render.bind(this));
        }
    }

}
new Cornell();
