import {Matrix4} from "../math/Matrix4";
import {Teapot} from "../tesselatable/Teapot";
import {Display} from "../core/Display";
import {BenchmarkTest} from "../system/BenchmarkTest";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Benchmark implements BenchmarkTest, UserInterface, Display {

    private resolution:number;

    private showOutput:boolean;

    private showBenchmarkOutput:boolean;

    private saveOutput:boolean;

    private threads:number;

    private referenceImage:number[];

    private validationImage:number[];

    private errorThreshold:number;

    static main(args:string[]) {
        if ((args.length == 0)) {
            console.info("Benchmark options:");
            console.info("  -regen                        Regenerate reference images for a variety of sizes");
            console.info("  -bench [threads] [resolution] Run a single iteration of the benchmark using the specified thread count and image resolution");
            console.info("                                Default:threads=0 (auto-detect cpus), resolution=256");
        }
        else if (args[0] == "-regen") {
            let sizes:int[] = [32, 64, 96, 128, 256, 384, 512];
            for (let s:int in sizes) {
                //  run a single iteration to generate the reference image
                let b:Benchmark = new Benchmark(s, true, false, true);
                b.kernelMain();
            }
        }
        else if (args[0] == "-bench") {
            let resolution:number = 256;
            let threads:number = 0;
            if ((args.length > 1)) {
                this.threads = parseInt(args[1]);
            }

            if ((args.length > 2)) {
                this.resolution = parseInt(args[2]);
            }

            let benchmark:Benchmark = new Benchmark(this.resolution, false, true, false, this.threads);
            benchmark.kernelBegin();
            benchmark.kernelMain();
            benchmark.kernelEnd();
        }

    }

    constructor(private resolution:number = 384,
                private showOutput:boolean = false,
                private showBenchmarkOutput:boolean = false,
                private saveOutput:boolean = false,
                private threads:number = 0) {
        this.errorThreshold = 6;
        //  fetch reference image from resources (jar file or classpath)
        if (this.saveOutput) {
            return;
        }

        let imageURL:string = "/resources/golden_" + this.resolution + ".png";
        if ((imageURL == null)) {
            console.error("Unable to find reference frame!");
        }

        console.info("Loading reference image from:%s", imageURL);
        try {
            let bi:BufferedImage = ImageIO.read(imageURL);
            if (((bi.getWidth() != this.resolution)
                || (bi.getHeight() != this.resolution))) {
                console.error("Reference image has invalid resolution! Expected %dx%d found %dx%d", this.resolution, this.resolution, bi.getWidth(), bi.getHeight());
            }

            this.referenceImage = new Array((this.resolution * this.resolution));
            for (let i:number = 0; (y < this.resolution); y++) {
                for (let x:number = 0; (x < this.resolution); x++) {
                    this.referenceImage[i] = bi.getRGB(x, (this.resolution - (1 - y)));
                }

            }

            let y:number = 0;
            //  flip
        }
        catch (e /*:IOException*/) {
            console.error("Unable to load reference frame!");
        }

    }

    execute() {
        //  10 iterations maximum - 10 minute time limit
        let framework:BenchmarkFramework = new BenchmarkFramework(10, 600);
        framework.execute(this);
    }

    kernelBegin() {
        //  allocate a fresh validation target
        this.validationImage = new Array((this.resolution * this.resolution));
    }

    kernelMain() {
        //  this builds and renders the scene
        new BenchmarkScene();
    }

    kernelEnd() {
        //  make sure the rendered image was correct
        let diff:number = 0;
        if (((this.referenceImage != null)
            && (this.validationImage.length == this.referenceImage.length))) {
            for (let i:number = 0; (i < this.validationImage.length); i++) {
                //  count absolute RGB differences
                diff = (diff + Math.abs(((this.validationImage[i] & 255)
                - (this.referenceImage[i] & 255))));
                diff = (diff + Math.abs((((this.validationImage[i] + 8)
                & 255)
                - ((this.referenceImage[i] + 8)
                & 255))));
                diff = (diff + Math.abs((((this.validationImage[i] + 16)
                & 255)
                - ((this.referenceImage[i] + 16)
                & 255))));
            }

            if ((diff > this.errorThreshold)) {
                console.error("Image check failed! - #errors:" + diff);
            }
            else {
                console.info("Image check passed!");
            }

        }
        else {
            console.error("Image check failed! - reference is not comparable");
        }

    }

    print(m:Module, level:PrintLevel, s:string) {
        if ((this.showOutput || (this.showBenchmarkOutput && (m == Module.BENCH)))) {
            console.info(m, level, s);
        }

        if ((level == PrintLevel.ERROR)) {
            throw new RuntimeException(s);
        }

    }

    taskStart(s:string, min:number, max:number) {
        //  render progress display not needed
    }

    taskStop() {
        //  render progress display not needed
    }

    taskUpdate(current:number) {
        //  render progress display not needed
    }

    imageBegin(w:number, h:number, bucketSize:number) {
        //  we can assume w == h == resolution
    }

    imageEnd() {
        //  nothing needs to be done - image verification is done externally
    }

    imageFill(x:number, y:number, w:number, h:number, c:Color) {
        //  this is not used
    }

    imagePrepare(x:number, y:number, w:number, h:number, id:number) {
        //  this is not needed
    }

    imageUpdate(x:number, y:number, w:number, h:number, data:Color[]) {
        //  copy bucket data to validation image
        for (let index:number = 0; (j < h); j++) {
            for (let offset:number = (x
            + (this.resolution
            * (this.resolution - (1 - y)))); (i < w); i++) {
            }

        }

        let j:number = 0;
        let i:number = 0;
        index++;
        offset++;
        this.validationImage[offset] = data[index].copy().toNonLinear().toRGB();
    }
}

