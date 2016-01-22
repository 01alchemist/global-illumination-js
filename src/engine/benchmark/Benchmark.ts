/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Benchmark implements BenchmarkTest, UserInterface, Display {

    private resolution: number;

    private showOutput: boolean;

    private showBenchmarkOutput: boolean;

    private saveOutput: boolean;

    private threads: number;

    private referenceImage: number[];

    private validationImage: number[];

    private errorThreshold: number;

    public static main(args: String[]) {
        if ((args.length == 0)) {
            System.out.println("Benchmark options:");
            System.out.println("  -regen                        Regenerate reference images for a variety of sizes");
            System.out.println("  -bench [threads] [resolution] Run a single iteration of the benchmark using the specified thread count and image resolution");
            System.out.println("                                Default: threads=0 (auto-detect cpus), resolution=256");
        }
        else if (args[0].equals("-regen")) {
            let sizes: number[] = [
                32,
                64,
                96,
                128,
                256,
                384,
                512];
            for (let s: number in sizes) {
                //  run a single iteration to generate the reference image
                let b: Benchmark = new Benchmark(s, true, false, true);
                b.kernelMain();
            }

        }
        else if (args[0].equals("-bench")) {
            let resolution: number = 256;
            let threads: number = 0;
            if ((args.length > 1)) {
                this.threads = Integer.parseInt(args[1]);
            }

            if ((args.length > 2)) {
                this.resolution = Integer.parseInt(args[2]);
            }

            let benchmark: Benchmark = new Benchmark(this.resolution, false, true, false, this.threads);
            benchmark.kernelBegin();
            benchmark.kernelMain();
            benchmark.kernelEnd();
        }

    }

    public constructor () :
    this(384, false, true, false) {
    this.(384, false, true, false);
}

public constructor (resolution: number, showOutput: boolean, showBenchmarkOutput: boolean, saveOutput: boolean) :
this(this.resolution, this.showOutput, this.showBenchmarkOutput, this.saveOutput, 0) {
    this.(this.resolution, this.showOutput, this.showBenchmarkOutput, this.saveOutput, 0);
}

public constructor (resolution: number, showOutput: boolean, showBenchmarkOutput: boolean, saveOutput: boolean, threads: number) {
    UI.set(this);
    this.resolution = this.resolution;
    this.showOutput = this.showOutput;
    this.showBenchmarkOutput = this.showBenchmarkOutput;
    this.saveOutput = this.saveOutput;
    this.threads = this.threads;
    this.errorThreshold = 6;
    //  fetch reference image from resources (jar file or classpath)
    if (this.saveOutput) {
        return;
    }

    let imageURL: URL = Benchmark.class.getResource(String.format("/resources/golden_%04X.png", this.resolution));
    if ((imageURL == null)) {
        UI.printError(Module.BENCH, "Unable to find reference frame!");
    }

    UI.printInfo(Module.BENCH, "Loading reference image from: %s", imageURL);
    try {
        let bi: BufferedImage = ImageIO.read(imageURL);
        if (((bi.getWidth() != this.resolution)
            || (bi.getHeight() != this.resolution))) {
            UI.printError(Module.BENCH, "Reference image has invalid resolution! Expected %dx%d found %dx%d", this.resolution, this.resolution, bi.getWidth(), bi.getHeight());
        }

        this.referenceImage = new Array((this.resolution * this.resolution));
        for (let i: number = 0; (y < this.resolution); y++) {
            for (let x: number = 0; (x < this.resolution); x++) {
                this.referenceImage[i] = bi.getRGB(x, (this.resolution - (1 - y)));
            }

        }

        let y: number = 0;
        //  flip
    }
    catch (e /*:IOException*/) {
        UI.printError(Module.BENCH, "Unable to load reference frame!");
    }

}

public execute() {
    //  10 iterations maximum - 10 minute time limit
    let framework: BenchmarkFramework = new BenchmarkFramework(10, 600);
    framework.execute(this);
}

class BenchmarkScene extends SunflowAPI {

    public constructor () {
        this.build();
        render(SunflowAPI.DEFAULT_OPTIONS, saveOutput);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public build() {
        //  settings
        parameter("threads", threads);
        //  spawn regular priority threads
        parameter("threads.lowPriority", false);
        parameter("resolutionX", resolution);
        parameter("resolutionY", resolution);
        parameter("aa.min", -1);
        parameter("aa.max", 1);
        parameter("filter", "triangle");
        parameter("depths.diffuse", 2);
        parameter("depths.reflection", 2);
        parameter("depths.refraction", 2);
        parameter("bucket.order", "hilbert");
        parameter("bucket.size", 32);
        //  gi options
        parameter("gi.engine", "igi");
        parameter("gi.igi.samples", 90);
        parameter("gi.igi.c", 8E-06);
        options(SunflowAPI.DEFAULT_OPTIONS);
        this.buildCornellBox();
    }

    private buildCornellBox() {
        //  camera
        parameter("eye", new Point3(0, 0, -600));
        parameter("target", new Point3(0, 0, 0));
        parameter("up", new Vector3(0, 1, 0));
        parameter("fov", 45);
        camera("main_camera", new PinholeLens());
        parameter("camera", "main_camera");
        options(SunflowAPI.DEFAULT_OPTIONS);
        //  cornell box
        let gray: Color = new Color(0.7, 0.7, 0.7);
        let blue: Color = new Color(0.25, 0.25, 0.8);
        let red: Color = new Color(0.8, 0.25, 0.25);
        let emit: Color = new Color(15, 15, 15);
        let minX: number = -200;
        let maxX: number = 200;
        let minY: number = -160;
        let maxY: number = (minY + 400);
        let minZ: number = -250;
        let maxZ: number = 200;
        let verts: number[] = [
            minX,
            minY,
            minZ,
            maxX,
            minY,
            minZ,
            maxX,
            minY,
            maxZ,
            minX,
            minY,
            maxZ,
            minX,
            maxY,
            minZ,
            maxX,
            maxY,
            minZ,
            maxX,
            maxY,
            maxZ,
            minX,
            maxY,
            maxZ];
        let indices: number[] = [
            0,
            1,
            2,
            2,
            3,
            0,
            4,
            5,
            6,
            6,
            7,
            4,
            1,
            2,
            5,
            5,
            6,
            2,
            2,
            3,
            6,
            6,
            7,
            3,
            0,
            3,
            4,
            4,
            7,
            3];
        parameter("diffuse", gray);
        shader("gray_shader", new DiffuseShader());
        parameter("diffuse", red);
        shader("red_shader", new DiffuseShader());
        parameter("diffuse", blue);
        shader("blue_shader", new DiffuseShader());
        //  build walls
        parameter("triangles", indices);
        parameter("points", "point", "vertex", verts);
        parameter("faceshaders", [
            0,
            0,
            0,
            0,
            1,
            1,
            0,
            0,
            2,
            2]);
        geometry("walls", new TriangleMesh());
        //  instance walls
        parameter("shaders", [
            "gray_shader",
            "red_shader",
            "blue_shader"]);
        instance("walls.instance", "walls");
        //  create mesh light
        parameter("points", "point", "vertex", [
            -50,
            (maxY - 1),
            -50,
            50,
            (maxY - 1),
            -50,
            50,
            (maxY - 1),
            50,
            -50,
            (maxY - 1),
            50]);
        parameter("triangles", [
            0,
            1,
            2,
            2,
            3,
            0]);
        parameter("radiance", emit);
        parameter("samples", 8);
        let light: TriangleMeshLight = new TriangleMeshLight();
        light.init("light", this);
        //  spheres
        parameter("eta", 1.6);
        shader("Glass", new GlassShader());
        this.sphere("glass_sphere", "Glass", -120, (minY + 55), -150, 50);
        parameter("color", new Color(0.7, 0.7, 0.7));
        shader("Mirror", new MirrorShader());
        this.sphere("mirror_sphere", "Mirror", 100, (minY + 60), -50, 50);
        //  scanned model
        geometry("teapot", (<Tesselatable>(new Teapot())));
        parameter("transform", Matrix4.translation(80, -50, 100).multiply(Matrix4.rotateX((float
        - (Math.PI / 6)))).multiply(Matrix4.rotateY(((<number>(Math.PI)) / 4))).multiply(Matrix4.rotateX((float
        - (Math.PI / 2))).multiply(Matrix4.scale(1.2))));
        parameter("shaders", "gray_shader");
        instance("teapot.instance1", "teapot");
        parameter("transform", Matrix4.translation(-80, -160, 50).multiply(Matrix4.rotateY(((<number>(Math.PI)) / 4))).multiply(Matrix4.rotateX((float
        - (Math.PI / 2))).multiply(Matrix4.scale(1.2))));
        parameter("shaders", "gray_shader");
        instance("teapot.instance2", "teapot");
    }

    private sphere(name: String, shaderName: String, x: number, y: number, z: number, radius: number) {
        geometry(name, new Sphere());
        parameter("transform", Matrix4.translation(x, y, z).multiply(Matrix4.scale(radius)));
        parameter("shaders", shaderName);
        instance((name + ".instance"), name);
    }
}

public kernelBegin() {
    //  allocate a fresh validation target
    this.validationImage = new Array((this.resolution * this.resolution));
}

public kernelMain() {
    //  this builds and renders the scene
    new BenchmarkScene();
}

public kernelEnd() {
    //  make sure the rendered image was correct
    let diff: number = 0;
    if (((this.referenceImage != null)
        && (this.validationImage.length == this.referenceImage.length))) {
        for (let i: number = 0; (i < this.validationImage.length); i++) {
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
            UI.printError(Module.BENCH, "Image check failed! - #errors: %d", diff);
        }
        else {
            UI.printInfo(Module.BENCH, "Image check passed!");
        }

    }
    else {
        UI.printError(Module.BENCH, "Image check failed! - reference is not comparable");
    }

}

public print(m: Module, level: PrintLevel, s: String) {
    if ((this.showOutput
        || (this.showBenchmarkOutput
        && (m == Module.BENCH)))) {
        System.out.println(UI.formatOutput(m, level, s));
    }

    if ((level == PrintLevel.ERROR)) {
        throw new RuntimeException(s);
    }

}

public taskStart(s: String, min: number, max: number) {
    //  render progress display not needed
}

public taskStop() {
    //  render progress display not needed
}

public taskUpdate(current: number) {
    //  render progress display not needed
}

public imageBegin(w: number, h: number, bucketSize: number) {
    //  we can assume w == h == resolution
}

public imageEnd() {
    //  nothing needs to be done - image verification is done externally
}

public imageFill(x: number, y: number, w: number, h: number, c: Color) {
    //  this is not used
}

public imagePrepare(x: number, y: number, w: number, h: number, id: number) {
    //  this is not needed
}

public imageUpdate(x: number, y: number, w: number, h: number, data: Color[]) {
    //  copy bucket data to validation image
    for (let index: number = 0; (j < h); j++) {
        for (let offset: number = (x
        + (this.resolution
        * (this.resolution - (1 - y)))); (i < w); i++) {
        }

    }

    let j: number = 0;
    let i: number = 0;
    index++;
    offset++;
    this.validationImage[offset] = data[index].copy().toNonLinear().toRGB();
}
}