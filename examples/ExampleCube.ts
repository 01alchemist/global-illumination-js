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
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class ExampleCube extends CanvasDisplay {

    constructor() {
        super();
    }

    onInit() {
        var scene:Scene = new Scene();
        scene.add(Sphere.newSphere(new Vector3(-2, 5, -3), 0.5, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));
        scene.add(Sphere.newSphere(new Vector3(5, 5, -3), 0.5, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));
        scene.add(Cube.newCube(new Vector3(-30, -1, -30), new Vector3(30, 0, 30), new SpecularMaterial(Color.hexColor(0xFCFAE1), 2)));
        var loader:OBJLoader = new OBJLoader();
        loader.parentMaterial = new SpecularMaterial(Color.hexColor(0xB9121B), 2);
        var self = this;
        var mesh;
        loader.load("teapot.obj", function (_mesh) {
            if (!_mesh) {
                console.log("LoadOBJ error:");
            } else {
                console.log("Obj file loaded");
                mesh = _mesh;
                scene.add(mesh);
                var camera:Camera = Camera.lookAt(new Vector3(2, 5, -6), new Vector3(0.5, 1, 0), new Vector3(0, 1, 0), 45);
                var renderer:Renderer = new Renderer();
                var w = 2560 / 16;
                var h = 1440 / 16;
                var cameraSamples:number = 4;
                var hitSamples:number = 16;
                var bounces:number = 4;
                var pixels:Uint8ClampedArray = renderer.render(
                    scene, camera, w, h, cameraSamples, hitSamples, bounces
                );
                console.log("Render completed:");
                self.drawPixels(pixels, {x: 0, y: 0, width: w, height: h});
            }
        });
    }

}
new ExampleCube();
