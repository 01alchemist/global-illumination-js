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
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Example2 extends CanvasDisplay {

    private renderer:Renderer;
    private pixels:Uint8ClampedArray;
    public paused:boolean = false;

    constructor() {
        super();
        console.info("Example1");
    }

    onInit() {
        console.info("onInit");
        var scene:Scene = new SharedScene();

        var material = new GlossyMaterial(Color.hexColor(0xEFC94C), 3, MathUtils.radians(30));
        var whiteMat = new GlossyMaterial(new Color(1, 1, 1), 3, MathUtils.radians(30));
        for(var x = 0; x < 10; x++){
            for(var z = 0; z < 10; z++){
                var center = new Vector3(x - 4.5, 0, z - 4.5);
                scene.add(Sphere.newSphere(center, 0.4, material));
            }
        }
        scene.add(Cube.newCube(new Vector3(-100, -1, -100), new Vector3(100, 0, 100), whiteMat));
        scene.add(Sphere.newSphere(new Vector3(-1, 3, -1), 0.5, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));

        var camera:Camera = Camera.lookAt(new Vector3(0, 4, -8), new Vector3(0, 0, -2), new Vector3(0, 1, 0), 45);
        
        
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
new Example2();
