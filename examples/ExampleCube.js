System.register(["../src/engine/math/Color", "../src/engine/scene/materials/LightMaterial", "../src/engine/math/Vector3", "../src/engine/scene/shapes/Sphere", "../src/engine/scene/Scene", "../src/engine/scene/materials/SpecularMaterial", "../src/engine/scene/Camera", "../src/engine/renderer/Renderer", "../src/engine/scene/shapes/Cube", "../src/engine/scene/materials/Attenuation", "../src/engine/data/OBJLoader", "./CanvasDisplay"], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Color_1, LightMaterial_1, Vector3_1, Sphere_1, Scene_1, SpecularMaterial_1, Camera_1, Renderer_1, Cube_1, Attenuation_1, OBJLoader_1, CanvasDisplay_1;
    var ExampleCube;
    return {
        setters:[
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (LightMaterial_1_1) {
                LightMaterial_1 = LightMaterial_1_1;
            },
            function (Vector3_1_1) {
                Vector3_1 = Vector3_1_1;
            },
            function (Sphere_1_1) {
                Sphere_1 = Sphere_1_1;
            },
            function (Scene_1_1) {
                Scene_1 = Scene_1_1;
            },
            function (SpecularMaterial_1_1) {
                SpecularMaterial_1 = SpecularMaterial_1_1;
            },
            function (Camera_1_1) {
                Camera_1 = Camera_1_1;
            },
            function (Renderer_1_1) {
                Renderer_1 = Renderer_1_1;
            },
            function (Cube_1_1) {
                Cube_1 = Cube_1_1;
            },
            function (Attenuation_1_1) {
                Attenuation_1 = Attenuation_1_1;
            },
            function (OBJLoader_1_1) {
                OBJLoader_1 = OBJLoader_1_1;
            },
            function (CanvasDisplay_1_1) {
                CanvasDisplay_1 = CanvasDisplay_1_1;
            }],
        execute: function() {
            ExampleCube = (function (_super) {
                __extends(ExampleCube, _super);
                function ExampleCube() {
                    _super.call(this);
                }
                ExampleCube.prototype.onInit = function () {
                    var scene = new Scene_1.Scene();
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(-2, 5, -3), 0.5, new LightMaterial_1.LightMaterial(new Color_1.Color(1, 1, 1), 1, Attenuation_1.NoAttenuation)));
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(5, 5, -3), 0.5, new LightMaterial_1.LightMaterial(new Color_1.Color(1, 1, 1), 1, Attenuation_1.NoAttenuation)));
                    scene.add(Cube_1.Cube.newCube(new Vector3_1.Vector3(-30, -1, -30), new Vector3_1.Vector3(30, 0, 30), new SpecularMaterial_1.SpecularMaterial(Color_1.Color.hexColor(0xFCFAE1), 2)));
                    var loader = new OBJLoader_1.OBJLoader();
                    loader.parentMaterial = new SpecularMaterial_1.SpecularMaterial(Color_1.Color.hexColor(0xB9121B), 2);
                    var self = this;
                    var mesh;
                    loader.load("teapot.obj", function (_mesh) {
                        if (!_mesh) {
                            console.log("LoadOBJ error:");
                        }
                        else {
                            console.log("Obj file loaded");
                            mesh = _mesh;
                            scene.add(mesh);
                            var camera = Camera_1.Camera.lookAt(new Vector3_1.Vector3(2, 5, -6), new Vector3_1.Vector3(0.5, 1, 0), new Vector3_1.Vector3(0, 1, 0), 45);
                            var renderer = new Renderer_1.Renderer();
                            var w = 2560 / 16;
                            var h = 1440 / 16;
                            var cameraSamples = 4;
                            var hitSamples = 16;
                            var bounces = 4;
                            var pixels = renderer.render(scene, camera, w, h, cameraSamples, hitSamples, bounces);
                            console.log("Render completed:");
                            self.drawPixels(pixels, { x: 0, y: 0, width: w, height: h });
                        }
                    });
                };
                return ExampleCube;
            })(CanvasDisplay_1.CanvasDisplay);
            exports_1("ExampleCube", ExampleCube);
            new ExampleCube();
        }
    }
});
//# sourceMappingURL=ExampleCube.js.map