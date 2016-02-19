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
import {DiffuseMaterial} from "../src/engine/scene/materials/DiffuseMaterial";
import {ClearMaterial} from "../src/engine/scene/materials/ClearMaterial";
import {RenderBase} from "./RenderBase";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Suzanne extends RenderBase {

    public paused:boolean = false;

    constructor() {
        super(2560 / 2, 1440 / 2);
    }

    onInit() {

        var scene:SharedScene = new SharedScene();
        var material = new DiffuseMaterial(Color.hexColor(0x334D5C));
        scene.add(Sphere.newSphere(new Vector3(0.5, 1, 3), 0.5, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));
        scene.add(Sphere.newSphere(new Vector3(1.5, 5, -3), 0.5, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));
        scene.add(Cube.newCube(new Vector3(-5, -5, -2), new Vector3(5, 5, -1), material));

        var loader:OBJLoader = new OBJLoader();
        //loader.parentMaterial = new SpecularMaterial(Color.hexColor(0xEFC94C), 2);
        loader.parentMaterial = new GlossyMaterial(new Color(1,0.2,0), 2, MathUtils.radians(45));
        //loader.parentMaterial = new ClearMaterial(0.5, MathUtils.radians(30));

        var self = this;
        var mesh;
        var cameraSamples:number = 1;
        var hitSamples:number = 1;
        var bounces:number = 3;
        var iterations:number = 1;

        var camera:Camera = Camera.lookAt(new Vector3(1, -0.45, 4), new Vector3(1, -0.6, 0.4), new Vector3(0, 1, 0), 45);

        loader.load("suzanne.obj", function (_mesh) {
            if (!_mesh) {
                console.log("LoadOBJ error:");
            } else {
                console.log("Obj file loaded");
                mesh = _mesh;
                scene.add(mesh);

                self.render(scene, camera, cameraSamples, hitSamples, bounces, iterations);
            }
        });
    }

}
new Suzanne();
