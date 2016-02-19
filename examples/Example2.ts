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
import {SmartBucketRenderer} from "../src/engine/renderer/SmartBucketRenderer";
import {RenderBase} from "./RenderBase";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Example2 extends RenderBase {

    public paused:boolean = false;

    constructor() {
        super(2560 / 2, 1440 / 2);
    }

    onInit() {
        console.info("onInit");
        var scene:SharedScene = new SharedScene();

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
        
        var cameraSamples:number = 2;
        var hitSamples:number = 4;
        var bounces:number = 5;
        var iterations:number = 1;

        this.render(scene, camera, cameraSamples, hitSamples, bounces, iterations);
    }

}
new Example2();
