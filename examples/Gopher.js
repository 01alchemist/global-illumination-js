System.register(["../src/engine/math/Color", "../src/engine/scene/materials/LightMaterial", "../src/engine/math/Vector3", "../src/engine/scene/shapes/Sphere", "../src/engine/scene/materials/SpecularMaterial", "../src/engine/scene/Camera", "../src/engine/renderer/Renderer", "../src/engine/scene/shapes/Cube", "../src/engine/scene/materials/Attenuation", "../src/engine/data/OBJLoader", "./CanvasDisplay", "../src/engine/scene/materials/GlossyMaterial", "../src/engine/utils/MathUtils", "../src/engine/scene/SharedScene", "../src/engine/scene/materials/TransparentMaterial"], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Color_1, LightMaterial_1, Vector3_1, Sphere_1, SpecularMaterial_1, Camera_1, Renderer_1, Cube_1, Attenuation_1, OBJLoader_1, CanvasDisplay_1, GlossyMaterial_1, MathUtils_1, SharedScene_1, TransparentMaterial_1;
    var Gopher;
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
            },
            function (GlossyMaterial_1_1) {
                GlossyMaterial_1 = GlossyMaterial_1_1;
            },
            function (MathUtils_1_1) {
                MathUtils_1 = MathUtils_1_1;
            },
            function (SharedScene_1_1) {
                SharedScene_1 = SharedScene_1_1;
            },
            function (TransparentMaterial_1_1) {
                TransparentMaterial_1 = TransparentMaterial_1_1;
            }],
        execute: function() {
            Gopher = (function (_super) {
                __extends(Gopher, _super);
                function Gopher() {
                    _super.call(this);
                    this.paused = false;
                }
                Gopher.prototype.onInit = function () {
                    var scene = new SharedScene_1.SharedScene();
                    var glass = new GlossyMaterial_1.GlossyMaterial(new Color_1.Color(1, 0, 0), 1.5, MathUtils_1.MathUtils.radians(0));
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(-0.5, 1, 0), 0.5, glass));
                    var wall = new SpecularMaterial_1.SpecularMaterial(Color_1.Color.hexColor(0xFCFAE1), 2);
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(4, 7, 3), 2, new LightMaterial_1.LightMaterial(new Color_1.Color(1, 1, 1), 1, Attenuation_1.NoAttenuation)));
                    scene.add(Cube_1.Cube.newCube(new Vector3_1.Vector3(-30, -1, -30), new Vector3_1.Vector3(-8, 10, 30), wall));
                    scene.add(Cube_1.Cube.newCube(new Vector3_1.Vector3(-30, -1, -30), new Vector3_1.Vector3(30, 0.376662, 30), wall));
                    var loader = new OBJLoader_1.OBJLoader();
                    loader.parentMaterial = new TransparentMaterial_1.TransparentMaterial(Color_1.Color.hexColor(0xFFFFFF), 1.31, MathUtils_1.MathUtils.radians(60), 0);
                    var self = this;
                    var mesh;
                    this.renderer = new Renderer_1.Renderer();
                    this.i_width = 2560 / 2;
                    this.i_height = 1440 / 2;
                    var cameraSamples = 4;
                    var hitSamples = 16;
                    var bounces = 8;
                    var camera = Camera_1.Camera.lookAt(new Vector3_1.Vector3(8, 3, 0.5), new Vector3_1.Vector3(-1, 2.5, 0.5), new Vector3_1.Vector3(0, 1, 0), 45);
                    loader.load("gopher.obj", function (_mesh) {
                        if (!_mesh) {
                            console.log("LoadOBJ error:");
                        }
                        else {
                            console.log("Obj file loaded");
                            mesh = _mesh;
                            scene.add(mesh);
                            self.pixels = self.renderer.initParallelRender(scene, camera, self.i_width, self.i_height, cameraSamples, hitSamples, bounces);
                            self.drawPixels(self.pixels, { x: 0, y: 0, width: self.i_width, height: self.i_height });
                            requestAnimationFrame(self.render.bind(self));
                        }
                    });
                };
                Gopher.prototype.render = function () {
                    if (!this.paused) {
                        this.renderer.iterateParallel();
                        this.updatePixels(this.pixels, this.renderer.iterations);
                        requestAnimationFrame(this.render.bind(this));
                    }
                };
                return Gopher;
            })(CanvasDisplay_1.CanvasDisplay);
            exports_1("Gopher", Gopher);
            new Gopher();
        }
    }
});
//# sourceMappingURL=Gopher.js.map