/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class RealtimeBenchmark extends SunflowAPI {

    public constructor (showGUI: boolean, threads: number) {
        let display: Display = showGUI;
        // TODO: Warning!!!, inline IF is not supported ?
        // TODO: Warning!!!, inline IF is not supported ?
        UI.printInfo(Module.BENCH, "Preparing benchmarking scene ...");
        //  settings
        parameter("threads", threads);
        //  spawn regular priority threads
        parameter("threads.lowPriority", false);
        parameter("resolutionX", 512);
        parameter("resolutionY", 512);
        parameter("aa.min", -3);
        parameter("aa.max", 0);
        parameter("depths.diffuse", 1);
        parameter("depths.reflection", 1);
        parameter("depths.refraction", 0);
        parameter("bucket.order", "hilbert");
        parameter("bucket.size", 32);
        options(SunflowAPI.DEFAULT_OPTIONS);
        //  camera
        let eye: Point3 = new Point3(30, 0, 10.967);
        let target: Point3 = new Point3(0, 0, 5.4);
        let up: Vector3 = new Vector3(0, 0, 1);
        parameter("eye", eye);
        parameter("target", target);
        parameter("up", up);
        parameter("fov", 45);
        let name: String = getUniqueName("camera");
        camera(name, new PinholeLens());
        parameter("camera", name);
        options(SunflowAPI.DEFAULT_OPTIONS);
        //  geometry
        this.createGeometry();
        //  this first render is not timed, it caches the acceleration data
        //  structures and tesselations so they won't be
        //  included in the main timing
        UI.printInfo(Module.BENCH, "Rendering warmup frame ...");
        render(SunflowAPI.DEFAULT_OPTIONS, display);
        //  now disable all output - and run the benchmark
        UI.set(null);
        let t: Timer = new Timer();
        t.start();
        let phi: number = 0;
        let frames: number = 0;
        while ((phi < (4 * Math.PI))) {
            eye.x = (30 * (<number>(Math.cos(phi))));
            eye.y = (30 * (<number>(Math.sin(phi))));
            phi = (phi
            + (Math.PI / 30));
            frames++;
            //  update camera
            parameter("eye", eye);
            parameter("target", target);
            parameter("up", up);
            camera(name, null);
            render(SunflowAPI.DEFAULT_OPTIONS, display);
        }

        t.end();
        UI.set(new ConsoleInterface());
        UI.printInfo(Module.BENCH, "Benchmark results:");
        UI.printInfo(Module.BENCH, "  * Average FPS:         %.2f", (frames / t.seconds()));
        UI.printInfo(Module.BENCH, "  * Total time:          %s", t);
    }

    private createGeometry() {
        //  light source
        parameter("source", new Point3(-15.5945, -30.0581, 45.967));
        parameter("dir", new Vector3(15.5945, 30.0581, -45.967));
        parameter("radius", 60);
        parameter("radiance", Color.white().mul(3));
        light("light", new DirectionalSpotlight());
        //  gi-engine
        parameter("gi.engine", "fake");
        parameter("gi.fake.sky", new Color(0.25, 0.25, 0.25));
        parameter("gi.fake.ground", new Color(0.01, 0.01, 0.5));
        parameter("gi.fake.up", new Vector3(0, 0, 1));
        options(DEFAULT_OPTIONS);
        //  shaders
        parameter("diffuse", Color.white().mul(0.5));
        shader("default", new DiffuseShader());
        parameter("diffuse", Color.white().mul(0.5));
        parameter("shiny", 0.2);
        shader("refl", new ShinyDiffuseShader());
        //  objects
        //  teapot
        parameter("subdivs", 10);
        geometry("teapot", (<Tesselatable>(new Teapot())));
        parameter("shaders", "default");
        let m: Matrix4 = Matrix4.IDENTITY;
        m = Matrix4.scale(0.075).multiply(m);
        m = Matrix4.rotateZ((<number>(Math.toRadians(-45)))).multiply(m);
        m = Matrix4.translation(-7, 0, 0).multiply(m);
        parameter("transform", m);
        instance("teapot.instance", "teapot");
        //  gumbo
        parameter("subdivs", 10);
        geometry("gumbo", (<Tesselatable>(new Gumbo())));
        m = Matrix4.IDENTITY;
        m = Matrix4.scale(0.5).multiply(m);
        m = Matrix4.rotateZ((<number>(Math.toRadians(25)))).multiply(m);
        m = Matrix4.translation(3, -7, 0).multiply(m);
        parameter("shaders", "default");
        parameter("transform", m);
        instance("gumbo.instance", "gumbo");
        //  ground plane
        parameter("center", new Point3(0, 0, 0));
        parameter("normal", new Vector3(0, 0, 1));
        geometry("ground", new Plane());
        parameter("shaders", "refl");
        instance("ground.instance", "ground");
    }
}