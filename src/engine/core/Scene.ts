/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Scene {

    //  scene storage
    private lightServer:LightServer;

    private instanceList:InstanceList;

    private infiniteInstanceList:InstanceList;

    private camera:Camera;

    private intAccel:AccelerationStructure;

    private acceltype:string;

    //  baking
    private bakingViewDependent:boolean;

    private bakingInstance:Instance;

    private bakingPrimitives:PrimitiveList;

    private bakingAccel:AccelerationStructure;

    private rebuildAccel:boolean;

    //  image size
    private imageWidth:number;

    private imageHeight:number;

    //  global options
    private threads:number;

    private lowPriority:boolean;

    constructor () {
        this.lightServer = new LightServer(this);
        this.instanceList = new InstanceList();
        this.infiniteInstanceList = new InstanceList();
        this.acceltype = "auto";
        this.bakingViewDependent = false;
        this.bakingInstance = null;
        this.bakingPrimitives = null;
        this.bakingAccel = null;
        this.camera = null;
        this.imageWidth = 640;
        this.imageHeight = 480;
        this.threads = 0;
        this.lowPriority = true;
        this.rebuildAccel = true;
    }

    getThreads():number {
        return (this.threads <= 0);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getThreadPriority():number {
        return this.lowPriority;
        // TODO:Warning!!!, inline IF is not supported ?
    }

    setCamera(camera:Camera) {
        this.camera = this.camera;
    }

    getCamera():Camera {
        return this.camera;
    }

    setInstanceLists(instances:Instance[], infinite:Instance[]) {
        this.infiniteInstanceList = new InstanceList(infinite);
        this.instanceList = new InstanceList(instances);
        this.rebuildAccel = true;
    }

    setLightList(lights:LightSource[]) {
        this.lightServer.setLights(lights);
    }

    setShaderOverride(shader:Shader, photonOverride:boolean) {
        this.lightServer.setShaderOverride(shader, photonOverride);
    }

    setBakingInstance(instance:Instance) {
        this.bakingInstance = instance;
    }

    getRadiance(istate:IntersectionState, rx:number, ry:number, lensU:number, lensV:number, time:number, instance:number):ShadingState {
        if ((this.bakingPrimitives == null)) {
            let r:Ray = this.camera.getRay(rx, ry, this.imageWidth, this.imageHeight, lensU, lensV, time);
            return (r != null);
            // TODO:Warning!!!, inline IF is not supported ?
        }
        else {
            let r:Ray = new Ray((rx / this.imageWidth), (ry / this.imageHeight), -1, 0, 0, 1);
            this.traceBake(r, istate);
            if (!istate.hit()) {
                return null;
            }

            let state:ShadingState = ShadingState.createState(istate, rx, ry, r, instance, this.lightServer);
            this.bakingPrimitives.prepareShadingState(state);
            if (this.bakingViewDependent) {
                state.setRay(this.camera.getRay(state.getPoint()));
            }
            else {
                let p:Point3 = state.getPoint();
                let n:Vector3 = state.getNormal();
                //  create a ray coming from directly above the point being
                //  shaded
                let incoming:Ray = new Ray((p.x + n.x), (p.y + n.y), (p.z + n.z), (n.x * -1), (n.y * -1), (n.z * -1));
                incoming.setMax(1);
                state.setRay(incoming);
            }

            this.lightServer.shadeBakeResult(state);
            return state;
        }

    }

    getBounds():BoundingBox {
        return this.instanceList.getWorldBounds(null);
    }

    trace(r:Ray, state:IntersectionState) {
        //  reset object
        state.instance = null;
        state.current = null;
        for (let i:number = 0; (i < this.infiniteInstanceList.getNumPrimitives()); i++) {
            this.infiniteInstanceList.intersectPrimitive(r, i, state);
        }

        //  reset for next accel structure
        state.current = null;
        this.intAccel.intersect(r, state);
    }

    traceShadow(r:Ray, state:IntersectionState):Color {
        this.trace(r, state);
        return state.hit();
        // TODO:Warning!!!, inline IF is not supported ?
    }

    traceBake(r:Ray, state:IntersectionState) {
        //  set the instance as if tracing a regular instanced object
        state.current = this.bakingInstance;
        //  reset object
        state.instance = null;
        this.bakingAccel.intersect(r, state);
    }

    render(options:Options, sampler:ImageSampler, display:Display) {
        if ((display == null)) {
            display = new FrameDisplay();
        }

        if ((this.bakingInstance != null)) {
            UI.printDetailed(Module.SCENE, "Creating primitives for lightmapping ...");
            this.bakingPrimitives = this.bakingInstance.getBakingPrimitives();
            if ((this.bakingPrimitives == null)) {
                console.error(Module.SCENE, "Lightmap baking is not supported for the given instance.");
                return;
            }

            let n:number = this.bakingPrimitives.getNumPrimitives();
            UI.printInfo(Module.SCENE, "Building acceleration structure for lightmapping (%d num primitives) ...", n);
            this.bakingAccel = AccelerationStructureFactory.create("auto", n, true);
            this.bakingAccel.build(this.bakingPrimitives);
        }
        else {
            this.bakingPrimitives = null;
            this.bakingAccel = null;
        }

        this.bakingViewDependent = options.getBoolean("baking.viewdep", this.bakingViewDependent);
        if ((((this.bakingInstance != null)
            && (this.bakingViewDependent
            && (this.camera == null)))
            || ((this.bakingInstance == null)
            && (this.camera == null)))) {
            console.error(Module.SCENE, "No camera found");
            return;
        }

        //  read from options
        this.threads = options.getInt("threads", 0);
        this.lowPriority = options.getBoolean("threads.lowPriority", true);
        this.imageWidth = options.getInt("resolutionX", 640);
        this.imageHeight = options.getInt("resolutionY", 480);
        //  limit resolution to 16k
        this.imageWidth = MathUtils.clamp(this.imageWidth, 1, (1 + 14));
        this.imageHeight = MathUtils.clamp(this.imageHeight, 1, (1 + 14));
        //  get acceleration structure info
        //  count scene primitives
        let numPrimitives:number = 0;
        for (let i:number = 0; (i < this.instanceList.getNumPrimitives()); i++) {
            numPrimitives = (numPrimitives + this.instanceList.getNumPrimitives(i));
        }

        UI.printInfo(Module.SCENE, "Scene stats:");
        UI.printInfo(Module.SCENE, "  * Infinite instances: %d", this.infiniteInstanceList.getNumPrimitives());
        UI.printInfo(Module.SCENE, "  * Instances:          %d", this.instanceList.getNumPrimitives());
        UI.printInfo(Module.SCENE, "  * Primitives:         %d", numPrimitives);
        let accelName:string = options.getString("accel", null);
        if ((accelName != null)) {
            this.rebuildAccel = (this.rebuildAccel
            || !this.acceltype.equals(accelName));
            this.acceltype = accelName;
        }

        UI.printInfo(Module.SCENE, "  * Instance accel:     %s", this.acceltype);
        if (this.rebuildAccel) {
            this.intAccel = AccelerationStructureFactory.create(this.acceltype, this.instanceList.getNumPrimitives(), false);
            this.intAccel.build(this.instanceList);
            this.rebuildAccel = false;
        }

        UI.printInfo(Module.SCENE, "  * Scene bounds:       %s", this.getBounds());
        UI.printInfo(Module.SCENE, "  * Scene center:       %s", this.getBounds().getCenter());
        UI.printInfo(Module.SCENE, "  * Scene diameter:     %.2f", this.getBounds().getExtents().length());
        UI.printInfo(Module.SCENE, "  * Lightmap bake:      %s", (this.bakingInstance != null));
        // TODO:Warning!!!, inline IF is not supported ?
        // TODO:Warning!!!, inline IF is not supported ?
        if ((sampler == null)) {
            return;
        }

        if (!this.lightServer.build(options)) {
            return;
        }

        //  render
        UI.printInfo(Module.SCENE, "Rendering ...");
        sampler.prepare(options, this, this.imageWidth, this.imageHeight);
        sampler.render(display);
        this.lightServer.showStats();
        //  discard baking tesselation/accel structure
        this.bakingPrimitives = null;
        this.bakingAccel = null;
        UI.printInfo(Module.SCENE, "Done.");
    }

    calculatePhotons(map:PhotonStore, type:string, seed:number):boolean {
        return this.lightServer.calculatePhotons(map, type, seed);
    }
}