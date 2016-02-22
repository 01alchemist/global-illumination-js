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
import {GlossyMaterial} from "../src/engine/scene/materials/GlossyMaterial";
import {MathUtils} from "../src/engine/utils/MathUtils";
import {SharedScene} from "../src/engine/scene/SharedScene";
import {QuadraticAttenuation} from "../src/engine/scene/materials/Attenuation";
import {TransparentMaterial} from "../src/engine/scene/materials/TransparentMaterial";
import {Box} from "../src/engine/scene/shapes/Box";
import {DiffuseMaterial} from "../src/engine/scene/materials/DiffuseMaterial";
import {LinearAttenuation} from "../src/engine/scene/materials/Attenuation";
import {ClearMaterial} from "../src/engine/scene/materials/ClearMaterial";
import {SmartBucketRenderer} from "../src/engine/renderer/SmartBucketRenderer";
import {Material} from "../src/engine/scene/materials/Material";
import {RenderBase} from "./RenderBase";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Materials extends RenderBase {

    public paused:boolean = false;

    constructor() {
        super(2560 / 2, 1440 / 2);
    }

    onInit() {

        var scene:SharedScene = new SharedScene();

        var r = 0.4;
        var material:Material;

        material = new DiffuseMaterial(Color.hexColor(0x334D5C));
        scene.add(Sphere.newSphere(new Vector3(-2, r, 0), r, material));

        material = new SpecularMaterial(Color.hexColor(0x334D5C), 2);
        scene.add(Sphere.newSphere(new Vector3(-1, r, 0), r, material));

        material = new GlossyMaterial(Color.hexColor(0x334D5C), 2, MathUtils.radians(50));
        scene.add(Sphere.newSphere(new Vector3(0, r, 0), r, material));

        material = new TransparentMaterial(Color.hexColor(0x334D5C), 2, MathUtils.radians(20), 1);
        scene.add(Sphere.newSphere(new Vector3(1, r, 0), r, material));

        material = new ClearMaterial(2, 0);
        scene.add(Sphere.newSphere(new Vector3(2, r, 0), r, material));

        material = new SpecularMaterial(Color.hexColor(0xFFFFFF), 1000);
        scene.add(Sphere.newSphere(new Vector3(0, 1.5, -4), 1.5, material));

        scene.add(Cube.newCube(new Vector3(-1000, -1, -1000), new Vector3(1000, 0, 1000), new GlossyMaterial(Color.hexColor(0xFFFFFF), 1.4, MathUtils.radians(20))));
        scene.add(Sphere.newSphere(new Vector3(0, 5, 0), 1, new LightMaterial(new Color(1, 1, 1), 3, new LinearAttenuation(0.4))));
        var camera = Camera.lookAt(new Vector3(0, 3, 6), new Vector3(0, 1, 0), new Vector3(0, 1, 0), 30);

        var cameraSamples:number = -1;
        var hitSamples:number = 16;
        var bounces:number = 16;
        var iterations:number = 1;
        var blockIterations:number = 1;

        this.render(scene, camera, cameraSamples, hitSamples, bounces, iterations, blockIterations);
    }

}
new Materials();
