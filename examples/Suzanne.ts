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
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Suzanne extends CanvasDisplay {

    private renderer:Renderer;
    private pixels:Uint8ClampedArray;
    public paused:boolean = false;

    constructor() {
        super();
    }

    onInit() {

        var scene:SharedScene = new SharedScene();
        var material = new DiffuseMaterial(Color.hexColor(0x334D5C));
        scene.add(Sphere.newSphere(new Vector3(0.5, 1, 3), 0.5, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));
        scene.add(Sphere.newSphere(new Vector3(1.5, 1, 3), 0.5, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));
        scene.add(Cube.newCube(new Vector3(-5, -5, -2), new Vector3(5, 5, -1), material));

        var loader:OBJLoader = new OBJLoader();
        loader.parentMaterial = new SpecularMaterial(Color.hexColor(0xEFC94C), 2);

        var self = this;
        var mesh;
        this.renderer = new Renderer();
        this.i_width = 2560 / 2;
        this.i_height = 1440 / 2;
        //this.i_width = 1280;
        //this.i_height = 720;
        var cameraSamples:number = 1;
        var hitSamples:number = 1;
        var bounces:number = 3;
        var camera:Camera = Camera.lookAt(new Vector3(1, -0.45, 4), new Vector3(1, -0.6, 0.4), new Vector3(0, 1, 0), 45);

        loader.load("suzanne.obj", function (_mesh) {
            if (!_mesh) {
                console.log("LoadOBJ error:");
            } else {
                console.log("Obj file loaded");
                mesh = _mesh;
                scene.add(mesh);

                self.pixels = self.renderer.initParallelRender(
                    scene, camera, self.i_width, self.i_height, cameraSamples, hitSamples, bounces
                );
                self.drawPixels(self.pixels, {x: 0, y: 0, width: self.i_width, height: self.i_height});

                requestAnimationFrame(self.render.bind(self));
            }
        });
    }

    render() {
        if (!this.paused) {
            this.renderer.iterateParallel();
            this.updatePixels(this.pixels, this.renderer.iterations);
            requestAnimationFrame(this.render.bind(this));
        }
    }

}
new Suzanne();
