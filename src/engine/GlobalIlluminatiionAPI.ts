import {SharedScene} from "./scene/SharedScene";
import {BucketRenderer} from "./renderer/BucketRenderer";
import {ProgressiveRenderer} from "./renderer/ProgressiveRenderer";
import {ParameterList} from "./core/ParameterList";
import {RenderObjectMap} from "./renderer/utils/RenderObjectMap";
import {Color} from "./math/Color";
import {Point3} from "./math/Point3";
import {InterpolationType} from "./core/ParameterList";
import {Vector3} from "./math/Vector3";
import {Matrix4} from "./math/Matrix4";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class GlobalIlluminationAPI {

    static VERSION:string = "0.07.2";
    static DEFAULT_OPTIONS:string = "::options";
    private scene:SharedScene;
    private bucketRenderer:BucketRenderer;
    private progressiveRenderer:ProgressiveRenderer;
    private includeSearchPath:SearchPath;
    private textureSearchPath:SearchPath;
    private parameterList:ParameterList;
    private renderObjects:RenderObjectMap;
    private currentFrame:number;

    static runSystemCheck() {
        //Nothing to check for now
    }

    constructor() {
        this.reset();
    }

    reset() {
        this.scene = new SharedScene();
        this.bucketRenderer = new BucketRenderer();
        this.progressiveRenderer = new ProgressiveRenderer();
        this.includeSearchPath = new SearchPath("include");
        this.textureSearchPath = new SearchPath("texture");
        this.parameterList = new ParameterList();
        this.renderObjects = new RenderObjectMap();
        this.currentFrame = 1;
    }

    getUniqueName(prefix:string):string {
        //  generate a unique name based on the given prefix
        let counter:number = 1;
        let name:string;
        do {
            name = prefix + "_" + counter;
            counter++;
        } while (renderObjects.has(name));

        return name;
    }

    stringParameter(name:string, value:string) {
        this.parameterList.addString(name, value);
    }

    booleanParameter(name:string, value:boolean) {
        this.parameterList.addBoolean(name, value);
    }

    intParameter(name:string, value:int) {
        this.parameterList.addInteger(name, value);
    }

    floatParameter(name:string, value:float) {
        this.parameterList.addFloat(name, value);
    }

    colorParameter(name:string, value:Color) {
        this.parameterList.addColor(name, value);
    }

    pointParameter(name:string, value:Point3) {
        this.parameterList.addPoints(name, InterpolationType.NONE, [
            value.x,
            value.y,
            value.z]);
    }

    vectorParameter(name:string, value:Vector3) {
        this.parameterList.addVectors(name, InterpolationType.NONE, [
            value.x,
            value.y,
            value.z]);
    }

    matrixParameter(name:string, value:Matrix4) {
        this.parameterList.addMatrices(name, InterpolationType.NONE, value.asRowMajor());
    }

    integerArrayParameter(name:string, value:Int32Array) {
        this.parameterList.addIntegerArray(name, value);
    }

    stringArrayParameter(name:string, value:string[]) {
        this.parameterList.addStringArray(name, value);
    }

    parameter(name:string, type:string, interpolation:string, data:number[]) {
        let interp:InterpolationType;
        try {
            interp = InterpolationType[interpolation.toUpperCase()];
        }
        catch (e) {
            console.error("Unknown interpolation type:" + interpolation + " -- ignoring parameter " + name);
        }

        switch (type) {
            case "float":
                this.parameterList.addFloats(name, interp, data);
                break;
            case "point":
                this.parameterList.addPoints(name, interp, data);
                break;
            case "vector":
                this.parameterList.addVectors(name, interp, data);
                break;
            case "texcoord":
                this.parameterList.addTexCoords(name, interp, data);
                break;
            case "matrix":
                this.parameterList.addMatrices(name, interp, data);
                break;
            default:
                console.error("Unknown parameter type:" + type + " -- ignoring parameter " + name);
                break;
        }

    }

    remove(name:string) {
        this.renderObjects.remove(name);
    }

    update(name:string):boolean {
        let success:boolean = this.renderObjects.update(name, this.parameterList, this);
        this.parameterList.clear(success);
        return success;
    }

    addIncludeSearchPath(path:string) {
        this.includeSearchPath.addSearchPath(path);
    }

    addTextureSearchPath(path:string) {
        this.textureSearchPath.addSearchPath(path);
    }

    resolveTextureFilename(filename:string):string {
        return this.textureSearchPath.resolvePath(filename);
    }

    resolveIncludeFilename(filename:string):string {
        return this.includeSearchPath.resolvePath(filename);
    }

    shader(name:string, shader:Shader) {
        if ((shader != null)) {
            //  we are declaring a shader for the first time
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare shader " + name + ", name is already in use");
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
            console.error("Unable to update shader " + name + " - shader object was not found");
            this.parameterList.clear(true);
        }

    }

    modifier(name:string, modifier:Modifier) {
        if ((modifier != null)) {
            //  we are declaring a shader for the first time
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare modifier " + name + ", name is already in use");
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
            console.error("Unable to update modifier " + name + " - modifier object was not found");
            this.parameterList.clear(true);
        }

    }

    geometry(name:string, primitives:PrimitiveList) {
        if ((primitives != null)) {
            //  we are declaring a geometry for the first time
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare geometry " + name + ", name is already in use");
                this.parameterList.clear(true);
                return;
            }

            this.renderObjects.put(name, primitives);
        }

        if ((this.lookupGeometry(name) != null)) {
            this.update(name);
        }
        else {
            console.error("Unable to update geometry " + name + " - geometry object was not found");
            this.parameterList.clear(true);
        }

    }

    geometry(name:string, tesselatable:Tesselatable) {
        if ((tesselatable != null)) {
            //  we are declaring a geometry for the first time
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare geometry " + name + ", name is already in use");
                this.parameterList.clear(true);
                return;
            }

            this.renderObjects.put(name, tesselatable);
        }

        if ((this.lookupGeometry(name) != null)) {
            this.update(name);
        }
        else {
            console.error("Unable to update geometry " + name + " - geometry object was not found");
            this.parameterList.clear(true);
        }

    }

    instance(name:string, geoname:string) {
        if ((geoname != null)) {
            //  we are declaring this instance for the first time
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare instance " + name + ", name is already in use");
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
            console.error("Unable to update instance " + name + " - instance object was not found");
            this.parameterList.clear(true);
        }

    }

    light(name:string, light:LightSource) {
        if ((light != null)) {
            //  we are declaring this light for the first time
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare light " + name + ", name is already in use");
                this.parameterList.clear(true);
                return;
            }

            this.renderObjects.put(name, light);
        }

        if ((this.lookupLight(name) != null)) {
            this.update(name);
        }
        else {
            console.error("Unable to update instance " + name + " - instance object was not found");
            this.parameterList.clear(true);
        }

    }

    camera(name:string, lens:CameraLens) {
        if ((lens != null)) {
            //  we are declaring this camera for the first time
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare camera " + name + ", name is already in use");
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
            console.error("Unable to update camera " + name + " - camera object was not found");
            this.parameterList.clear(true);
        }

    }

    options(name:string) {
        if ((this.lookupOptions(name) == null)) {
            if (this.renderObjects.has(name)) {
                console.error("Unable to declare options " + name + ", name is already in use");
                this.parameterList.clear(true);
                return;
            }

            this.renderObjects.put(name, new Options());
        }

        let lookupOptions:assert;
        (name != null);
        this.update(name);
    }

    lookupGeometry(name:string):Geometry {
        return this.renderObjects.lookupGeometry(name);
    }

    private lookupInstance(name:string):Instance {
        return this.renderObjects.lookupInstance(name);
    }

    private lookupCamera(name:string):Camera {
        return this.renderObjects.lookupCamera(name);
    }

    private lookupOptions(name:string):Options {
        return this.renderObjects.lookupOptions(name);
    }

    lookupShader(name:string):Shader {
        return this.renderObjects.lookupShader(name);
    }

    lookupModifier(name:string):Modifier {
        return this.renderObjects.lookupModifier(name);
    }

    private lookupLight(name:string):LightSource {
        return this.renderObjects.lookupLight(name);
    }

    shaderOverride(name:string, photonOverride:boolean) {
        this.scene.setShaderOverride(this.lookupShader(name), photonOverride);
    }

    render(optionsName:string, display:Display) {
        this.renderObjects.updateScene(this.scene);
        let opt:Options = this.lookupOptions(optionsName);
        if ((opt == null)) {
            opt = new Options();
        }

        this.scene.setCamera(this.lookupCamera(opt.getString("camera", null)));
        //  baking
        let bakingInstanceName:string = opt.getString("baking.instance", null);
        if ((bakingInstanceName != null)) {
            let bakingInstance:Instance = this.lookupInstance(bakingInstanceName);
            if ((bakingInstance == null)) {
                console.error("Unable to bake instance " + bakingInstanceName + " - not found");
                return;
            }

            this.scene.setBakingInstance(bakingInstance);
        }
        else {
            this.scene.setBakingInstance(null);
        }

        let samplerName:string = opt.getString("sampler", "bucket");
        let sampler:ImageSampler = null;

        if (samplerName == "" || samplerName == "none" || samplerName == "null") {
            sampler = null;
        }
        else if (samplerName == "bucket") {
            sampler = this.bucketRenderer;
        }
        else if (samplerName == "ipr") {
            sampler = this.progressiveRenderer;
        }
        else if (samplerName == "fast") {
            sampler = new SimpleRenderer();
        }
        else {
            console.error("Unknown sampler type:" + samplerName + " - aborting");
            return;
        }

        this.scene.render(opt, sampler, display);
    }

    parse(filename:string):boolean {
        if ((filename == null)) {
            return false;
        }

        filename = this.includeSearchPath.resolvePath(filename);
        let parser:SceneParser = null;
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
            console.error("Unable to find a suitable parser for:" + filename);
        }

        let currentFolder:string = (new File(filename) + getAbsoluteFile().getParentFile().getAbsolutePath());
        this.includeSearchPath.addSearchPath(currentFolder);
        this.textureSearchPath.addSearchPath(currentFolder);
        return parser.parse(filename, this);
    }

    getBounds():BoundingBox {
        return this.scene.getBounds();
    }

    build() {

    }

    static create(filename:string, frameNumber:number):GlobalIlluminationAPI {
        if ((filename == null)) {
            return new GlobalIlluminationAPI();
        }

        let api:GlobalIlluminationAPI = null;
        if (filename.endsWith(".java")) {
            let t:number = performance.now();
            console.info("Compiling " + filename);
            try {
                let stream:FileInputStream = new FileInputStream(filename);
                api = (<GlobalIlluminationAPI>(ClassBodyEvaluator.createFastClassBodyEvaluator(new Scanner(filename, stream), GlobalIlluminationAPI.class, ClassLoader.getSystemClassLoader())));
                stream.close();
            }
            catch (e) {
                console.error("Could not compile:" + filename);
                console.error(e.message);
                return null;
            }

            t = performance.now() - t;
            console.info(("Compile time:" + (t / 1000).toFixed(2)));
            if ((api != null)) {
                let currentFolder:string = (new File(filename) + getAbsoluteFile().getParentFile().getAbsolutePath());
                api.includeSearchPath.addSearchPath(currentFolder);
                api.textureSearchPath.addSearchPath(currentFolder);
            }

            console.info("Build script running ...");
            t = performance.now();
            api.setCurrentFrame(frameNumber);
            api.build();
            t = performance.now() - t;
            console.info("Build script time:" + (t / 1000).toFixed(2));
        }
        else {
            api = new GlobalIlluminationAPI();
            api = api.parse(filename);
            // TODO:Warning!!!, inline IF is not supported ?
        }

        return api;
    }

    static compile(code:string):GlobalIlluminationAPI {
        /*try {
         let t:number = performance.now();
         let api:GlobalIlluminationAPI = (<GlobalIlluminationAPI>(ClassBodyEvaluator.createFastClassBodyEvaluator(new Scanner(null, new StringReader(code)), GlobalIlluminationAPI.class, (<ClassLoader>(null)))));
         t = performance.now() - t;
         console.info("Compile time:"+(t/1000).toFixed(2));
         return api;
         }
         catch (e /!*:IOException*!/) {
         console.error(e.message);
         return null;
         }*/
    }

    getCurrentFrame():number {
        return this.currentFrame;
    }

    setCurrentFrame(currentFrame:number) {
        this.currentFrame = this.currentFrame;
    }
}