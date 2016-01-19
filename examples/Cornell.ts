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
import {TransformedShape} from "../src/engine/scene/shapes/TransformedShape";
import {Matrix4} from "../src/engine/math/Matrix4";
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
        var scene:SharedScene = new SharedScene();

        var white = new DiffuseMaterial(new Color(0.740, 0.742, 0.734));
        var red = new DiffuseMaterial(new Color(0.366, 0.037, 0.042));
        var green = new DiffuseMaterial(new Color(0.163, 0.409, 0.083));
        var light = new LightMaterial(new Color(0.780, 0.780, 0.776), 10, new QuadraticAttenuation(0.1));
        var n = 10.0;
        scene.add(Cube.newCube(new Vector3(-n, -11, -n), new Vector3(n, -10, n), white));
        scene.add(Cube.newCube(new Vector3(-n, 10, -n), new Vector3(n, 11, n), white));
        scene.add(Cube.newCube(new Vector3(-n, -n, 10), new Vector3(n, n, 11), white));
        scene.add(Cube.newCube(new Vector3(-11, -n, -n), new Vector3(-10, n, n), red));
        scene.add(Cube.newCube(new Vector3(10, -n, -n), new Vector3(11, n, n), green));
        scene.add(Sphere.newSphere(new Vector3(3, -7, -3), 3, white));
        var cube = Cube.newCube(new Vector3(-3, -4, -3), new Vector3(3, 4, 3), white);
        var transform = Matrix4.rotate(new Vector3(0, 1, 0), MathUtils.radians(30)).translate(new Vector3(-3, -6, 4));
        scene.add(TransformedShape.newTransformedShape(cube, transform));
        scene.add(Cube.newCube(new Vector3(-2, 9.8, -2), new Vector3(2, 10, 2), light));
        var camera = Camera.lookAt(new Vector3(0, 0, -20), new Vector3(0, 0, 1), new Vector3(0, 1, 0), 65);
        
        this.renderer = new Renderer();
        this.i_width = 2560 / 2;
        this.i_height = 1440 / 2;
        var cameraSamples:number = 4;
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
new Cornell();