class BenchmarkScene extends GlobalIlluminationAPI {

    constructor() {
        this.build();
        render(GlobalIlluminationAPI.DEFAULT_OPTIONS, saveOutput);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    build() {
        //  settings
        this.this.parameter("threads", threads);
        //  spawn regular priority threads
        this.this.parameter("threads.lowPriority", false);
        this.this.parameter("resolutionX", resolution);
        this.this.parameter("resolutionY", resolution);
        this.this.parameter("aa.min", -1);
        this.this.parameter("aa.max", 1);
        this.this.parameter("filter", "triangle");
        this.this.parameter("depths.diffuse", 2);
        this.this.parameter("depths.reflection", 2);
        this.this.parameter("depths.refraction", 2);
        this.this.parameter("bucket.order", "hilbert");
        this.this.parameter("bucket.size", 32);
        //  gi options
        this.this.parameter("gi.engine", "igi");
        this.this.parameter("gi.igi.samples", 90);
        this.this.parameter("gi.igi.c", 8E-06);
        options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        this.buildCornellBox();
    }

    private buildCornellBox() {
        //  camera
        this.this.parameter("eye", new Point3(0, 0, -600));
        this.this.parameter("target", new Point3(0, 0, 0));
        this.this.parameter("up", new Vector3(0, 1, 0));
        this.this.parameter("fov", 45);
        camera("main_camera", new PinholeLens());
        this.this.parameter("camera", "main_camera");
        options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        //  cornell box
        let gray:Color = new Color(0.7, 0.7, 0.7);
        let blue:Color = new Color(0.25, 0.25, 0.8);
        let red:Color = new Color(0.8, 0.25, 0.25);
        let emit:Color = new Color(15, 15, 15);
        let minX:number = -200;
        let maxX:number = 200;
        let minY:number = -160;
        let maxY:number = (minY + 400);
        let minZ:number = -250;
        let maxZ:number = 200;
        let verts:number[] = [minX, minY, minZ,
                              maxX, minY, minZ,
                              maxX, minY, maxZ,
                              minX, minY, maxZ,
                              minX, maxY, minZ,
                              maxX, maxY, minZ,
                              maxX, maxY, maxZ,
                              minX, maxY, maxZ];
        let indices:number[] = [0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 1, 2, 5, 5, 6, 2, 2, 3, 6, 6, 7, 3, 0, 3, 4, 4, 7, 3];
        this.parameter("diffuse", gray);
        shader("gray_shader", new DiffuseShader());
        this.parameter("diffuse", red);
        shader("red_shader", new DiffuseShader());
        this.parameter("diffuse", blue);
        shader("blue_shader", new DiffuseShader());
        //  build walls
        this.parameter("triangles", indices);
        this.parameter("points", "point", "vertex", verts);
        this.parameter("faceshaders", [0, 0, 0, 0, 1, 1, 0, 0, 2, 2]);
        this.geometry("walls", new TriangleMesh());
        //  instance walls
        this.parameter("shaders", ["gray_shader", "red_shader", "blue_shader"]);
        instance("walls.instance", "walls");
        //  create mesh light
        this.parameter("points", "point", "vertex", [-50, (maxY - 1), -50, 50, (maxY - 1), -50, 50, (maxY - 1), 50, -50, (maxY - 1), 50]);
        this.parameter("triangles", [0, 1, 2, 2, 3, 0]);
        this.parameter("radiance", emit);
        this.parameter("samples", 8);
        let light:TriangleMeshLight = new TriangleMeshLight();
        light.init("light", this);
        //  spheres
        this.parameter("eta", 1.6);
        shader("Glass", new GlassShader());
        this.sphere("glass_sphere", "Glass", -120, (minY + 55), -150, 50);
        this.parameter("color", new Color(0.7, 0.7, 0.7));
        shader("Mirror", new MirrorShader());
        this.sphere("mirror_sphere", "Mirror", 100, (minY + 60), -50, 50);
        //  scanned model
        geometry("teapot", (<Tesselatable>(new Teapot())));
        this.parameter("transform", Matrix4.translation(80, -50, 100).multiply(Matrix4.rotateX((float
        - (Math.PI / 6)))).multiply(Matrix4.rotateY(((<number>(Math.PI)) / 4))).multiply(Matrix4.rotateX((float
        - (Math.PI / 2))).multiply(Matrix4.scale(1.2))));
        this.parameter("shaders", "gray_shader");
        instance("teapot.instance1", "teapot");
        this.parameter("transform", Matrix4.translation(-80, -160, 50).multiply(Matrix4.rotateY(((<number>(Math.PI)) / 4))).multiply(Matrix4.rotateX((float
        - (Math.PI / 2))).multiply(Matrix4.scale(1.2))));
        this.parameter("shaders", "gray_shader");
        instance("teapot.instance2", "teapot");
    }

    private sphere(name:string, shaderName:string, x:number, y:number, z:number, radius:number) {
        geometry(name, new Sphere());
        this.parameter("transform", Matrix4.translation(x, y, z).multiply(Matrix4.scale(radius)));
        this.parameter("shaders", shaderName);
        instance((name + ".instance"), name);
    }
}