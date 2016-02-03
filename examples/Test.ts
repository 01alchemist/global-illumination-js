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
import {MathUtils} from "../src/system/utils/MathUtils";
import {SharedScene} from "../src/engine/scene/SharedScene";
import {QuadraticAttenuation} from "../src/engine/scene/materials/Attenuation";
import {TransparentMaterial} from "../src/engine/scene/materials/TransparentMaterial";
import {Box} from "../src/engine/scene/shapes/Box";
import {DiffuseMaterial} from "../src/engine/scene/materials/DiffuseMaterial";
import {LinearAttenuation} from "../src/engine/scene/materials/Attenuation";
import {ClearMaterial} from "../src/engine/scene/materials/ClearMaterial";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class Test extends CanvasDisplay {

    private renderer:Renderer;
    private pixels:Uint8ClampedArray;
    public paused:boolean = false;

    constructor() {
        super();
    }

    onInit() {

        var scene:SharedScene = new SharedScene();

        var white = new DiffuseMaterial(new Color(0.740, 0.742, 0.734));
        var red = new DiffuseMaterial(new Color(0.366, 0.037, 0.042));
        var green = new DiffuseMaterial(new Color(0.163, 0.409, 0.083));
        var blue = new DiffuseMaterial(new Color(0, 0, 0.783));
        var light = new LightMaterial(new Color(1, 1, 1), 1, new QuadraticAttenuation(0.01));
        var n = 10.0;
        scene.add(Cube.newCube(new Vector3(-n, -11, -n), new Vector3(n, -10, n), white));
        scene.add(Cube.newCube(new Vector3(-n, 10, -n), new Vector3(n, 11, n), white));
        scene.add(Cube.newCube(new Vector3(-n, -n, 10), new Vector3(n, n, 11), blue));
        scene.add(Cube.newCube(new Vector3(-11, -n, -n), new Vector3(-10, n, n), red));
        scene.add(Cube.newCube(new Vector3(10, -n, -n), new Vector3(11, n, n), green));

        scene.add(Sphere.newSphere(new Vector3(-5, 1, -10), 0.1, light));

        var loader:OBJLoader = new OBJLoader();
        //var glass = new ClearMaterial(1.05, MathUtils.radians(1));
        //glass.transparent = true;
        //loader.parentMaterial = glass;
        //loader.parentMaterial = new TransparentMaterial(Color.hexColor(0xFFFFFF), 2, MathUtils.radians(0), 0);
        loader.parentMaterial = new SpecularMaterial(new Color(0,0,0), 2);

        var self = this;
        var mesh;
        this.renderer = new Renderer();
        this.i_width = 2560 / 2;
        this.i_height = 1440 / 2;
        //this.i_width = 1280;
        //this.i_height = 720;
        var cameraSamples:number = 1;
        var hitSamples:number = 1;
        var bounces:number = 1;
        //var camera:Camera = Camera.lookAt(new Vector3(-3, 2, -1), new Vector3(0, 0.5, 0), new Vector3(0, 1, 0), 35);
        //var camera:Camera = Camera.lookAt(new Vector3(0.5, 0.5, 1), new Vector3(0, -10, 0), new Vector3(0, 1, 0), 35);
        var camera = Camera.lookAt(new Vector3(0, -5, -20), new Vector3(0, -7, 0), new Vector3(0, 1, 0), 45); //car
        //var camera = Camera.lookAt(new Vector3(0, -2, -20), new Vector3(0, -5, 0), new Vector3(0, 1, 0), 45);

        loader.load("models/porsche-cayman-vray.obj", function (_mesh) {
            if (!_mesh) {
                console.log("LoadOBJ error:");
            } else {
                console.log("Obj file loaded");
                mesh = _mesh;
                mesh.smoothNormals();

                //mesh.fitInside(new Box(new Vector3(-5, -10, -7), new Vector3(5, 0, 7)), new Vector3(0, 0, 0)); //glass.obj
                mesh.fitInside(new Box(new Vector3(-5, -10, -7), new Vector3(5, 10, 7)), new Vector3(0, 0, 0));
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

        /*self.pixels = self.renderer.initParallelRender(
            scene, camera, self.i_width, self.i_height, cameraSamples, hitSamples, bounces
        );
        self.drawPixels(self.pixels, {x: 0, y: 0, width: self.i_width, height: self.i_height});

        requestAnimationFrame(self.render.bind(self));*/
    }

    render() {
        if (!this.paused && this.renderer.initialized) {
            this.renderer.iterateParallel();
            this.updatePixels(this.pixels, this.renderer.iterations);
        }
        requestAnimationFrame(this.render.bind(this));
    }

}
new Test();
