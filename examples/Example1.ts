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
import {RenderBase} from "./RenderBase";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Example1 extends RenderBase {

    public paused:boolean = false;

    constructor() {
        super(2560 / 2, 1440 / 2);
    }

    onInit() {
        console.info("onInit");
        var scene:SharedScene = new SharedScene();
        var glass = new ClearMaterial(1.05, MathUtils.radians(1));
        var red = new GlossyMaterial(new Color(1,0,0), 1.5, MathUtils.radians(0));
        glass.transparent = true;
        scene.add(Sphere.newSphere(new Vector3(-3, 0.5, 1), 0.5, red));
        scene.add(Sphere.newSphere(new Vector3(-1, 0.5, 1), 2, glass));
        scene.add(Sphere.newSphere(new Vector3(1.5, 1, 0), 1, new SpecularMaterial(Color.hexColor(0x334D5C), 2)));
        scene.add(Sphere.newSphere(new Vector3(-1, 1, 2), 1, new SpecularMaterial(Color.hexColor(0xEFC94C), 2)));
        scene.add(Cube.newCube(new Vector3(-100, -1, -100), new Vector3(100, 0, 100), new DiffuseMaterial(new Color(1, 1, 1))));
        scene.add(Sphere.newSphere(new Vector3(-1, 4, -1), 0.5, new LightMaterial(new Color(1, 1, 1), 3, new LinearAttenuation(1))));

        var camera:Camera = Camera.lookAt(new Vector3(0, 2, -5), new Vector3(0, 0, 3), new Vector3(0, 1, 0), 45);

        var cameraSamples:number = 4;
        var hitSamples:number = 1;
        var bounces:number = 5;
        var iterations:number = 1;

        this.render(scene, camera, cameraSamples, hitSamples, bounces, iterations);
    }
}
new Example1();
