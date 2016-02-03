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
import {ClearMaterial} from "../src/engine/scene/materials/ClearMaterial";
import {MathUtils} from "../src/engine/utils/MathUtils";
import {GlossyMaterial} from "../src/engine/scene/materials/GlossyMaterial";
import {QuadraticAttenuation} from "../src/engine/scene/materials/Attenuation";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Example1 extends CanvasDisplay {

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
        var glass = new ClearMaterial(1.8, MathUtils.radians(1));
        var redGlossy = new GlossyMaterial(new Color(1,0,0), 1.5, MathUtils.radians(0));

        var white = new DiffuseMaterial(new Color(0.740, 0.742, 0.734));
        var red = new DiffuseMaterial(new Color(0.366, 0.037, 0.042));
        var green = new DiffuseMaterial(new Color(0.163, 0.409, 0.083));
        glass.transparent = true;

        scene.add(Sphere.newSphere(new Vector3(-3, 0.5, 1), 0.5, redGlossy));
        scene.add(Sphere.newSphere(new Vector3(-1, 1, -2), 1, glass));
        scene.add(Sphere.newSphere(new Vector3(1.5, 1, 0), 1, new SpecularMaterial(Color.hexColor(0x334D5C), 2)));
        scene.add(Sphere.newSphere(new Vector3(-1, 1, 2), 1, new SpecularMaterial(Color.hexColor(0xEFC94C), 2)));
        scene.add(Cube.newCube(new Vector3(-100, -1, -100), new Vector3(100, 0, 100), new DiffuseMaterial(new Color(1, 1, 1))));

        var light = new LightMaterial(new Color(0.780, 0.780, 0.776), 10, new QuadraticAttenuation(0.1));

        var n = 10.0;
        scene.add(Cube.newCube(new Vector3(-n, -11, -n), new Vector3(n, -10, n), white));
        scene.add(Cube.newCube(new Vector3(-n, 10, -n), new Vector3(n, 11, n), white));
        scene.add(Cube.newCube(new Vector3(-n, -n, 10), new Vector3(n, n, 11), white));
        scene.add(Cube.newCube(new Vector3(-11, -n, -n), new Vector3(-10, n, n), red));
        scene.add(Cube.newCube(new Vector3(10, -n, -n), new Vector3(11, n, n), green));

        scene.add(Sphere.newSphere(new Vector3(-1, 10, 1), 0.5, new LightMaterial(new Color(1, 1, 1), 5, new LinearAttenuation(1))));

        var camera:Camera = Camera.lookAt(new Vector3(0, 4, -8), new Vector3(0, 0, 3), new Vector3(0, 1, 0), 45);
        this.renderer = new Renderer();
        this.i_width = 2560 / 4;
        this.i_height = 1440 / 4;
        var cameraSamples:number = 1;
        var hitSamples:number = 16;
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
new Example1();
