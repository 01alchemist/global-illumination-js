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
export class Example3 extends CanvasDisplay {

    private renderer:Renderer;
    private pixels:Uint8ClampedArray;
    public paused:boolean = false;

    constructor() {
        super();
        console.info("Example1");
    }

    onInit() {
        console.info("onInit");
        var scene:SharedScene = new SharedScene();

        var material = new DiffuseMaterial(Color.hexColor(0xFCFAE1));
        scene.add(Cube.newCube(new Vector3(-1000, -1, -1000), new Vector3(1000, 0, 1000), material));
        for(var x = -20; x <= 20; x++){
            for(var z = -20; z <= 20; z++){
                if((x+z)%2 == 0){
                    continue;
                }
                var s = 0.1;
                var min = new Vector3(x - s, 0, z - s);
            var max = new Vector3(x + s, 2, z + s);
                scene.add(Cube.newCube(min, max, material));
            }
        }
        scene.add(Cube.newCube(new Vector3(-5, 10, -5), new Vector3(5, 11, 5), new LightMaterial(new Color(1, 0, 0), 5, new QuadraticAttenuation(0.05))));
        var camera:Camera = Camera.lookAt(new Vector3(20, 10, 0), new Vector3(8, 0, 0), new Vector3(0, 1, 0), 45);
        
        
        this.renderer = new Renderer();
        /*this.i_width = 2560 / 2;
        this.i_height = 1440 / 2;*/
        this.i_width = 1280/8;
        this.i_height = 720/8;
        var cameraSamples:number = 2;
        var hitSamples:number = 1;
        var bounces:number = 3;

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
new Example3();
