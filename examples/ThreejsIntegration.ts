import {RenderBase} from "./RenderBase";
import {SharedScene} from "../src/engine/scene/SharedScene";
import {Vector3} from "../src/engine/math/Vector3";
import {ClearMaterial} from "../src/engine/scene/materials/ClearMaterial";
import {SpecularMaterial} from "../src/engine/scene/materials/SpecularMaterial";
import {TransparentMaterial} from "../src/engine/scene/materials/TransparentMaterial";
import {GlossyMaterial} from "../src/engine/scene/materials/GlossyMaterial";
import {Color} from "../src/engine/math/Color";
import {Sphere} from "../src/engine/scene/shapes/Sphere";
import {MathUtils} from "../src/engine/utils/MathUtils";
import {Camera} from "../src/engine/scene/Camera";
import {LinearAttenuation} from "../src/engine/scene/materials/Attenuation";
import {LightMaterial} from "../src/engine/scene/materials/LightMaterial";
import {DiffuseMaterial} from "../src/engine/scene/materials/DiffuseMaterial";
import {Cube} from "../src/engine/scene/shapes/Cube";
import {NetworkUtils} from "../src/utils/NetworkUtils";
import {ThreeJSView} from "./ThreeJSView";
import {OBJLoader} from "../src/engine/data/OBJLoader";

/*DS dependencies*/

/**
 * Created by Nidin Vinayakan on 25/2/2016.
 */
export class ThreejsIntegration extends RenderBase {

    public paused:boolean = false;
    public threejsView:ThreeJSView;

    constructor(base = "../src/") {
        NetworkUtils.baseUrl = base + "GIJSDemo/";
        super(2560 / 2, 1440 / 2);
        //super(window.innerWidth, window.innerHeight);
        this.sceneList.push("Materials");
    }

    onInit() {

        console.info("onInit");
        var scene:SharedScene = new SharedScene();

        //default ground
        scene.add(Cube.newCube(new Vector3(-100, -1, -100), new Vector3(100, 0, 100), new DiffuseMaterial(new Color(1, 1, 1))));
        //lights
        scene.add(Sphere.newSphere(new Vector3(0, 5, 0), 1, new LightMaterial(new Color(1, 1, 1), 1, new LinearAttenuation(0.84))));
        //scene.add(Sphere.newSphere(new Vector3(-1, 0.15, -1), 0.15, new LightMaterial(Color.hexColor(0xFFC0CB), 10, new LinearAttenuation(1))));

        //var camera:Camera = Camera.lookAt(new Vector3(-3, 2, -7), new Vector3(0, 0, 3), new Vector3(0, 1, 0), 45);
        var camera:Camera = Camera.lookAt(new Vector3(0, 10, 10), new Vector3(0, 0, 0), new Vector3(0, 1, 0), 45);
        //camera.setFocus(new Vector3(-1, 1, 2), 0.05);
        //camera.focalDistance = -2;
        //camera.apertureRadius = 0.05;

        /*var glass = new ClearMaterial(1.3, MathUtils.radians(0));
        var roughGlass = new ClearMaterial(1.3, MathUtils.radians(4));
        var mirror = new SpecularMaterial(Color.hexColor(0xFFFFFF), 1000);
        var tintedGlass = new TransparentMaterial(Color.hexColor(0x00ff00), 1.3, MathUtils.radians(0), 0.5);
        var red = new GlossyMaterial(new Color(1, 0, 0), 1.5, MathUtils.radians(0));
        glass.transparent = true;
        scene.add(Sphere.newSphere(new Vector3(-3, 0.5, 1), 0.5, red));
        scene.add(Sphere.newSphere(new Vector3(-2, 0.5, -1), 0.5, glass));
        scene.add(Sphere.newSphere(new Vector3(-3.5, 0.5, -1), 0.5, roughGlass));
        scene.add(Sphere.newSphere(new Vector3(-4, 1, 4), 1, mirror));
        scene.add(Sphere.newSphere(new Vector3(-1, 0.5, -3), 0.5, tintedGlass));
        scene.add(Sphere.newSphere(new Vector3(1.5, 1, 0), 1, new SpecularMaterial(Color.hexColor(0x334D5C), 2)));
        scene.add(Sphere.newSphere(new Vector3(-1, 1, 2), 1, new SpecularMaterial(Color.hexColor(0xEFC94C), 2)));*/

        var cameraSamples:number = -1;
        var hitSamples:number = 4;
        var bounces:number = 4;
        var iterations:number = 1000000;
        var blockIterations:number = 4;
        var self = this;
        var loader:OBJLoader = new OBJLoader();
        loader.parentMaterial = new SpecularMaterial(Color.hexColor(0xB9121B), 2);
        loader.load("teapot.obj", function (_mesh) {
            if (!_mesh) {
                console.log("LoadOBJ error:");
            } else {
                console.log("Obj file loaded");
                _mesh.smoothNormals();
                scene.add(_mesh);
                self.render(scene, camera, cameraSamples, hitSamples, bounces, iterations, blockIterations);
            }
        });
    }

    //configure GUI
    onSceneChange(newValue) {
        console.log(newValue);
    }

    private initThreeJSViewer():void {
        this.threejsView = new ThreeJSView(this.i_width, this.i_height, this.webglOutput)
    }

    toggleWebGL(newValue) {
        if (newValue) {
            this.giOutput.style.display = "none";
            this.webglOutput.style.display = "block";
        } else {
            this.webglOutput.style.display = "none";
            this.giOutput.style.display = "block";
        }
    }
}