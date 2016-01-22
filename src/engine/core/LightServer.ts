/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
class LightServer {

    //  parent
    private scene: Scene;

    //  lighting
    private lights: LightSource[];

    //  shading override
    private shaderOverride: Shader;

    private shaderOverridePhotons: boolean;

    //  direct illumination
    private maxDiffuseDepth: number;

    private maxReflectionDepth: number;

    private maxRefractionDepth: number;

    //  indirect illumination
    private causticPhotonMap: CausticPhotonMapInterface;

    private giEngine: GIEngine;

    private photonCounter: number;

    //  shading cache
    private shadingCache: CacheEntry[];

    private shadingCacheResolution: number;

    private cacheLookups: number;

    private cacheEmptyEntryMisses: number;

    private cacheWrongEntryMisses: number;

    private cacheEntryAdditions: number;

    private cacheHits: number;

    class CacheEntry {

    cx: number;

    cy: number;

    first: Sample;
}

class Sample {

    i: Instance;

    s: Shader;

    //  int prim;
    nx: number;

    ny: number;

    nz: number;

    c: Color;

    next: Sample;
}

constructor (scene: Scene) {
    this.scene = this.scene;
    this.lights = new Array(0);
    this.causticPhotonMap = null;
    this.shaderOverride = null;
    this.shaderOverridePhotons = false;
    this.maxDiffuseDepth = 1;
    this.maxReflectionDepth = 4;
    this.maxRefractionDepth = 4;
    this.causticPhotonMap = null;
    this.giEngine = null;
    this.shadingCache(0);
}

setLights(lights: LightSource[]) {
    this.lights = this.lights;
}

shadingCache(shadingRate: number) {
    this.shadingCache = (shadingRate > 0);
    // TODO: Warning!!!, inline IF is not supported ?
    this.shadingCacheResolution = (<number>((1 / Math.sqrt(shadingRate))));
}

getScene(): Scene {
    return this.scene;
}

setShaderOverride(shader: Shader, photonOverride: boolean) {
    this.shaderOverride = shader;
    this.shaderOverridePhotons = photonOverride;
}

build(options: Options): boolean {
    //  read options
    this.maxDiffuseDepth = options.getInt("depths.diffuse", this.maxDiffuseDepth);
    this.maxReflectionDepth = options.getInt("depths.reflection", this.maxReflectionDepth);
    this.maxRefractionDepth = options.getInt("depths.refraction", this.maxRefractionDepth);
    this.giEngine = GIEngineFactory.create(options);
    let caustics: String = options.getString("caustics", null);
    if (((caustics == null)
        || caustics.equals("none"))) {
        this.causticPhotonMap = null;
    }
    else if (((caustics != null)
        && caustics.equals("kd"))) {
        this.causticPhotonMap = new CausticPhotonMap(options);
    }
    else {
        UI.printWarning(Module.LIGHT, "Unrecognized caustics photon map engine \""%s\"" - ignoring", caustics);
        this.causticPhotonMap = null;
    }

    //  validate options
    this.maxDiffuseDepth = Math.max(0, this.maxDiffuseDepth);
    this.maxReflectionDepth = Math.max(0, this.maxReflectionDepth);
    this.maxRefractionDepth = Math.max(0, this.maxRefractionDepth);
    let t: Timer = new Timer();
    t.start();
    //  count total number of light samples
    let numLightSamples: number = 0;
    for (let i: number = 0; (i < this.lights.length); i++) {
        numLightSamples = (numLightSamples + this.lights[i].getNumSamples());
    }

    //  initialize gi engine
    if ((this.giEngine != null)) {
        if (!this.giEngine.init(this.scene)) {
            return false;
        }

    }

    if (!this.calculatePhotons(this.causticPhotonMap, "caustic", 0)) {
        return false;
    }

    t.end();
    this.cacheLookups = 0;
    this.cacheHits = 0;
    this.cacheEmptyEntryMisses = 0;
    this.cacheWrongEntryMisses = 0;
    this.cacheEntryAdditions = 0;
    if ((this.shadingCache != null)) {
        //  clear shading cache
        for (let i: number = 0; (i < this.shadingCache.length); i++) {
            this.shadingCache[i] = null;
        }

    }

    UI.printInfo(Module.LIGHT, "Light Server stats:");
    UI.printInfo(Module.LIGHT, "  * Light sources found: %d", this.lights.length);
    UI.printInfo(Module.LIGHT, "  * Light samples:       %d", numLightSamples);
    UI.printInfo(Module.LIGHT, "  * Max raytrace depth:");
    UI.printInfo(Module.LIGHT, "      - Diffuse          %d", this.maxDiffuseDepth);
    UI.printInfo(Module.LIGHT, "      - Reflection       %d", this.maxReflectionDepth);
    UI.printInfo(Module.LIGHT, "      - Refraction       %d", this.maxRefractionDepth);
    UI.printInfo(Module.LIGHT, "  * GI engine            %s", options.getString("gi.engine", "none"));
    UI.printInfo(Module.LIGHT, "  * Caustics:            %s", (caustics == null));
    // TODO: Warning!!!, inline IF is not supported ?
    UI.printInfo(Module.LIGHT, "  * Shader override:     %b", this.shaderOverride);
    UI.printInfo(Module.LIGHT, "  * Photon override:     %b", this.shaderOverridePhotons);
    UI.printInfo(Module.LIGHT, "  * Shading cache:       %s", (this.shadingCache == null));
    // TODO: Warning!!!, inline IF is not supported ?
    UI.printInfo(Module.LIGHT, "  * Build time:          %s", t.toString());
    return true;
}

showStats() {
    if ((this.shadingCache == null)) {
        return;
    }

    let numUsedEntries: number = 0;
    for (let e: CacheEntry in this.shadingCache) {
        numUsedEntries = (numUsedEntries
        + (e != null));
    }

    // TODO: Warning!!!, inline IF is not supported ?
    UI.printInfo(Module.LIGHT, "Shading cache stats:");
    UI.printInfo(Module.LIGHT, "  * Used entries:        %d (%d%%)", numUsedEntries, ((100 * numUsedEntries)
    / this.shadingCache.length));
    UI.printInfo(Module.LIGHT, "  * Lookups:             %d", this.cacheLookups);
    UI.printInfo(Module.LIGHT, "  * Hits:                %d", this.cacheHits);
    UI.printInfo(Module.LIGHT, "  * Hit rate:            %d%%", ((100 * this.cacheHits)
    / this.cacheLookups));
    UI.printInfo(Module.LIGHT, "  * Empty entry misses:  %d", this.cacheEmptyEntryMisses);
    UI.printInfo(Module.LIGHT, "  * Wrong entry misses:  %d", this.cacheWrongEntryMisses);
    UI.printInfo(Module.LIGHT, "  * Entry adds:          %d", this.cacheEntryAdditions);
}

calculatePhotons(map: PhotonStore, type: String, seed: number): boolean {
    if ((map == null)) {
        return true;
    }

    if ((this.lights.length == 0)) {
        UI.printError(Module.LIGHT, "Unable to trace %s photons, no lights in scene", type);
        return false;
    }

    let histogram: number[] = new Array(this.lights.length);
    histogram[0] = this.lights[0].getPower();
    for (let i: number = 1; (i < this.lights.length); i++) {
        histogram[i] = (histogram[(i - 1)] + this.lights[i].getPower());
    }

    UI.printInfo(Module.LIGHT, "Tracing %s photons ...", type);
    let numEmittedPhotons: number = map.numEmit();
    if (((numEmittedPhotons <= 0)
        || (histogram[(histogram.length - 1)] <= 0))) {
        UI.printError(Module.LIGHT, "Photon mapping enabled, but no %s photons to emit", type);
        return false;
    }

    map.prepare(this.scene.getBounds());
    UI.taskStart(("Tracing "
    + (type + " photons")), 0, numEmittedPhotons);
    let photonThreads: Thread[] = new Array(this.scene.getThreads());
    let scale: number = (1 / numEmittedPhotons);
    let delta: number = (numEmittedPhotons / photonThreads.length);
    this.photonCounter = 0;
    let photonTimer: Timer = new Timer();
    photonTimer.start();
    for (let i: number = 0; (i < photonThreads.length); i++) {
        let threadID: number = i;
        let start: number = (threadID * delta);
        let end: number = (threadID
        == (photonThreads.length - 1));
        // TODO: Warning!!!, inline IF is not supported ?
        photonThreads[i] = new Thread(new Runnable());
        photonThreads[i].setPriority(this.scene.getThreadPriority());
        photonThreads[i].start();
    }

    for (let i: number = 0; (i < photonThreads.length); i++) {
        try {
            photonThreads[i].join();
        }
        catch (e /*:InterruptedException*/) {
            UI.printError(Module.LIGHT, "Photon thread %d of %d was interrupted", (i + 1), photonThreads.length);
            return false;
        }

    }

    if (UI.taskCanceled()) {
        UI.taskStop();
        //  shut down task cleanly
        return false;
    }

    photonTimer.end();
    UI.taskStop();
    UI.printInfo(Module.LIGHT, "Tracing time for %s photons: %s", type, photonTimer.toString());
    map.init();
    return true;
}

shadePhoton(state: ShadingState, power: Color) {
    state.getInstance().prepareShadingState(state);
    let shader: Shader = this.getPhotonShader(state);
    //  scatter photon
    if ((shader != null)) {
        shader.scatterPhoton(state, power);
    }

}

traceDiffusePhoton(previous: ShadingState, r: Ray, power: Color) {
    if ((previous.getDiffuseDepth() >= this.maxDiffuseDepth)) {
        return;
    }

    let istate: IntersectionState = previous.getIntersectionState();
    this.scene.trace(r, istate);
    if (previous.getIntersectionState().hit()) {
        //  create a new shading context
        let state: ShadingState = ShadingState.createDiffuseBounceState(previous, r, 0);
        this.shadePhoton(state, power);
    }

}

traceReflectionPhoton(previous: ShadingState, r: Ray, power: Color) {
    if ((previous.getReflectionDepth() >= this.maxReflectionDepth)) {
        return;
    }

    let istate: IntersectionState = previous.getIntersectionState();
    this.scene.trace(r, istate);
    if (previous.getIntersectionState().hit()) {
        //  create a new shading context
        let state: ShadingState = ShadingState.createReflectionBounceState(previous, r, 0);
        this.shadePhoton(state, power);
    }

}

traceRefractionPhoton(previous: ShadingState, r: Ray, power: Color) {
    if ((previous.getRefractionDepth() >= this.maxRefractionDepth)) {
        return;
    }

    let istate: IntersectionState = previous.getIntersectionState();
    this.scene.trace(r, istate);
    if (previous.getIntersectionState().hit()) {
        //  create a new shading context
        let state: ShadingState = ShadingState.createRefractionBounceState(previous, r, 0);
        this.shadePhoton(state, power);
    }

}

private getShader(state: ShadingState): Shader {
    return (this.shaderOverride != null);
    // TODO: Warning!!!, inline IF is not supported ?
}

private getPhotonShader(state: ShadingState): Shader {
    return ((this.shaderOverride != null)
    && this.shaderOverridePhotons);
    // TODO: Warning!!!, inline IF is not supported ?
}

getRadiance(rx: number, ry: number, i: number, r: Ray, istate: IntersectionState): ShadingState {
    this.scene.trace(r, istate);
    if (istate.hit()) {
        let state: ShadingState = ShadingState.createState(istate, rx, ry, r, i, this);
        state.getInstance().prepareShadingState(state);
        let shader: Shader = this.getShader(state);
        if ((shader == null)) {
            state.setResult(Color.BLACK);
            return state;
        }

        if ((this.shadingCache != null)) {
            let c: Color = this.lookupShadingCache(state, shader);
            if ((c != null)) {
                state.setResult(c);
                return state;
            }

        }

        state.setResult(shader.getRadiance(state));
        if ((this.shadingCache != null)) {
            this.addShadingCache(state, shader, state.getResult());
        }

        return state;
    }
    else {
        return null;
    }

}

shadeBakeResult(state: ShadingState) {
    let shader: Shader = this.getShader(state);
    if ((shader != null)) {
        state.setResult(shader.getRadiance(state));
    }
    else {
        state.setResult(Color.BLACK);
    }

}

shadeHit(state: ShadingState): Color {
    state.getInstance().prepareShadingState(state);
    let shader: Shader = this.getShader(state);
    return (shader != null);
    // TODO: Warning!!!, inline IF is not supported ?
}

private static hash(x: number, y: number): number {
    //  long bits = java.lang.Double.doubleToLongBits(x);
    //  bits ^= java.lang.Double.doubleToLongBits(y) * 31;
    //  return (((int) bits) ^ ((int) (bits >> 32)));
    return (x | y);
    // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
}

private lookupShadingCache(state: ShadingState, shader: Shader): Color {
    if ((state.getNormal() == null)) {
        return null;
    }

    this.cacheLookups++;
    let cx: number = (<number>((state.getRasterX() * this.shadingCacheResolution)));
    let cy: number = (<number>((state.getRasterY() * this.shadingCacheResolution)));
    let hash: number = LightServer.hash(cx, cy);
    let e: CacheEntry = this.shadingCache[(hash
    & (this.shadingCache.length - 1))];
    if ((e == null)) {
        this.cacheEmptyEntryMisses++;
        return null;
    }

    //  entry maps to correct pixel
    if (((e.cx == cx)
        && (e.cy == cy))) {
        //  search further
        for (let s: Sample = e.first; (s != null); s = s.next) {
            if ((s.i != state.getInstance())) {
                // TODO: Warning!!! continue If
            }

            //  if (s.prim != state.getPrimitiveID())
            //  continue;
            if ((s.s != shader)) {
                // TODO: Warning!!! continue If
            }

            if ((state.getNormal().dot(s.nx, s.ny, s.nz) < 0.95)) {
                // TODO: Warning!!! continue If
            }

            //  we have a match
            this.cacheHits++;
            return s.c;
        }

    }
    else {
        this.cacheWrongEntryMisses++;
    }

    return null;
}

private addShadingCache(state: ShadingState, shader: Shader, c: Color) {
    //  don't cache samples with null normals
    if ((state.getNormal() == null)) {
        return;
    }

    this.cacheEntryAdditions++;
    let cx: number = (<number>((state.getRasterX() * this.shadingCacheResolution)));
    let cy: number = (<number>((state.getRasterY() * this.shadingCacheResolution)));
    let h: number = (LightServer.hash(cx, cy)
    & (this.shadingCache.length - 1));
    let e: CacheEntry = this.shadingCache[h];
    //  new entry ?
    if ((e == null)) {
        this.shadingCache[h] = new CacheEntry();
    }

    e = new CacheEntry();
    let s: Sample = new Sample();
    s.i = state.getInstance();
    //  s.prim = state.getPrimitiveID();
    s.s = shader;
    s.c = c;
    s.nx = state.getNormal().x;
    s.ny = state.getNormal().y;
    s.nz = state.getNormal().z;
    if (((e.cx == cx)
        && (e.cy == cy))) {
        //  same pixel - just add to the front of the list
        s.next = e.first;
        e.first = s;
    }
    else {
        //  different pixel - new list
        e.cx = cx;
        e.cy = cy;
        s.next = null;
        e.first = s;
    }

}

traceGlossy(previous: ShadingState, r: Ray, i: number): Color {
    //  limit path depth and disable caustic paths
    if (((previous.getReflectionDepth() >= this.maxReflectionDepth)
        || (previous.getDiffuseDepth() > 0))) {
        return Color.BLACK;
    }

    let istate: IntersectionState = previous.getIntersectionState();
    this.scene.trace(r, istate);
    return istate.hit();
    // TODO: Warning!!!, inline IF is not supported ?
}

traceReflection(previous: ShadingState, r: Ray, i: number): Color {
    //  limit path depth and disable caustic paths
    if (((previous.getReflectionDepth() >= this.maxReflectionDepth)
        || (previous.getDiffuseDepth() > 0))) {
        return Color.BLACK;
    }

    let istate: IntersectionState = previous.getIntersectionState();
    this.scene.trace(r, istate);
    return istate.hit();
    // TODO: Warning!!!, inline IF is not supported ?
}

traceRefraction(previous: ShadingState, r: Ray, i: number): Color {
    //  limit path depth and disable caustic paths
    if (((previous.getRefractionDepth() >= this.maxRefractionDepth)
        || (previous.getDiffuseDepth() > 0))) {
        return Color.BLACK;
    }

    let istate: IntersectionState = previous.getIntersectionState();
    this.scene.trace(r, istate);
    return istate.hit();
    // TODO: Warning!!!, inline IF is not supported ?
}

traceFinalGather(previous: ShadingState, r: Ray, i: number): ShadingState {
    if ((previous.getDiffuseDepth() >= this.maxDiffuseDepth)) {
        return null;
    }

    let istate: IntersectionState = previous.getIntersectionState();
    this.scene.trace(r, istate);
    return istate.hit();
    // TODO: Warning!!!, inline IF is not supported ?
}

getGlobalRadiance(state: ShadingState): Color {
    if ((this.giEngine == null)) {
        return Color.BLACK;
    }

    return this.giEngine.getGlobalRadiance(state);
}

getIrradiance(state: ShadingState, diffuseReflectance: Color): Color {
    //  no gi engine, or we have already exceeded number of available bounces
    if (((this.giEngine == null)
        || (state.getDiffuseDepth() >= this.maxDiffuseDepth))) {
        return Color.BLACK;
    }

    return this.giEngine.getIrradiance(state, diffuseReflectance);
}

initLightSamples(state: ShadingState) {
    for (let l: LightSource in this.lights) {
        l.getSamples(state);
    }

}

initCausticSamples(state: ShadingState) {
    if ((this.causticPhotonMap != null)) {
        this.causticPhotonMap.getSamples(state);
    }

}
}