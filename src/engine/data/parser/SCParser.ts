
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class SCParser implements SceneParser {

    private p:Parser;

    private numLightSamples:number;

    constructor () {

    }

    parse(filename:string, api:GlobalIlluminationAPI):boolean {
        let localDir:string = (new File(filename) + getAbsoluteFile().getParentFile().getAbsolutePath());
        this.numLightSamples = 1;
        let timer:Timer = new Timer();
        timer.start();
        UI.printInfo(Module.API, "Parsing \""%s\"" ...", filename);
        try {
            this.p = new Parser(filename);
            while (true) {
                let token:string = this.p.getNextToken();
                if ((token == null)) {
                    break;
                }

                if (token.equals("image")) {
                    UI.printInfo(Module.API, "Reading image settings ...");
                    this.parseImageBlock(api);
                }
                else if (token.equals("background")) {
                    UI.printInfo(Module.API, "Reading background ...");
                    this.parseBackgroundBlock(api);
                }
                else if (token.equals("accel")) {
                    UI.printInfo(Module.API, "Reading accelerator type ...");
                    this.p.getNextToken();
                    console.warn(Module.API, "Setting accelerator type is not recommended - ignoring");
                }
                else if (token.equals("filter")) {
                    UI.printInfo(Module.API, "Reading image filter type ...");
                    this.parseFilter(api);
                }
                else if (token.equals("bucket")) {
                    UI.printInfo(Module.API, "Reading bucket settings ...");
                    api.parameter("bucket.size", this.p.getNextInt());
                    api.parameter("bucket.order", this.p.getNextToken());
                    api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
                }
                else if (token.equals("photons")) {
                    UI.printInfo(Module.API, "Reading photon settings ...");
                    this.parsePhotonBlock(api);
                }
                else if (token.equals("gi")) {
                    UI.printInfo(Module.API, "Reading global illumination settings ...");
                    this.parseGIBlock(api);
                }
                else if (token.equals("lightserver")) {
                    UI.printInfo(Module.API, "Reading light server settings ...");
                    this.parseLightserverBlock(api);
                }
                else if (token.equals("trace-depths")) {
                    UI.printInfo(Module.API, "Reading trace depths ...");
                    this.parseTraceBlock(api);
                }
                else if (token.equals("camera")) {
                    this.parseCamera(api);
                }
                else if (token.equals("shader")) {
                    if (!this.parseShader(api)) {
                        return false;
                    }

                }
                else if (token.equals("modifier")) {
                    if (!this.parseModifier(api)) {
                        return false;
                    }

                }
                else if (token.equals("override")) {
                    api.shaderOverride(this.p.getNextToken(), this.p.getNextBoolean());
                }
                else if (token.equals("object")) {
                    this.parseObjectBlock(api);
                }
                else if (token.equals("instance")) {
                    this.parseInstanceBlock(api);
                }
                else if (token.equals("light")) {
                    this.parseLightBlock(api);
                }
                else if (token.equals("texturepath")) {
                    let path:string = this.p.getNextToken();
                    if ((!new File(path)
                        + isAbsolute())) {
                        path = (localDir
                        + (File.separator + path));
                    }

                    api.addTextureSearchPath(path);
                }
                else if (token.equals("includepath")) {
                    let path:string = this.p.getNextToken();
                    if ((!new File(path)
                        + isAbsolute())) {
                        path = (localDir
                        + (File.separator + path));
                    }

                    api.addIncludeSearchPath(path);
                }
                else if (token.equals("include")) {
                    let file:string = this.p.getNextToken();
                    UI.printInfo(Module.API, "Including:\""%s\"" ...", file);
                    api.parse(file);
                }
                else {
                    console.warn(Module.API, "Unrecognized token %s", token);
                }

            }

            this.p.close();
        }
        catch (e /*:ParserException*/) {
            console.error(Module.API, "%s", e.getMessage());
            e.printStackTrace();
            return false;
        }
        catch (e /*:FileNotFoundException*/) {
            console.error(Module.API, "%s", e.getMessage());
            return false;
        }
        catch (e /*:IOException*/) {
            console.error(Module.API, "%s", e.getMessage());
            return false;
        }

        timer.end();
        UI.printInfo(Module.API, "Done parsing.");
        UI.printInfo(Module.API, "Parsing time:%s", timer.toString());
        return true;
    }

    private parseImageBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        if (this.p.peekNextToken("resolution")) {
            api.parameter("resolutionX", this.p.getNextInt());
            api.parameter("resolutionY", this.p.getNextInt());
        }

        if (this.p.peekNextToken("aa")) {
            api.parameter("aa.min", this.p.getNextInt());
            api.parameter("aa.max", this.p.getNextInt());
        }

        if (this.p.peekNextToken("samples")) {
            api.parameter("aa.samples", this.p.getNextInt());
        }

        if (this.p.peekNextToken("contrast")) {
            api.parameter("aa.contrast", this.p.getNextFloat());
        }

        if (this.p.peekNextToken("filter")) {
            api.parameter("filter", this.p.getNextToken());
        }

        if (this.p.peekNextToken("jitter")) {
            api.parameter("aa.jitter", this.p.getNextBoolean());
        }

        if (this.p.peekNextToken("show-aa")) {
            console.warn(Module.API, "Deprecated:show-aa ignored");
            this.p.getNextBoolean();
        }

        if (this.p.peekNextToken("output")) {
            console.warn(Module.API, "Deprecated:output statement ignored");
            this.p.getNextToken();
        }

        api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        this.p.checkNextToken("}");
    }

    private parseBackgroundBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        this.p.checkNextToken("color");
        api.parameter("color", this.parseColor());
        api.shader("background.shader", new ConstantShader());
        api.geometry("background", new Background());
        api.parameter("shaders", "background.shader");
        api.instance("background.instance", "background");
        this.p.checkNextToken("}");
    }

    private parseFilter(api:GlobalIlluminationAPI) {
        console.warn(Module.API, "Deprecated keyword \""filter\"" - set this option in the image block");
        let name:string = this.p.getNextToken();
        api.parameter("filter", name);
        api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        let hasSizeParams:boolean = (name.equals("box")
        || (name.equals("gaussian")
        || (name.equals("blackman-harris")
        || (name.equals("sinc") || name.equals("triangle")))));
        if (hasSizeParams) {
            this.p.getNextFloat();
            this.p.getNextFloat();
        }

    }

    private parsePhotonBlock(api:GlobalIlluminationAPI) {
        let numEmit:number = 0;
        let globalEmit:boolean = false;
        this.p.checkNextToken("{");
        if (this.p.peekNextToken("emit")) {
            console.warn(Module.API, "Shared photon emit values are deprectated - specify number of photons to emit per map");
            numEmit = this.p.getNextInt();
            globalEmit = true;
        }

        if (this.p.peekNextToken("global")) {
            console.warn(Module.API, "Global photon map setting belonds inside the gi block - ignoring");
            if (!globalEmit) {
                this.p.getNextInt();
            }

            this.p.getNextToken();
            this.p.getNextInt();
            this.p.getNextFloat();
        }

        this.p.checkNextToken("caustics");
        if (!globalEmit) {
            numEmit = this.p.getNextInt();
        }

        api.parameter("caustics.emit", numEmit);
        api.parameter("caustics", this.p.getNextToken());
        api.parameter("caustics.gather", this.p.getNextInt());
        api.parameter("caustics.radius", this.p.getNextFloat());
        api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        this.p.checkNextToken("}");
    }

    private parseGIBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        this.p.checkNextToken("type");
        if (this.p.peekNextToken("irr-cache")) {
            api.parameter("gi.engine", "irr-cache");
            this.p.checkNextToken("samples");
            api.parameter("gi.irr-cache.samples", this.p.getNextInt());
            this.p.checkNextToken("tolerance");
            api.parameter("gi.irr-cache.tolerance", this.p.getNextFloat());
            this.p.checkNextToken("spacing");
            api.parameter("gi.irr-cache.min_spacing", this.p.getNextFloat());
            api.parameter("gi.irr-cache.max_spacing", this.p.getNextFloat());
            //  parse global photon map info
            if (this.p.peekNextToken("global")) {
                api.parameter("gi.irr-cache.gmap.emit", this.p.getNextInt());
                api.parameter("gi.irr-cache.gmap", this.p.getNextToken());
                api.parameter("gi.irr-cache.gmap.gather", this.p.getNextInt());
                api.parameter("gi.irr-cache.gmap.radius", this.p.getNextFloat());
            }

        }
        else if (this.p.peekNextToken("path")) {
            api.parameter("gi.engine", "path");
            this.p.checkNextToken("samples");
            api.parameter("gi.path.samples", this.p.getNextInt());
            if (this.p.peekNextToken("bounces")) {
                console.warn(Module.API, "Deprecated setting:bounces - use diffuse trace depth instead");
                this.p.getNextInt();
            }

        }
        else if (this.p.peekNextToken("fake")) {
            api.parameter("gi.engine", "fake");
            this.p.checkNextToken("up");
            api.parameter("gi.fake.up", this.parseVector());
            this.p.checkNextToken("sky");
            api.parameter("gi.fake.sky", this.parseColor());
            this.p.checkNextToken("ground");
            api.parameter("gi.fake.ground", this.parseColor());
        }
        else if (this.p.peekNextToken("igi")) {
            api.parameter("gi.engine", "igi");
            this.p.checkNextToken("samples");
            api.parameter("gi.igi.samples", this.p.getNextInt());
            this.p.checkNextToken("sets");
            api.parameter("gi.igi.sets", this.p.getNextInt());
            if (!this.p.peekNextToken("b")) {
                this.p.checkNextToken("c");
            }

            api.parameter("gi.igi.c", this.p.getNextFloat());
            this.p.checkNextToken("bias-samples");
            api.parameter("gi.igi.bias_samples", this.p.getNextInt());
        }
        else if (this.p.peekNextToken("ambocc")) {
            api.parameter("gi.engine", "ambocc");
            this.p.checkNextToken("bright");
            api.parameter("gi.ambocc.bright", this.parseColor());
            this.p.checkNextToken("dark");
            api.parameter("gi.ambocc.dark", this.parseColor());
            this.p.checkNextToken("samples");
            api.parameter("gi.ambocc.samples", this.p.getNextInt());
            if (this.p.peekNextToken("maxdist")) {
                api.parameter("gi.ambocc.maxdist", this.p.getNextFloat());
            }

        }
        else if ((this.p.peekNextToken("none") || this.p.peekNextToken("null"))) {
            //  disable GI
            api.parameter("gi.engine", "none");
        }
        else {
            console.warn(Module.API, "Unrecognized gi engine type \""%s\"" - ignoring", this.p.getNextToken());
        }

        api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        this.p.checkNextToken("}");
    }

    private parseLightserverBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        if (this.p.peekNextToken("shadows")) {
            console.warn(Module.API, "Deprecated:shadows setting ignored");
            this.p.getNextBoolean();
        }

        if (this.p.peekNextToken("direct-samples")) {
            console.warn(Module.API, "Deprecated:use samples keyword in area light definitions");
            this.numLightSamples = this.p.getNextInt();
        }

        if (this.p.peekNextToken("glossy-samples")) {
            console.warn(Module.API, "Deprecated:use samples keyword in glossy shader definitions");
            this.p.getNextInt();
        }

        if (this.p.peekNextToken("max-depth")) {
            console.warn(Module.API, "Deprecated:max-depth setting - use trace-depths block instead");
            let d:number = this.p.getNextInt();
            api.parameter("depths.diffuse", 1);
            api.parameter("depths.reflection", (d - 1));
            api.parameter("depths.refraction", 0);
            api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        }

        if (this.p.peekNextToken("global")) {
            console.warn(Module.API, "Deprecated:global settings ignored - use photons block instead");
            this.p.getNextBoolean();
            this.p.getNextInt();
            this.p.getNextInt();
            this.p.getNextInt();
            this.p.getNextFloat();
        }

        if (this.p.peekNextToken("caustics")) {
            console.warn(Module.API, "Deprecated:caustics settings ignored - use photons block instead");
            this.p.getNextBoolean();
            this.p.getNextInt();
            this.p.getNextFloat();
            this.p.getNextInt();
            this.p.getNextFloat();
        }

        if (this.p.peekNextToken("irr-cache")) {
            console.warn(Module.API, "Deprecated:irradiance cache settings ignored - use gi block instead");
            this.p.getNextInt();
            this.p.getNextFloat();
            this.p.getNextFloat();
            this.p.getNextFloat();
        }

        this.p.checkNextToken("}");
    }

    private parseTraceBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        if (this.p.peekNextToken("diff")) {
            api.parameter("depths.diffuse", this.p.getNextInt());
        }

        if (this.p.peekNextToken("refl")) {
            api.parameter("depths.reflection", this.p.getNextInt());
        }

        if (this.p.peekNextToken("refr")) {
            api.parameter("depths.refraction", this.p.getNextInt());
        }

        this.p.checkNextToken("}");
        api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
    }

    private parseCamera(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        this.p.checkNextToken("type");
        let type:string = this.p.getNextToken();
        UI.printInfo(Module.API, "Reading %s camera ...", type);
        this.parseCameraTransform(api);
        let name:string = api.getUniqueName("camera");
        if (type.equals("pinhole")) {
            this.p.checkNextToken("fov");
            api.parameter("fov", this.p.getNextFloat());
            this.p.checkNextToken("aspect");
            api.parameter("aspect", this.p.getNextFloat());
            api.camera(name, new PinholeLens());
        }
        else if (type.equals("thinlens")) {
            this.p.checkNextToken("fov");
            api.parameter("fov", this.p.getNextFloat());
            this.p.checkNextToken("aspect");
            api.parameter("aspect", this.p.getNextFloat());
            this.p.checkNextToken("fdist");
            api.parameter("focus.distance", this.p.getNextFloat());
            this.p.checkNextToken("lensr");
            api.parameter("lens.radius", this.p.getNextFloat());
            if (this.p.peekNextToken("sides")) {
                api.parameter("lens.sides", this.p.getNextInt());
            }

            if (this.p.peekNextToken("rotation")) {
                api.parameter("lens.rotation", this.p.getNextFloat());
            }

            api.camera(name, new ThinLens());
        }
        else if (type.equals("spherical")) {
            //  no extra arguments
            api.camera(name, new SphericalLens());
        }
        else if (type.equals("fisheye")) {
            //  no extra arguments
            api.camera(name, new FisheyeLens());
        }
        else {
            console.warn(Module.API, "Unrecognized camera type:%s", this.p.getNextToken());
            this.p.checkNextToken("}");
            return;
        }

        this.p.checkNextToken("}");
        if ((name != null)) {
            api.parameter("camera", name);
            api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
        }

    }

    private parseCameraTransform(api:GlobalIlluminationAPI) {
        if (this.p.peekNextToken("steps")) {
            //  motion blur camera
            let n:number = this.p.getNextInt();
            api.parameter("transform.steps", n);
            for (let i:number = 0; (i < n); i++) {
                this.parseCameraMatrix(i, api);
            }

        }
        else {
            this.parseCameraMatrix(-1, api);
        }

    }

    private parseCameraMatrix(index:number, api:GlobalIlluminationAPI) {
        let offset:string = (index < 0);
        // TODO:Warning!!!, inline IF is not supported ?
        if (this.p.peekNextToken("transform")) {
            //  advanced camera
            api.parameter(String.format("transform%s", offset), this.parseMatrix());
        }
        else {
            if ((index >= 0)) {
                this.p.checkNextToken("{");
            }

            //  regular camera specification
            this.p.checkNextToken("eye");
            api.parameter(String.format("eye%s", offset), this.parsePoint());
            this.p.checkNextToken("target");
            api.parameter(String.format("target%s", offset), this.parsePoint());
            this.p.checkNextToken("up");
            api.parameter(String.format("up%s", offset), this.parseVector());
            if ((index >= 0)) {
                this.p.checkNextToken("}");
            }

        }

    }

    private parseShader(api:GlobalIlluminationAPI):boolean {
        this.p.checkNextToken("{");
        this.p.checkNextToken("name");
        let name:string = this.p.getNextToken();
        UI.printInfo(Module.API, "Reading shader:%s ...", name);
        this.p.checkNextToken("type");
        if (this.p.peekNextToken("diffuse")) {
            if (this.p.peekNextToken("diff")) {
                api.parameter("diffuse", this.parseColor());
                api.shader(name, new DiffuseShader());
            }
            else if (this.p.peekNextToken("texture")) {
                api.parameter("texture", this.p.getNextToken());
                api.shader(name, new TexturedDiffuseShader());
            }
            else {
                console.warn(Module.API, "Unrecognized option in diffuse shader block:%s", this.p.getNextToken());
            }

        }
        else if (this.p.peekNextToken("phong")) {
            let tex:string = null;
            if (this.p.peekNextToken("texture")) {
                api.parameter("texture", tex=p.getNextToken(Unknown);
            }
            else {
                this.p.checkNextToken("diff");
                api.parameter("diffuse", this.parseColor());
            }

            this.p.checkNextToken("spec");
            api.parameter("specular", this.parseColor());
            api.parameter("power", this.p.getNextFloat());
            if (this.p.peekNextToken("samples")) {
                api.parameter("samples", this.p.getNextInt());
            }

            if ((tex != null)) {
                api.shader(name, new TexturedPhongShader());
            }
            else {
                api.shader(name, new PhongShader());
            }

        }
        else if ((this.p.peekNextToken("amb-occ") || this.p.peekNextToken("amb-occ2"))) {
            let tex:string = null;
            if ((this.p.peekNextToken("diff") || this.p.peekNextToken("bright"))) {
                api.parameter("bright", this.parseColor());
            }
            else if (this.p.peekNextToken("texture")) {
                api.parameter("texture", tex=p.getNextToken(Unknown);
            }

            if (this.p.peekNextToken("dark")) {
                api.parameter("dark", this.parseColor());
                this.p.checkNextToken("samples");
                api.parameter("samples", this.p.getNextInt());
                this.p.checkNextToken("dist");
                api.parameter("maxdist", this.p.getNextFloat());
            }

            if ((tex == null)) {
                api.shader(name, new AmbientOcclusionShader());
            }
            else {
                api.shader(name, new TexturedAmbientOcclusionShader());
            }

        }
        else if (this.p.peekNextToken("mirror")) {
            this.p.checkNextToken("refl");
            api.parameter("color", this.parseColor());
            api.shader(name, new MirrorShader());
        }
        else if (this.p.peekNextToken("glass")) {
            this.p.checkNextToken("eta");
            api.parameter("eta", this.p.getNextFloat());
            this.p.checkNextToken("color");
            api.parameter("color", this.parseColor());
            if (this.p.peekNextToken("absorbtion.distance")) {
                api.parameter("absorbtion.distance", this.p.getNextFloat());
            }

            if (this.p.peekNextToken("absorbtion.color")) {
                api.parameter("absorbtion.color", this.parseColor());
            }

            api.shader(name, new GlassShader());
        }
        else if (this.p.peekNextToken("shiny")) {
            let tex:string = null;
            if (this.p.peekNextToken("texture")) {
                api.parameter("texture", tex=p.getNextToken(Unknown);
            }
            else {
                this.p.checkNextToken("diff");
                api.parameter("diffuse", this.parseColor());
            }

            this.p.checkNextToken("refl");
            api.parameter("shiny", this.p.getNextFloat());
            if ((tex == null)) {
                api.shader(name, new ShinyDiffuseShader());
            }
            else {
                api.shader(name, new TexturedShinyDiffuseShader());
            }

        }
        else if (this.p.peekNextToken("ward")) {
            let tex:string = null;
            if (this.p.peekNextToken("texture")) {
                api.parameter("texture", tex=p.getNextToken(Unknown);
            }
            else {
                this.p.checkNextToken("diff");
                api.parameter("diffuse", this.parseColor());
            }

            this.p.checkNextToken("spec");
            api.parameter("specular", this.parseColor());
            this.p.checkNextToken("rough");
            api.parameter("roughnessX", this.p.getNextFloat());
            api.parameter("roughnessY", this.p.getNextFloat());
            if (this.p.peekNextToken("samples")) {
                api.parameter("samples", this.p.getNextInt());
            }

            if ((tex != null)) {
                api.shader(name, new TexturedWardShader());
            }
            else {
                api.shader(name, new AnisotropicWardShader());
            }

        }
        else if (this.p.peekNextToken("view-caustics")) {
            api.shader(name, new ViewCausticsShader());
        }
        else if (this.p.peekNextToken("view-irradiance")) {
            api.shader(name, new ViewIrradianceShader());
        }
        else if (this.p.peekNextToken("view-global")) {
            api.shader(name, new ViewGlobalPhotonsShader());
        }
        else if (this.p.peekNextToken("constant")) {
            //  backwards compatibility -- peek only
            this.p.peekNextToken("color");
            api.parameter("color", this.parseColor());
            api.shader(name, new ConstantShader());
        }
        else if (this.p.peekNextToken("janino")) {
            let code:string = this.p.getNextCodeBlock();
            try {
                let shader:Shader = (<Shader>(ClassBodyEvaluator.createFastClassBodyEvaluator(new Scanner(null, new StringReader(code)), Shader.class, ClassLoader.getSystemClassLoader())));
                api.shader(name, shader);
            }
            catch (e /*:CompileException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                return false;
            }
            catch (e /*:ParseException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                return false;
            }
            catch (e /*:ScanException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                return false;
            }
            catch (e /*:IOException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                return false;
            }

        }
        else if (this.p.peekNextToken("id")) {
            api.shader(name, new IDShader());
        }
        else if (this.p.peekNextToken("uber")) {
            if (this.p.peekNextToken("diff")) {
                api.parameter("diffuse", this.parseColor());
            }

            if (this.p.peekNextToken("diff.texture")) {
                api.parameter("diffuse.texture", this.p.getNextToken());
            }

            if (this.p.peekNextToken("diff.blend")) {
                api.parameter("diffuse.blend", this.p.getNextFloat());
            }

            if ((this.p.peekNextToken("refl") || this.p.peekNextToken("spec"))) {
                api.parameter("specular", this.parseColor());
            }

            if (this.p.peekNextToken("texture")) {
                //  deprecated
                console.warn(Module.API, "Deprecated uber shader parameter \""texture\"" - please use \""diffuse.texture\"" and \""diffuse.blend\"" instead");
                api.parameter("diffuse.texture", this.p.getNextToken());
                api.parameter("diffuse.blend", this.p.getNextFloat());
            }

            if (this.p.peekNextToken("spec.texture")) {
                api.parameter("specular.texture", this.p.getNextToken());
            }

            if (this.p.peekNextToken("spec.blend")) {
                api.parameter("specular.blend", this.p.getNextFloat());
            }

            if (this.p.peekNextToken("glossy")) {
                api.parameter("glossyness", this.p.getNextFloat());
            }

            if (this.p.peekNextToken("samples")) {
                api.parameter("samples", this.p.getNextInt());
            }

            api.shader(name, new UberShader());
        }
        else {
            console.warn(Module.API, "Unrecognized shader type:%s", this.p.getNextToken());
        }

        this.p.checkNextToken("}");
        return true;
    }

    private parseModifier(api:GlobalIlluminationAPI):boolean {
        this.p.checkNextToken("{");
        this.p.checkNextToken("name");
        let name:string = this.p.getNextToken();
        UI.printInfo(Module.API, "Reading shader:%s ...", name);
        this.p.checkNextToken("type");
        if (this.p.peekNextToken("bump")) {
            this.p.checkNextToken("texture");
            api.parameter("texture", this.p.getNextToken());
            this.p.checkNextToken("scale");
            api.parameter("scale", this.p.getNextFloat());
            api.modifier(name, new BumpMappingModifier());
        }
        else if (this.p.peekNextToken("normalmap")) {
            this.p.checkNextToken("texture");
            api.parameter("texture", this.p.getNextToken());
            api.modifier(name, new NormalMapModifier());
        }
        else {
            console.warn(Module.API, "Unrecognized modifier type:%s", this.p.getNextToken());
        }

        this.p.checkNextToken("}");
        return true;
    }

    private parseObjectBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        let noInstance:boolean = false;
        let transform:Matrix4 = null;
        let name:string = null;
        let shaders:string[] = null;
        let modifiers:string[] = null;
        if (this.p.peekNextToken("noinstance")) {
            //  this indicates that the geometry is to be created, but not
            //  instanced into the scene
            noInstance = true;
        }
        else {
            //  these are the parameters to be passed to the instance
            if (this.p.peekNextToken("shaders")) {
                let n:number = this.p.getNextInt();
                shaders = new Array(n);
                for (let i:number = 0; (i < n); i++) {
                    shaders[i] = this.p.getNextToken();
                }

            }
            else {
                this.p.checkNextToken("shader");
                shaders = [
                    this.p.getNextToken()];
            }

            if (this.p.peekNextToken("modifiers")) {
                let n:number = this.p.getNextInt();
                modifiers = new Array(n);
                for (let i:number = 0; (i < n); i++) {
                    modifiers[i] = this.p.getNextToken();
                }

            }
            else if (this.p.peekNextToken("modifier")) {
                modifiers = [
                    this.p.getNextToken()];
            }

            if (this.p.peekNextToken("transform")) {
                transform = this.parseMatrix();
            }

        }

        if (this.p.peekNextToken("accel")) {
            api.parameter("accel", this.p.getNextToken());
        }

        this.p.checkNextToken("type");
        let type:string = this.p.getNextToken();
        if (this.p.peekNextToken("name")) {
            name = this.p.getNextToken();
        }
        else {
            name = api.getUniqueName(type);
        }

        if (type.equals("mesh")) {
            console.warn(Module.API, "Deprecated object type:mesh");
            UI.printInfo(Module.API, "Reading mesh:%s ...", name);
            let numVertices:number = this.p.getNextInt();
            let numTriangles:number = this.p.getNextInt();
            let points:number[] = new Array((numVertices * 3));
            let normals:number[] = new Array((numVertices * 3));
            let uvs:number[] = new Array((numVertices * 2));
            for (let i:number = 0; (i < numVertices); i++) {
                this.p.checkNextToken("v");
                points[((3 * i)
                + 0)] = this.p.getNextFloat();
                points[((3 * i)
                + 1)] = this.p.getNextFloat();
                points[((3 * i)
                + 2)] = this.p.getNextFloat();
                normals[((3 * i)
                + 0)] = this.p.getNextFloat();
                normals[((3 * i)
                + 1)] = this.p.getNextFloat();
                normals[((3 * i)
                + 2)] = this.p.getNextFloat();
                uvs[((2 * i)
                + 0)] = this.p.getNextFloat();
                uvs[((2 * i)
                + 1)] = this.p.getNextFloat();
            }

            let triangles:number[] = new Array((numTriangles * 3));
            for (let i:number = 0; (i < numTriangles); i++) {
                this.p.checkNextToken("t");
                triangles[((i * 3)
                + 0)] = this.p.getNextInt();
                triangles[((i * 3)
                + 1)] = this.p.getNextInt();
                triangles[((i * 3)
                + 2)] = this.p.getNextInt();
            }

            //  create geometry
            api.parameter("triangles", triangles);
            api.parameter("points", "point", "vertex", points);
            api.parameter("normals", "vector", "vertex", normals);
            api.parameter("uvs", "texcoord", "vertex", uvs);
            api.geometry(name, new TriangleMesh());
        }
        else if (type.equals("flat-mesh")) {
            console.warn(Module.API, "Deprecated object type:flat-mesh");
            UI.printInfo(Module.API, "Reading flat mesh:%s ...", name);
            let numVertices:number = this.p.getNextInt();
            let numTriangles:number = this.p.getNextInt();
            let points:number[] = new Array((numVertices * 3));
            let uvs:number[] = new Array((numVertices * 2));
            for (let i:number = 0; (i < numVertices); i++) {
                this.p.checkNextToken("v");
                points[((3 * i)
                + 0)] = this.p.getNextFloat();
                points[((3 * i)
                + 1)] = this.p.getNextFloat();
                points[((3 * i)
                + 2)] = this.p.getNextFloat();
                this.p.getNextFloat();
                this.p.getNextFloat();
                this.p.getNextFloat();
                uvs[((2 * i)
                + 0)] = this.p.getNextFloat();
                uvs[((2 * i)
                + 1)] = this.p.getNextFloat();
            }

            let triangles:number[] = new Array((numTriangles * 3));
            for (let i:number = 0; (i < numTriangles); i++) {
                this.p.checkNextToken("t");
                triangles[((i * 3)
                + 0)] = this.p.getNextInt();
                triangles[((i * 3)
                + 1)] = this.p.getNextInt();
                triangles[((i * 3)
                + 2)] = this.p.getNextInt();
            }

            //  create geometry
            api.parameter("triangles", triangles);
            api.parameter("points", "point", "vertex", points);
            api.parameter("uvs", "texcoord", "vertex", uvs);
            api.geometry(name, new TriangleMesh());
        }
        else if (type.equals("sphere")) {
            UI.printInfo(Module.API, "Reading sphere ...");
            api.geometry(name, new Sphere());
            if (((transform == null)
                && !noInstance)) {
                //  legacy method of specifying transformation for spheres
                this.p.checkNextToken("c");
                let x:number = this.p.getNextFloat();
                let y:number = this.p.getNextFloat();
                let z:number = this.p.getNextFloat();
                this.p.checkNextToken("r");
                let radius:number = this.p.getNextFloat();
                api.parameter("transform", Matrix4.translation(x, y, z).multiply(Matrix4.scale(radius)));
                api.parameter("shaders", shaders);
                if ((modifiers != null)) {
                    api.parameter("modifiers", modifiers);
                }

                api.instance((name + ".instance"), name);
                noInstance = true;
                //  disable future auto-instancing because
                //  instance has already been created
            }

        }
        else if (type.equals("banchoff")) {
            UI.printInfo(Module.API, "Reading banchoff ...");
            api.geometry(name, new BanchoffSurface());
        }
        else if (type.equals("torus")) {
            UI.printInfo(Module.API, "Reading torus ...");
            this.p.checkNextToken("r");
            api.parameter("radiusInner", this.p.getNextFloat());
            api.parameter("radiusOuter", this.p.getNextFloat());
            api.geometry(name, new Torus());
        }
        else if (type.equals("plane")) {
            UI.printInfo(Module.API, "Reading plane ...");
            this.p.checkNextToken("p");
            api.parameter("center", this.parsePoint());
            if (this.p.peekNextToken("n")) {
                api.parameter("normal", this.parseVector());
            }
            else {
                this.p.checkNextToken("p");
                api.parameter("point1", this.parsePoint());
                this.p.checkNextToken("p");
                api.parameter("point2", this.parsePoint());
            }

            api.geometry(name, new Plane());
        }
        else if (type.equals("cornellbox")) {
            UI.printInfo(Module.API, "Reading cornell box ...");
            if ((transform != null)) {
                console.warn(Module.API, "Instancing is not supported on cornell box -- ignoring transform");
            }

            this.p.checkNextToken("corner0");
            api.parameter("corner0", this.parsePoint());
            this.p.checkNextToken("corner1");
            api.parameter("corner1", this.parsePoint());
            this.p.checkNextToken("left");
            api.parameter("leftColor", this.parseColor());
            this.p.checkNextToken("right");
            api.parameter("rightColor", this.parseColor());
            this.p.checkNextToken("top");
            api.parameter("topColor", this.parseColor());
            this.p.checkNextToken("bottom");
            api.parameter("bottomColor", this.parseColor());
            this.p.checkNextToken("back");
            api.parameter("backColor", this.parseColor());
            this.p.checkNextToken("emit");
            api.parameter("radiance", this.parseColor());
            if (this.p.peekNextToken("samples")) {
                api.parameter("samples", this.p.getNextInt());
            }

            (new CornellBox() + init(name, api));
            noInstance = true;
            //  instancing is handled natively by the init
            //  method
        }
        else if (type.equals("generic-mesh")) {
            UI.printInfo(Module.API, "Reading generic mesh:%s ... ", name);
            //  parse vertices
            this.p.checkNextToken("points");
            let np:number = this.p.getNextInt();
            api.parameter("points", "point", "vertex", this.parseFloatArray((np * 3)));
            //  parse triangle indices
            this.p.checkNextToken("triangles");
            let nt:number = this.p.getNextInt();
            api.parameter("triangles", this.parseIntArray((nt * 3)));
            //  parse normals
            this.p.checkNextToken("normals");
            if (this.p.peekNextToken("vertex")) {
                api.parameter("normals", "vector", "vertex", this.parseFloatArray((np * 3)));
            }
            else if (this.p.peekNextToken("facevarying")) {
                api.parameter("normals", "vector", "facevarying", this.parseFloatArray((nt * 9)));
            }
            else {
                this.p.checkNextToken("none");
            }

            //  parse texture coordinates
            this.p.checkNextToken("uvs");
            if (this.p.peekNextToken("vertex")) {
                api.parameter("uvs", "texcoord", "vertex", this.parseFloatArray((np * 2)));
            }
            else if (this.p.peekNextToken("facevarying")) {
                api.parameter("uvs", "texcoord", "facevarying", this.parseFloatArray((nt * 6)));
            }
            else {
                this.p.checkNextToken("none");
            }

            if (this.p.peekNextToken("face_shaders")) {
                api.parameter("faceshaders", this.parseIntArray(nt));
            }

            api.geometry(name, new TriangleMesh());
        }
        else if (type.equals("hair")) {
            UI.printInfo(Module.API, "Reading hair curves:%s ... ", name);
            this.p.checkNextToken("segments");
            api.parameter("segments", this.p.getNextInt());
            this.p.checkNextToken("width");
            api.parameter("widths", this.p.getNextFloat());
            this.p.checkNextToken("points");
            api.parameter("points", "point", "vertex", this.parseFloatArray(this.p.getNextInt()));
            api.geometry(name, new Hair());
        }
        else if (type.equals("janino-tesselatable")) {
            UI.printInfo(Module.API, "Reading procedural primitive:%s ... ", name);
            let code:string = this.p.getNextCodeBlock();
            try {
                let tess:Tesselatable = (<Tesselatable>(ClassBodyEvaluator.createFastClassBodyEvaluator(new Scanner(null, new StringReader(code)), Tesselatable.class, ClassLoader.getSystemClassLoader())));
                api.geometry(name, tess);
            }
            catch (e /*:CompileException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                noInstance = true;
            }
            catch (e /*:ParseException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                noInstance = true;
            }
            catch (e /*:ScanException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                noInstance = true;
            }
            catch (e /*:IOException*/) {
                UI.printDetailed(Module.API, "Compiling:%s", code);
                console.error(Module.API, "%s", e.getMessage());
                e.printStackTrace();
                noInstance = true;
            }

        }
        else if (type.equals("teapot")) {
            UI.printInfo(Module.API, "Reading teapot:%s ... ", name);
            let hasTesselationArguments:boolean = false;
            if (this.p.peekNextToken("subdivs")) {
                api.parameter("subdivs", this.p.getNextInt());
                hasTesselationArguments = true;
            }

            if (this.p.peekNextToken("smooth")) {
                api.parameter("smooth", this.p.getNextBoolean());
                hasTesselationArguments = true;
            }

            if (hasTesselationArguments) {
                api.geometry(name, (<Tesselatable>(new Teapot())));
            }
            else {
                api.geometry(name, (<PrimitiveList>(new Teapot())));
            }

        }
        else if (type.equals("gumbo")) {
            UI.printInfo(Module.API, "Reading gumbo:%s ... ", name);
            let hasTesselationArguments:boolean = false;
            if (this.p.peekNextToken("subdivs")) {
                api.parameter("subdivs", this.p.getNextInt());
                hasTesselationArguments = true;
            }

            if (this.p.peekNextToken("smooth")) {
                api.parameter("smooth", this.p.getNextBoolean());
                hasTesselationArguments = true;
            }

            if (hasTesselationArguments) {
                api.geometry(name, (<Tesselatable>(new Gumbo())));
            }
            else {
                api.geometry(name, (<PrimitiveList>(new Gumbo())));
            }

        }
        else if (type.equals("julia")) {
            UI.printInfo(Module.API, "Reading julia fractal:%s ... ", name);
            if (this.p.peekNextToken("q")) {
                api.parameter("cw", this.p.getNextFloat());
                api.parameter("cx", this.p.getNextFloat());
                api.parameter("cy", this.p.getNextFloat());
                api.parameter("cz", this.p.getNextFloat());
            }

            if (this.p.peekNextToken("iterations")) {
                api.parameter("iterations", this.p.getNextInt());
            }

            if (this.p.peekNextToken("epsilon")) {
                api.parameter("epsilon", this.p.getNextFloat());
            }

            api.geometry(name, new JuliaFractal());
        }
        else if ((type.equals("particles") || type.equals("dlasurface"))) {
            if (type.equals("dlasurface")) {
                console.warn(Module.API, "Deprecated object type:\""dlasurface\"" - please use \""particles\"" instead");
            }

            this.p.checkNextToken("filename");
            let filename:string = this.p.getNextToken();
            let littleEndian:boolean = false;
            if (this.p.peekNextToken("little_endian")) {
                littleEndian = true;
            }

            UI.printInfo(Module.USER, "Loading particle file:%s", filename);
            let file:File = new File(filename);
            let stream:FileInputStream = new FileInputStream(filename);
            let map:MappedByteBuffer = stream.getChannel().map(FileChannel.MapMode.READ_ONLY, 0, file.length());
            if (littleEndian) {
                map.order(ByteOrder.LITTLE_ENDIAN);
            }

            let buffer:FloatBuffer = map.asFloatBuffer();
            let data:number[] = new Array(buffer.capacity());
            for (let i:number = 0; (i < data.length); i++) {
                data[i] = buffer.get(i);
            }

            stream.close();
            api.parameter("particles", "point", "vertex", data);
            if (this.p.peekNextToken("num")) {
                api.parameter("num", this.p.getNextInt());
            }
            else {
                api.parameter("num", (data.length / 3));
            }

            this.p.checkNextToken("radius");
            api.parameter("radius", this.p.getNextFloat());
            api.geometry(name, new ParticleSurface());
        }
        else if (type.equals("file-mesh")) {
            UI.printInfo(Module.API, "Reading file mesh:%s ... ", name);
            this.p.checkNextToken("filename");
            api.parameter("filename", this.p.getNextToken());
            if (this.p.peekNextToken("smooth_normals")) {
                api.parameter("smooth_normals", this.p.getNextBoolean());
            }

            api.geometry(name, new FileMesh());
        }
        else if (type.equals("bezier-mesh")) {
            UI.printInfo(Module.API, "Reading bezier mesh:%s ... ", name);
            this.p.checkNextToken("n");
            let nv:number;
            let nu:number;
            api.parameter("nu", nu=p.getNextInt(Unknown);
            api.parameter("nv", nv=p.getNextInt(Unknown);
            if (this.p.peekNextToken("wrap")) {
                api.parameter("uwrap", this.p.getNextBoolean());
                api.parameter("vwrap", this.p.getNextBoolean());
            }

            this.p.checkNextToken("points");
            let points:number[] = new Array((3
            * (nu * nv)));
            for (let i:number = 0; (i < points.length); i++) {
                points[i] = this.p.getNextFloat();
            }

            api.parameter("points", "point", "vertex", points);
            if (this.p.peekNextToken("subdivs")) {
                api.parameter("subdivs", this.p.getNextInt());
            }

            if (this.p.peekNextToken("smooth")) {
                api.parameter("smooth", this.p.getNextBoolean());
            }

            api.geometry(name, (<Tesselatable>(new BezierMesh())));
        }
        else {
            console.warn(Module.API, "Unrecognized object type:%s", this.p.getNextToken());
            noInstance = true;
        }

        if (!noInstance) {
            //  create instance
            api.parameter("shaders", shaders);
            if ((modifiers != null)) {
                api.parameter("modifiers", modifiers);
            }

            if ((transform != null)) {
                api.parameter("transform", transform);
            }

            api.instance((name + ".instance"), name);
        }

        this.p.checkNextToken("}");
    }

    private parseInstanceBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        this.p.checkNextToken("name");
        let name:string = this.p.getNextToken();
        UI.printInfo(Module.API, "Reading instance:%s ...", name);
        this.p.checkNextToken("geometry");
        let geoname:string = this.p.getNextToken();
        this.p.checkNextToken("transform");
        api.parameter("transform", this.parseMatrix());
        let shaders:string[];
        if (this.p.peekNextToken("shaders")) {
            let n:number = this.p.getNextInt();
            shaders = new Array(n);
            for (let i:number = 0; (i < n); i++) {
                shaders[i] = this.p.getNextToken();
            }

        }
        else {
            this.p.checkNextToken("shader");
            shaders = [
                this.p.getNextToken()];
        }

        api.parameter("shaders", shaders);
        let modifiers:string[] = null;
        if (this.p.peekNextToken("modifiers")) {
            let n:number = this.p.getNextInt();
            modifiers = new Array(n);
            for (let i:number = 0; (i < n); i++) {
                modifiers[i] = this.p.getNextToken();
            }

        }
        else if (this.p.peekNextToken("modifier")) {
            modifiers = [
                this.p.getNextToken()];
        }

        if ((modifiers != null)) {
            api.parameter("modifiers", modifiers);
        }

        api.instance(name, geoname);
        this.p.checkNextToken("}");
    }

    private parseLightBlock(api:GlobalIlluminationAPI) {
        this.p.checkNextToken("{");
        this.p.checkNextToken("type");
        if (this.p.peekNextToken("mesh")) {
            console.warn(Module.API, "Deprecated light type:mesh");
            this.p.checkNextToken("name");
            let name:string = this.p.getNextToken();
            UI.printInfo(Module.API, "Reading light mesh:%s ...", name);
            this.p.checkNextToken("emit");
            api.parameter("radiance", this.parseColor());
            let samples:number = this.numLightSamples;
            if (this.p.peekNextToken("samples")) {
                samples = this.p.getNextInt();
            }
            else {
                console.warn(Module.API, "Samples keyword not found - defaulting to %d", samples);
            }

            api.parameter("samples", samples);
            let numVertices:number = this.p.getNextInt();
            let numTriangles:number = this.p.getNextInt();
            let points:number[] = new Array((3 * numVertices));
            let triangles:number[] = new Array((3 * numTriangles));
            for (let i:number = 0; (i < numVertices); i++) {
                this.p.checkNextToken("v");
                points[((3 * i)
                + 0)] = this.p.getNextFloat();
                points[((3 * i)
                + 1)] = this.p.getNextFloat();
                points[((3 * i)
                + 2)] = this.p.getNextFloat();
                //  ignored
                this.p.getNextFloat();
                this.p.getNextFloat();
                this.p.getNextFloat();
                this.p.getNextFloat();
                this.p.getNextFloat();
            }

            for (let i:number = 0; (i < numTriangles); i++) {
                this.p.checkNextToken("t");
                triangles[((3 * i)
                + 0)] = this.p.getNextInt();
                triangles[((3 * i)
                + 1)] = this.p.getNextInt();
                triangles[((3 * i)
                + 2)] = this.p.getNextInt();
            }

            api.parameter("points", "point", "vertex", points);
            api.parameter("triangles", triangles);
            let mesh:TriangleMeshLight = new TriangleMeshLight();
            mesh.init(name, api);
        }
        else if (this.p.peekNextToken("point")) {
            UI.printInfo(Module.API, "Reading point light ...");
            let pow:Color;
            if (this.p.peekNextToken("color")) {
                pow = this.parseColor();
                this.p.checkNextToken("power");
                let po:number = this.p.getNextFloat();
                pow.mul(po);
            }
            else {
                console.warn(Module.API, "Deprecated color specification - please use color and power instead");
                this.p.checkNextToken("power");
                pow = this.parseColor();
            }

            this.p.checkNextToken("p");
            api.parameter("center", this.parsePoint());
            api.parameter("power", pow);
            api.light(api.getUniqueName("pointlight"), new PointLight());
        }
        else if (this.p.peekNextToken("spherical")) {
            UI.printInfo(Module.API, "Reading spherical light ...");
            this.p.checkNextToken("color");
            let pow:Color = this.parseColor();
            this.p.checkNextToken("radiance");
            pow.mul(this.p.getNextFloat());
            api.parameter("radiance", pow);
            this.p.checkNextToken("center");
            api.parameter("center", this.parsePoint());
            this.p.checkNextToken("radius");
            api.parameter("radius", this.p.getNextFloat());
            this.p.checkNextToken("samples");
            api.parameter("samples", this.p.getNextInt());
            let light:SphereLight = new SphereLight();
            light.init(api.getUniqueName("spherelight"), api);
        }
        else if (this.p.peekNextToken("directional")) {
            UI.printInfo(Module.API, "Reading directional light ...");
            this.p.checkNextToken("source");
            let s:Point3 = this.parsePoint();
            api.parameter("source", s);
            this.p.checkNextToken("target");
            let t:Point3 = this.parsePoint();
            api.parameter("dir", Point3.sub(t, s, new Vector3()));
            this.p.checkNextToken("radius");
            api.parameter("radius", this.p.getNextFloat());
            this.p.checkNextToken("emit");
            let e:Color = this.parseColor();
            if (this.p.peekNextToken("intensity")) {
                let i:number = this.p.getNextFloat();
                e.mul(i);
            }
            else {
                console.warn(Module.API, "Deprecated color specification - please use emit and intensity instead");
            }

            api.parameter("radiance", e);
            api.light(api.getUniqueName("dirlight"), new DirectionalSpotlight());
        }
        else if (this.p.peekNextToken("ibl")) {
            UI.printInfo(Module.API, "Reading image based light ...");
            this.p.checkNextToken("image");
            api.parameter("texture", this.p.getNextToken());
            this.p.checkNextToken("center");
            api.parameter("center", this.parseVector());
            this.p.checkNextToken("up");
            api.parameter("up", this.parseVector());
            this.p.checkNextToken("lock");
            api.parameter("fixed", this.p.getNextBoolean());
            let samples:number = this.numLightSamples;
            if (this.p.peekNextToken("samples")) {
                samples = this.p.getNextInt();
            }
            else {
                console.warn(Module.API, "Samples keyword not found - defaulting to %d", samples);
            }

            api.parameter("samples", samples);
            let ibl:ImageBasedLight = new ImageBasedLight();
            ibl.init(api.getUniqueName("ibl"), api);
        }
        else if (this.p.peekNextToken("meshlight")) {
            this.p.checkNextToken("name");
            let name:string = this.p.getNextToken();
            UI.printInfo(Module.API, "Reading meshlight:%s ...", name);
            this.p.checkNextToken("emit");
            let e:Color = this.parseColor();
            if (this.p.peekNextToken("radiance")) {
                let r:number = this.p.getNextFloat();
                e.mul(r);
            }
            else {
                console.warn(Module.API, "Deprecated color specification - please use emit and radiance instead");
            }

            api.parameter("radiance", e);
            let samples:number = this.numLightSamples;
            if (this.p.peekNextToken("samples")) {
                samples = this.p.getNextInt();
            }
            else {
                console.warn(Module.API, "Samples keyword not found - defaulting to %d", samples);
            }

            api.parameter("samples", samples);
            //  parse vertices
            this.p.checkNextToken("points");
            let np:number = this.p.getNextInt();
            api.parameter("points", "point", "vertex", this.parseFloatArray((np * 3)));
            //  parse triangle indices
            this.p.checkNextToken("triangles");
            let nt:number = this.p.getNextInt();
            api.parameter("triangles", this.parseIntArray((nt * 3)));
            let mesh:TriangleMeshLight = new TriangleMeshLight();
            mesh.init(name, api);
        }
        else if (this.p.peekNextToken("sunsky")) {
            this.p.checkNextToken("up");
            api.parameter("up", this.parseVector());
            this.p.checkNextToken("east");
            api.parameter("east", this.parseVector());
            this.p.checkNextToken("sundir");
            api.parameter("sundir", this.parseVector());
            this.p.checkNextToken("turbidity");
            api.parameter("turbidity", this.p.getNextFloat());
            if (this.p.peekNextToken("samples")) {
                api.parameter("samples", this.p.getNextInt());
            }

            let sunsky:SunSkyLight = new SunSkyLight();
            sunsky.init(api.getUniqueName("sunsky"), api);
        }
        else {
            console.warn(Module.API, "Unrecognized object type:%s", this.p.getNextToken());
        }

        this.p.checkNextToken("}");
    }

    private parseColor():Color {
        if (this.p.peekNextToken("{")) {
            let space:string = this.p.getNextToken();
            let c:Color = null;
            if (space.equals("sRGB nonlinear")) {
                let r:number = this.p.getNextFloat();
                let g:number = this.p.getNextFloat();
                let b:number = this.p.getNextFloat();
                c = new Color(r, g, b);
                c.toLinear();
            }
            else if (space.equals("sRGB linear")) {
                let r:number = this.p.getNextFloat();
                let g:number = this.p.getNextFloat();
                let b:number = this.p.getNextFloat();
                c = new Color(r, g, b);
            }
            else {
                console.warn(Module.API, "Unrecognized color space:%s", space);
            }

            this.p.checkNextToken("}");
            return c;
        }
        else {
            let r:number = this.p.getNextFloat();
            let g:number = this.p.getNextFloat();
            let b:number = this.p.getNextFloat();
            return new Color(r, g, b);
        }

    }

    private parsePoint():Point3 {
        let x:number = this.p.getNextFloat();
        let y:number = this.p.getNextFloat();
        let z:number = this.p.getNextFloat();
        return new Point3(x, y, z);
    }

    private parseVector():Vector3 {
        let x:number = this.p.getNextFloat();
        let y:number = this.p.getNextFloat();
        let z:number = this.p.getNextFloat();
        return new Vector3(x, y, z);
    }

    private parseIntArray(size:number):number[] {
        let data:number[] = new Array(size);
        for (let i:number = 0; (i < size); i++) {
            data[i] = this.p.getNextInt();
        }

        return data;
    }

    private parseFloatArray(size:number):number[] {
        let data:number[] = new Array(size);
        for (let i:number = 0; (i < size); i++) {
            data[i] = this.p.getNextFloat();
        }

        return data;
    }

    private parseMatrix():Matrix4 {
        if (this.p.peekNextToken("row")) {
            return new Matrix4(this.parseFloatArray(16), true);
        }
        else if (this.p.peekNextToken("col")) {
            return new Matrix4(this.parseFloatArray(16), false);
        }
        else {
            let m:Matrix4 = Matrix4.IDENTITY;
            this.p.checkNextToken("{");
            while (!this.p.peekNextToken("}")) {
                let t:Matrix4 = null;
                if (this.p.peekNextToken("translate")) {
                    let x:number = this.p.getNextFloat();
                    let y:number = this.p.getNextFloat();
                    let z:number = this.p.getNextFloat();
                    t = Matrix4.translation(x, y, z);
                }
                else if (this.p.peekNextToken("scaleu")) {
                    let s:number = this.p.getNextFloat();
                    t = Matrix4.scale(s);
                }
                else if (this.p.peekNextToken("scale")) {
                    let x:number = this.p.getNextFloat();
                    let y:number = this.p.getNextFloat();
                    let z:number = this.p.getNextFloat();
                    t = Matrix4.scale(x, y, z);
                }
                else if (this.p.peekNextToken("rotatex")) {
                    let angle:number = this.p.getNextFloat();
                    t = Matrix4.rotateX((<number>(Math.toRadians(angle))));
                }
                else if (this.p.peekNextToken("rotatey")) {
                    let angle:number = this.p.getNextFloat();
                    t = Matrix4.rotateY((<number>(Math.toRadians(angle))));
                }
                else if (this.p.peekNextToken("rotatez")) {
                    let angle:number = this.p.getNextFloat();
                    t = Matrix4.rotateZ((<number>(Math.toRadians(angle))));
                }
                else if (this.p.peekNextToken("rotate")) {
                    let x:number = this.p.getNextFloat();
                    let y:number = this.p.getNextFloat();
                    let z:number = this.p.getNextFloat();
                    let angle:number = this.p.getNextFloat();
                    t = Matrix4.rotate(x, y, z, (<number>(Math.toRadians(angle))));
                }
                else {
                    console.warn(Module.API, "Unrecognized transformation type:%s", this.p.getNextToken());
                }

                if ((t != null)) {
                    m = t.multiply(m);
                }

            }

            return m;
        }

    }
}