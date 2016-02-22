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
import {RenderBase} from "./RenderBase";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Dragon extends RenderBase {

    public paused:boolean = false;

    constructor() {
        super(2560 / 2, 1440 / 2);
    }

    onInit() {

        var scene:SharedScene = new SharedScene(Color.hexColor(0xFEE7E0));

        var floor = new GlossyMaterial(Color.hexColor(0xD8CAA8), 1.2, MathUtils.radians(20));
        scene.add(Cube.newCube(new Vector3(-1000, -1000, -1000), new Vector3(1000, 0, 1000), floor));
        scene.add(Sphere.newSphere(new Vector3(0, 10, 0), 1, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));

        var loader:OBJLoader = new OBJLoader();
        loader.parentMaterial = new TransparentMaterial(Color.hexColor(0xFFFFFF), 2, MathUtils.radians(20), 0);

        var self = this;
        var mesh;

        var cameraSamples:number = -1;
        var hitSamples:number = 4;
        var bounces:number = 4;
        var iterations:number = 100;
        var blockIterations:number = 1;

        var camera:Camera = Camera.lookAt(new Vector3(-3, 2, -5), new Vector3(0, 0.5, 0), new Vector3(0, 1, 0), 35);

        loader.load("models/stanford-dragon.obj", function (_mesh) {
            if (!_mesh) {
                console.log("LoadOBJ error:");
            } else {
                console.log("Obj file loaded");
                mesh = _mesh;
                mesh.fitInside(new Box(new Vector3(-1, 0, -1), new Vector3(1, 2, 1)), new Vector3(0.5, 0, 0.5));
                scene.add(mesh);

                self.render(scene, camera, cameraSamples, hitSamples, bounces, iterations, blockIterations);
            }
        });
    }

    onSceneChange(newValue){
        console.log(newValue);
    }

}
new Dragon();
