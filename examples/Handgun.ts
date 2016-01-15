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
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Handgun extends CanvasDisplay {

    private renderer:Renderer;
    private pixels:Uint8ClampedArray;
    public paused:boolean = false;

    constructor() {
        super();
    }

    onInit() {

        var scene:SharedScene = new SharedScene();

        var wall = new SpecularMaterial(Color.hexColor(0xFCFAE1), 2);
        scene.add(Sphere.newSphere(new Vector3(4, 7, 3), 2, new LightMaterial(new Color(1, 1, 1), 1, NoAttenuation)));
        scene.add(Cube.newCube(new Vector3(-5, -5, -2), new Vector3(5, 1, -1), wall));
        scene.add(Sphere.newSphere(new Vector3(0.1, 0.1, 0.5), 0.1, new LightMaterial(new Color(1, 0, 0), 1, new QuadraticAttenuation(3))));

        var loader:OBJLoader = new OBJLoader();
        loader.parentMaterial = new GlossyMaterial(new Color(),1.5, MathUtils.radians(30));

        var self = this;
        var mesh;
        this.renderer = new Renderer();
        //this.i_width = 2560 / 4;
        //this.i_height = 1440 / 4;
        this.i_width = 1280;
        this.i_height = 720;
        var cameraSamples:number = 1;
        var hitSamples:number = 16;
        var bounces:number = 5;
        var camera:Camera = Camera.lookAt(new Vector3(0, 2, 2), new Vector3(0, 0, 0), new Vector3(0, 1, 0), 45);

        loader.load("Handgun.obj", function (_mesh) {
            if (!_mesh) {
                console.log("LoadOBJ error:");
            } else {
                console.log("Obj file loaded");
                mesh = _mesh;
                scene.add(mesh);

                //console.time("compile");
                //mesh.compile();
                //console.timeEnd("compile");

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
new Handgun();
