/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class GlobalIlluminatiionAPI{

public static VERSION: String = "0.07.2";

public static DEFAULT_OPTIONS: String = "::options";

private scene: Scene;

private bucketRenderer: BucketRenderer;

private progressiveRenderer: ProgressiveRenderer;

private includeSearchPath: SearchPath;

private textureSearchPath: SearchPath;

private parameterList: ParameterList;

private renderObjects: RenderObjectMap;

private currentFrame: number;

public static runSystemCheck() {
    let RECOMMENDED_MAX_SIZE: number = 800;
    let maxMb: number = (Runtime.getRuntime().maxMemory() / 1048576);
    if ((maxMb < RECOMMENDED_MAX_SIZE)) {
        UI.printError(Module.API, "JVM available memory is below %d MB (found %d MB only).
        Please make sure you launched the program with the -Xmx command line options.", RECOMMENDED_MAX_SIZE, maxMb);
    }

    let compiler: String = System.getProperty("java.vm.name");
    if (((compiler == null)
        || !(compiler.contains("HotSpot") && compiler.contains("Server")))) {
        UI.printError(Module.API, "You do not appear to be running Sun's server JVM
        Performance may suffer");
    }

    UI.printDetailed(Module.API, "Java environment settings:");
    UI.printDetailed(Module.API, "  * Max memory available : %d MB", maxMb);
    UI.printDetailed(Module.API, "  * Virtual machine name : %s", (compiler == null));
    // TODO: Warning!!!, inline IF is not supported ?
    UI.printDetailed(Module.API, "  * Operating system     : %s", System.getProperty("os.name"));
    UI.printDetailed(Module.API, "  * CPU architecture     : %s", System.getProperty("os.arch"));
}

public constructor () {
    this.reset();
}

public reset() {
    this.scene = new Scene();
    this.bucketRenderer = new BucketRenderer();
    this.progressiveRenderer = new ProgressiveRenderer();
    this.includeSearchPath = new SearchPath("include");
    this.textureSearchPath = new SearchPath("texture");
    this.parameterList = new ParameterList();
    this.renderObjects = new RenderObjectMap();
    this.currentFrame = 1;
}

public getUniqueName(prefix: String): String {
    //  generate a unique name based on the given prefix
    let counter: number = 1;
    let name: String;
    for (
        ; this.renderObjects.has(name);
    ) {
        name = String.format("%s_%d", prefix, counter);
        counter++;
    }

    return name;
}

public parameter(name: String, value: String) {
    this.parameterList.addString(name, value);
}

public parameter(name: String, value: boolean) {
    this.parameterList.addBoolean(name, value);
}

public parameter(name: String, value: number) {
    this.parameterList.addInteger(name, value);
}

public parameter(name: String, value: number) {
    this.parameterList.addFloat(name, value);
}

public parameter(name: String, value: Color) {
    this.parameterList.addColor(name, value);
}

public parameter(name: String, value: Point3) {
    this.parameterList.addPoints(name, InterpolationType.NONE, [
        value.x,
        value.y,
        value.z]);
}

public parameter(name: String, value: Vector3) {
    this.parameterList.addVectors(name, InterpolationType.NONE, [
        value.x,
        value.y,
        value.z]);
}

public parameter(name: String, value: Matrix4) {
    this.parameterList.addMatrices(name, InterpolationType.NONE, value.asRowMajor());
}

public parameter(name: String, value: number[]) {
    this.parameterList.addIntegerArray(name, value);
}

public parameter(name: String, value: String[]) {
    this.parameterList.addStringArray(name, value);
}

public parameter(name: String, type: String, interpolation: String, data: number[]) {
    let interp: InterpolationType;
    try {
        interp = InterpolationType.valueOf(interpolation.toUpperCase());
    }
    catch (e /*:IllegalArgumentException*/) {
        UI.printError(Module.API, "Unknown interpolation type: %s -- ignoring parameter \""%s\"""", interpolation, name)", return);
    }

    if (type.equals("float")) {
        this.parameterList.addFloats(name, interp, data);
    }
    else if (type.equals("point")) {
        this.parameterList.addPoints(name, interp, data);
    }
    else if (type.equals("vector")) {
        this.parameterList.addVectors(name, interp, data);
    }
    else if (type.equals("texcoord")) {
        this.parameterList.addTexCoords(name, interp, data);
    }
    else if (type.equals("matrix")) {
        this.parameterList.addMatrices(name, interp, data);
    }
    else {
        UI.printError(Module.API, "Unknown parameter type: %s -- ignoring parameter \""%s\"""", type, name)");
    }

}

public remove(name: String) {
    this.renderObjects.remove(name);
}

public update(name: String): boolean {
    let success: boolean = this.renderObjects.update(name, this.parameterList, this);
    this.parameterList.clear(success);
    return success;
}

public addIncludeSearchPath(path: String) {
    this.includeSearchPath.addSearchPath(path);
}

public addTextureSearchPath(path: String) {
    this.textureSearchPath.addSearchPath(path);
}

public resolveTextureFilename(filename: String): String {
    return this.textureSearchPath.resolvePath(filename);
}

public resolveIncludeFilename(filename: String): String {
    return this.includeSearchPath.resolvePath(filename);
}

public shader(name: String, shader: Shader) {
    if ((shader != null)) {
        //  we are declaring a shader for the first time
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare shader \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.renderObjects.put(name, shader);
    }

    //  update existing shader (only if it is valid)
    if ((this.lookupShader(name) != null)) {
        this.update(name);
    }
    else {
        UI.printError(Module.API, "Unable to update shader \""%s\"" - shader object was not found", name);
        this.parameterList.clear(true);
    }

}

public modifier(name: String, modifier: Modifier) {
    if ((modifier != null)) {
        //  we are declaring a shader for the first time
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare modifier \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.renderObjects.put(name, modifier);
    }

    //  update existing shader (only if it is valid)
    if ((this.lookupModifier(name) != null)) {
        this.update(name);
    }
    else {
        UI.printError(Module.API, "Unable to update modifier \""%s\"" - modifier object was not found", name);
        this.parameterList.clear(true);
    }

}

public geometry(name: String, primitives: PrimitiveList) {
    if ((primitives != null)) {
        //  we are declaring a geometry for the first time
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare geometry \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.renderObjects.put(name, primitives);
    }

    if ((this.lookupGeometry(name) != null)) {
        this.update(name);
    }
    else {
        UI.printError(Module.API, "Unable to update geometry \""%s\"" - geometry object was not found", name);
        this.parameterList.clear(true);
    }

}

public geometry(name: String, tesselatable: Tesselatable) {
    if ((tesselatable != null)) {
        //  we are declaring a geometry for the first time
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare geometry \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.renderObjects.put(name, tesselatable);
    }

    if ((this.lookupGeometry(name) != null)) {
        this.update(name);
    }
    else {
        UI.printError(Module.API, "Unable to update geometry \""%s\"" - geometry object was not found", name);
        this.parameterList.clear(true);
    }

}

public instance(name: String, geoname: String) {
    if ((geoname != null)) {
        //  we are declaring this instance for the first time
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare instance \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.parameter("geometry", geoname);
        this.renderObjects.put(name, new Instance());
    }

    if ((this.lookupInstance(name) != null)) {
        this.update(name);
    }
    else {
        UI.printError(Module.API, "Unable to update instance \""%s\"" - instance object was not found", name);
        this.parameterList.clear(true);
    }

}

public light(name: String, light: LightSource) {
    if ((light != null)) {
        //  we are declaring this light for the first time
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare light \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.renderObjects.put(name, light);
    }

    if ((this.lookupLight(name) != null)) {
        this.update(name);
    }
    else {
        UI.printError(Module.API, "Unable to update instance \""%s\"" - instance object was not found", name);
        this.parameterList.clear(true);
    }

}

public camera(name: String, lens: CameraLens) {
    if ((lens != null)) {
        //  we are declaring this camera for the first time
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare camera \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.renderObjects.put(name, new Camera(lens));
    }

    //  update existing shader (only if it is valid)
    if ((this.lookupCamera(name) != null)) {
        this.update(name);
    }
    else {
        UI.printError(Module.API, "Unable to update camera \""%s\"" - camera object was not found", name);
        this.parameterList.clear(true);
    }

}

public options(name: String) {
    if ((this.lookupOptions(name) == null)) {
        if (this.renderObjects.has(name)) {
            UI.printError(Module.API, "Unable to declare options \""%s\"", name is already in use", name);
            this.parameterList.clear(true);
            return;
        }

        this.renderObjects.put(name, new Options());
    }

    let lookupOptions: assert;
    (name != null);
    this.update(name);
}

public lookupGeometry(name: String): Geometry {
    return this.renderObjects.lookupGeometry(name);
}

private lookupInstance(name: String): Instance {
    return this.renderObjects.lookupInstance(name);
}

private lookupCamera(name: String): Camera {
    return this.renderObjects.lookupCamera(name);
}

private lookupOptions(name: String): Options {
    return this.renderObjects.lookupOptions(name);
}

public lookupShader(name: String): Shader {
    return this.renderObjects.lookupShader(name);
}

public lookupModifier(name: String): Modifier {
    return this.renderObjects.lookupModifier(name);
}

private lookupLight(name: String): LightSource {
    return this.renderObjects.lookupLight(name);
}

public shaderOverride(name: String, photonOverride: boolean) {
    this.scene.setShaderOverride(this.lookupShader(name), photonOverride);
}

public render(optionsName: String, display: Display) {
    this.renderObjects.updateScene(this.scene);
    let opt: Options = this.lookupOptions(optionsName);
    if ((opt == null)) {
        opt = new Options();
    }

    this.scene.setCamera(this.lookupCamera(opt.getString("camera", null)));
    //  baking
    let bakingInstanceName: String = opt.getString("baking.instance", null);
    if ((bakingInstanceName != null)) {
        let bakingInstance: Instance = this.lookupInstance(bakingInstanceName);
        if ((bakingInstance == null)) {
            UI.printError(Module.API, "Unable to bake instance \""%s\"" - not found", bakingInstanceName);
            return;
        }

        this.scene.setBakingInstance(bakingInstance);
    }
    else {
        this.scene.setBakingInstance(null);
    }

    let samplerName: String = opt.getString("sampler", "bucket");
    let sampler: ImageSampler = null;
    if ((samplerName.equals("none") || samplerName.equals("null"))) {
        sampler = null;
    }
    else if (samplerName.equals("bucket")) {
        sampler = this.bucketRenderer;
    }
    else if (samplerName.equals("ipr")) {
        sampler = this.progressiveRenderer;
    }
    else if (samplerName.equals("fast")) {
        sampler = new SimpleRenderer();
    }
    else {
        UI.printError(Module.API, "Unknown sampler type: %s - aborting", samplerName);
        return;
    }

    this.scene.render(opt, sampler, display);
}

public parse(filename: String): boolean {
    if ((filename == null)) {
        return false;
    }

    filename = this.includeSearchPath.resolvePath(filename);
    let parser: SceneParser = null;
    if (filename.endsWith(".sc")) {
        parser = new SCParser();
    }
    else if (filename.endsWith(".ra2")) {
        parser = new RA2Parser();
    }
    else if (filename.endsWith(".ra3")) {
        parser = new RA3Parser();
    }
    else if (filename.endsWith(".tri")) {
        parser = new TriParser();
    }
    else if (filename.endsWith(".rib")) {
        parser = new ShaveRibParser();
    }
    else {
        UI.printError(Module.API, "Unable to find a suitable parser for: \""%s\"""", filename)", false);
    }

    let currentFolder: String = (new File(filename) + getAbsoluteFile().getParentFile().getAbsolutePath());
    this.includeSearchPath.addSearchPath(currentFolder);
    this.textureSearchPath.addSearchPath(currentFolder);
    return parser.parse(filename, this);
}

public getBounds(): BoundingBox {
    return this.scene.getBounds();
}

public build() {

}

public static create(filename: String, frameNumber: number): GlobalIlluminatiionAPI {
    if ((filename == null)) {
        return new GlobalIlluminatiionAPI();
    }

    let api: GlobalIlluminatiionAPI = null;
    if (filename.endsWith(".java")) {
        let t: Timer = new Timer();
        UI.printInfo(Module.API, "Compiling \"""" + filename + ", " ...");
        t.start();
        try {
            let stream: FileInputStream = new FileInputStream(filename);
            api = (<GlobalIlluminatiionAPI>(ClassBodyEvaluator.createFastClassBodyEvaluator(new Scanner(filename, stream), GlobalIlluminatiionAPI.class, ClassLoader.getSystemClassLoader())));
            stream.close();
        }
        catch (e /*:CompileException*/) {
            UI.printError(Module.API, "Could not compile: \""%s\"""", filename)", UI.printError(Module.API, "%s", e.getMessage()));
            return null;
        }
        catch (e /*:ParseException*/) {
            UI.printError(Module.API, "Could not compile: \""%s\"""", filename)", UI.printError(Module.API, "%s", e.getMessage()));
            return null;
        }
        catch (e /*:ScanException*/) {
            UI.printError(Module.API, "Could not compile: \""%s\"""", filename)", UI.printError(Module.API, "%s", e.getMessage()));
            return null;
        }
        catch (e /*:IOException*/) {
            UI.printError(Module.API, "Could not compile: \""%s\"""", filename)", UI.printError(Module.API, "%s", e.getMessage()));
            return null;
        }

        t.end();
        UI.printInfo(Module.API, ("Compile time: " + t.toString()));
        if ((api != null)) {
            let currentFolder: String = (new File(filename) + getAbsoluteFile().getParentFile().getAbsolutePath());
            api.includeSearchPath.addSearchPath(currentFolder);
            api.textureSearchPath.addSearchPath(currentFolder);
        }

        UI.printInfo(Module.API, "Build script running ...");
        t.start();
        api.setCurrentFrame(frameNumber);
        api.build();
        t.end();
        UI.printInfo(Module.API, "Build script time: %s", t.toString());
    }
    else {
        api = new GlobalIlluminatiionAPI();
        api = api.parse(filename);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    return api;
}

public static compile(code: String): GlobalIlluminatiionAPI {
    try {
        let t: Timer = new Timer();
        t.start();
        let api: GlobalIlluminatiionAPI = (<GlobalIlluminatiionAPI>(ClassBodyEvaluator.createFastClassBodyEvaluator(new Scanner(null, new StringReader(code)), GlobalIlluminatiionAPI.class, (<ClassLoader>(null)))));
        t.end();
        UI.printInfo(Module.API, "Compile time: %s", t.toString());
        return api;
    }
    catch (e /*:CompileException*/) {
        UI.printError(Module.API, "%s", e.getMessage());
        return null;
    }
    catch (e /*:ParseException*/) {
        UI.printError(Module.API, "%s", e.getMessage());
        return null;
    }
    catch (e /*:ScanException*/) {
        UI.printError(Module.API, "%s", e.getMessage());
        return null;
    }
    catch (e /*:IOException*/) {
        UI.printError(Module.API, "%s", e.getMessage());
        return null;
    }

}

public getCurrentFrame(): number {
    return this.currentFrame;
}

public setCurrentFrame(currentFrame: number) {
    this.currentFrame = this.currentFrame;
}
}