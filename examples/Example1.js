System.register(["../src/engine/math/Color", "../src/engine/scene/materials/LightMaterial", "../src/engine/math/Vector3", "../src/engine/scene/shapes/Sphere", "../src/engine/scene/materials/SpecularMaterial", "../src/engine/scene/Camera", "../src/engine/renderer/Renderer", "../src/engine/scene/shapes/Cube", "./CanvasDisplay", "../src/engine/scene/materials/DiffuseMaterial", "../src/engine/scene/materials/Attenuation", "../src/engine/scene/SharedScene", "../src/engine/scene/materials/ClearMaterial", "../src/engine/utils/MathUtils", "../src/engine/scene/materials/GlossyMaterial"], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Color_1, LightMaterial_1, Vector3_1, Sphere_1, SpecularMaterial_1, Camera_1, Renderer_1, Cube_1, CanvasDisplay_1, DiffuseMaterial_1, Attenuation_1, SharedScene_1, ClearMaterial_1, MathUtils_1, GlossyMaterial_1;
    var Example1;
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
            function (CanvasDisplay_1_1) {
                CanvasDisplay_1 = CanvasDisplay_1_1;
            },
            function (DiffuseMaterial_1_1) {
                DiffuseMaterial_1 = DiffuseMaterial_1_1;
            },
            function (Attenuation_1_1) {
                Attenuation_1 = Attenuation_1_1;
            },
            function (SharedScene_1_1) {
                SharedScene_1 = SharedScene_1_1;
            },
            function (ClearMaterial_1_1) {
                ClearMaterial_1 = ClearMaterial_1_1;
            },
            function (MathUtils_1_1) {
                MathUtils_1 = MathUtils_1_1;
            },
            function (GlossyMaterial_1_1) {
                GlossyMaterial_1 = GlossyMaterial_1_1;
            }],
        execute: function() {
            Example1 = (function (_super) {
                __extends(Example1, _super);
                function Example1() {
                    _super.call(this);
                    this.paused = false;
                    console.info("Example1");
                }
                Example1.prototype.onInit = function () {
                    console.info("onInit");
                    var scene = new SharedScene_1.SharedScene();
                    var glass = new ClearMaterial_1.ClearMaterial(1.05, MathUtils_1.MathUtils.radians(1));
                    glass.transparent = true;
                    var red = new GlossyMaterial_1.GlossyMaterial(new Color_1.Color(1, 0, 0), 1.5, MathUtils_1.MathUtils.radians(0));
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(-3, 0.5, 1), 0.5, red));
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(1.5, 1, 0), 1, new SpecularMaterial_1.SpecularMaterial(Color_1.Color.hexColor(0x334D5C), 2)));
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(-1, 1, 2), 1, new SpecularMaterial_1.SpecularMaterial(Color_1.Color.hexColor(0xEFC94C), 2)));
                    scene.add(Cube_1.Cube.newCube(new Vector3_1.Vector3(-100, -1, -100), new Vector3_1.Vector3(100, 0, 100), new DiffuseMaterial_1.DiffuseMaterial(new Color_1.Color(1, 1, 1))));
                    scene.add(Sphere_1.Sphere.newSphere(new Vector3_1.Vector3(-1, 4, -1), 0.5, new LightMaterial_1.LightMaterial(new Color_1.Color(1, 1, 1), 3, new Attenuation_1.LinearAttenuation(1))));
                    var camera = Camera_1.Camera.lookAt(new Vector3_1.Vector3(0, 2, -5), new Vector3_1.Vector3(0, 0, 3), new Vector3_1.Vector3(0, 1, 0), 45);
                    this.renderer = new Renderer_1.Renderer();
                    this.i_width = 2560 / 2;
                    this.i_height = 1440 / 2;
                    var cameraSamples = 4;
                    var hitSamples = 16;
                    var bounces = 5;
                    this.pixels = this.renderer.initParallelRender(scene, camera, this.i_width, this.i_height, cameraSamples, hitSamples, bounces);
                    this.drawPixels(this.pixels, { x: 0, y: 0, width: this.i_width, height: this.i_height });
                    requestAnimationFrame(this.render.bind(this));
                };
                Example1.prototype.render = function () {
                    if (!this.paused) {
                        this.renderer.iterateParallel();
                        this.updatePixels(this.pixels, this.renderer.iterations);
                        requestAnimationFrame(this.render.bind(this));
                    }
                };
                return Example1;
            })(CanvasDisplay_1.CanvasDisplay);
            exports_1("Example1", Example1);
            new Example1();
        }
    }
});
//# sourceMappingURL=Example1.js.map