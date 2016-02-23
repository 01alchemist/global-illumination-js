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
import {TransparentMaterial} from "../src/engine/scene/materials/TransparentMaterial";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class TestCase extends RenderBase {

    public paused:boolean = false;

    constructor() {
        super(2560/2, 1440/2);


        this.sceneList.push("Materials");

    }

    onInit() {
        console.info("onInit");
        var scene:SharedScene = new SharedScene();

        //default ground
        scene.add(Cube.newCube(new Vector3(-100, -1, -100), new Vector3(100, 0, 100), new DiffuseMaterial(new Color(1, 1, 1))));
        //lights
        scene.add(Sphere.newSphere(new Vector3(0, 5, 0), 1, new LightMaterial(new Color(1, 1, 1), 1, new LinearAttenuation(0.84))));
        //scene.add(Sphere.newSphere(new Vector3(-1, 4, -1), 0.5, new LightMaterial(new Color(1, 1, 1), 3, new LinearAttenuation(1))));

        var camera:Camera = Camera.lookAt(new Vector3(-3, 2, -7), new Vector3(0, 0, 3), new Vector3(0, 1, 0), 45);

        var glass = new ClearMaterial(2, 0);
        var roughGlass = new ClearMaterial(1.5, MathUtils.radians(24));
        var mirror = new SpecularMaterial(Color.hexColor(0xFFFFFF), 1000);
        var tintedGlass = new TransparentMaterial(Color.hexColor(0x00ff00), 2, MathUtils.radians(0), 0.5);
        var red = new GlossyMaterial(new Color(1,0,0), 1.5, MathUtils.radians(0));
        glass.transparent = true;
        scene.add(Sphere.newSphere(new Vector3(-3, 0.5, 1), 0.5, red));
        scene.add(Sphere.newSphere(new Vector3(-2, 0.5, -1), 0.5, glass));
        scene.add(Sphere.newSphere(new Vector3(-3.5, 0.5, -1), 0.5, roughGlass));
        scene.add(Sphere.newSphere(new Vector3(-4, 1, 4), 1, mirror));
        scene.add(Sphere.newSphere(new Vector3(0, 0.5, -1), 0.5, tintedGlass));
        scene.add(Sphere.newSphere(new Vector3(1.5, 1, 0), 1, new SpecularMaterial(Color.hexColor(0x334D5C), 2)));
        scene.add(Sphere.newSphere(new Vector3(-1, 1, 2), 1, new SpecularMaterial(Color.hexColor(0xEFC94C), 2)));

        var cameraSamples:number = -1;
        var hitSamples:number = 16;
        var bounces:number = 6;
        var iterations:number = 5000;
        var blockIterations:number = 4;

        this.render(scene, camera, cameraSamples, hitSamples, bounces, iterations, blockIterations);
    }

    //configure GUI
    onSceneChange(newValue){
        console.log(newValue);
    }
}
new TestCase();
