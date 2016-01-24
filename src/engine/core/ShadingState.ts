/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ShadingState implements Iterable<LightSample> {

    private istate:IntersectionState;

    private server:LightServer;

    private rx:number;

    private ry:number;

    private result:Color;

    private p:Point3;

    private n:Vector3;

    private tex:Point2;

    private ng:Vector3;

    private basis:OrthoNormalBasis;

    private cosND:number;

    private behind:boolean;

    private hitU:number;

    private hitV:number;

    private instance:Instance;

    private primitiveID:number;

    private r:Ray;

    private d:number;

    //  quasi monte carlo instance variables
    private i:number;

    //  quasi monte carlo instance variables
    private qmcD0I:number;

    private qmcD1I:number;

    private shader:Shader;

    private modifier:Modifier;

    private diffuseDepth:number;

    private reflectionDepth:number;

    private refractionDepth:number;

    private includeLights:boolean;

    private includeSpecular:boolean;

    private lightSample:LightSample;

    private map:PhotonStore;

    static createPhotonState(r:Ray, istate:IntersectionState, i:number, map:PhotonStore, server:LightServer):ShadingState {
        let s:ShadingState = new ShadingState(null, this.istate, this.r, this.i, 4);
        s.server = this.server;
        s.map = this.map;
        return s;
    }

    static createState(istate:IntersectionState, rx:number, ry:number, r:Ray, i:number, server:LightServer):ShadingState {
        let s:ShadingState = new ShadingState(null, this.istate, this.r, this.i, 4);
        s.server = this.server;
        s.rx = this.rx;
        s.ry = this.ry;
        return s;
    }

    static createDiffuseBounceState(previous:ShadingState, r:Ray, i:number):ShadingState {
        let s:ShadingState = new ShadingState(previous, previous.istate, this.r, this.i, 2);
        s.diffuseDepth++;
        return s;
    }

    static createGlossyBounceState(previous:ShadingState, r:Ray, i:number):ShadingState {
        let s:ShadingState = new ShadingState(previous, previous.istate, this.r, this.i, 2);
        s.includeLights = false;
        s.includeSpecular = false;
        s.reflectionDepth++;
        return s;
    }

    static createReflectionBounceState(previous:ShadingState, r:Ray, i:number):ShadingState {
        let s:ShadingState = new ShadingState(previous, previous.istate, this.r, this.i, 2);
        s.reflectionDepth++;
        return s;
    }

    static createRefractionBounceState(previous:ShadingState, r:Ray, i:number):ShadingState {
        let s:ShadingState = new ShadingState(previous, previous.istate, this.r, this.i, 2);
        s.refractionDepth++;
        return s;
    }

    static createFinalGatherState(state:ShadingState, r:Ray, i:number):ShadingState {
        let finalGatherState:ShadingState = new ShadingState(state, state.istate, this.r, this.i, 2);
        finalGatherState.diffuseDepth++;
        finalGatherState.includeLights = false;
        finalGatherState.includeSpecular = false;
        return finalGatherState;
    }

    private constructor (previous:ShadingState, istate:IntersectionState, r:Ray, i:number, d:number) {
        this.r = this.r;
        this.istate = this.istate;
        this.i = this.i;
        this.d = this.d;
        this.instance = this.istate.instance;
        //  local copy
        this.primitiveID = this.istate.id;
        this.hitU = this.istate.u;
        this.hitV = this.istate.v;
        if ((previous == null)) {
            this.diffuseDepth = 0;
            this.reflectionDepth = 0;
            this.refractionDepth = 0;
        }
        else {
            this.diffuseDepth = previous.diffuseDepth;
            this.reflectionDepth = previous.reflectionDepth;
            this.refractionDepth = previous.refractionDepth;
            this.server = previous.server;
            this.map = previous.map;
            this.rx = previous.rx;
            this.ry = previous.ry;
            this.i = (this.i + previous.i);
            this.d = (this.d + previous.d);
        }

        this.behind = false;
        this.cosND = Float.NaN;
        this.includeSpecular = true;
        this.includeLights = true;
        this.qmcD0I = QMC.halton(this.d, this.i);
        this.qmcD1I = QMC.halton((this.d + 1), this.i);
        this.result = null;
    }

    setRay(r:Ray) {
        this.r = this.r;
    }

    init() {
        this.p = new Point3();
        this.n = new Vector3();
        this.tex = new Point2();
        this.ng = new Vector3();
        this.basis = null;
    }

    shade():Color {
        return this.server.shadeHit(this);
    }

    correctShadingNormal() {
        //  correct shading normals pointing the wrong way
        if ((Vector3.dot(this.n, this.ng) < 0)) {
            this.n.negate();
            this.basis.flipW();
        }

    }

    faceforward() {
        //  make sure we are on the right side of the material
        if ((this.r.dot(this.ng) < 0)) {

        }
        else {
            //  this ensure the ray and the geomtric normal are pointing in the
            //  same direction
            this.ng.negate();
            this.n.negate();
            this.basis.flipW();
            this.behind = true;
        }

        this.cosND = Math.max((this.r.dot(this.n) * -1), 0);
        //  can't be negative
        //  offset the shaded point away from the surface to prevent
        //  self-intersection errors
        this.p.x = (this.p.x + (0.001 * this.ng.x));
        this.p.y = (this.p.y + (0.001 * this.ng.y));
        this.p.z = (this.p.z + (0.001 * this.ng.z));
    }

    getRasterX():number {
        return this.rx;
    }

    getRasterY():number {
        return this.ry;
    }

    getCosND():number {
        return this.cosND;
    }

    isBehind():boolean {
        return this.behind;
    }

    getIntersectionState():IntersectionState {
        return this.istate;
    }

    getU():number {
        return this.hitU;
    }

    getV():number {
        return this.hitV;
    }

    getInstance():Instance {
        return this.instance;
    }

    getPrimitiveID():number {
        return this.primitiveID;
    }

    setResult(c:Color) {
        this.result = c;
    }

    getResult():Color {
        return this.result;
    }

    getLightServer():LightServer {
        return this.server;
    }

    addSample(sample:LightSample) {
        //  add to list
        sample.next = this.lightSample;
        this.lightSample = sample;
    }

    getRandom(j:number, dim:number):number {
        switch (dim) {
            case 0:
                return QMC.mod1((this.qmcD0I + QMC.halton(0, j)));
                break;
            case 1:
                return QMC.mod1((this.qmcD1I + QMC.halton(1, j)));
                break;
            default:
                return QMC.mod1((QMC.halton((this.d + dim), this.i) + QMC.halton(dim, j)));
                break;
        }

    }

    getRandom(j:number, dim:number, n:number):number {
        switch (dim) {
            case 0:
                return QMC.mod1((this.qmcD0I
                + ((<number>(j)) / (<number>(this.n)))));
                break;
            case 1:
                return QMC.mod1((this.qmcD1I + QMC.halton(0, j)));
                break;
            default:
                return QMC.mod1((QMC.halton((this.d + dim), this.i) + QMC.halton((dim - 1), j)));
                break;
        }

    }

    includeLights():boolean {
        return this.includeLights;
    }

    includeSpecular():boolean {
        return this.includeSpecular;
    }

    getShader():Shader {
        return this.shader;
    }

    setShader(shader:Shader) {
        this.shader = this.shader;
    }

    getModifier():Modifier {
        return this.modifier;
    }

    setModifier(modifier:Modifier) {
        this.modifier = this.modifier;
    }

    getDepth():number {
        return (this.diffuseDepth
        + (this.reflectionDepth + this.refractionDepth));
    }

    getDiffuseDepth():number {
        return this.diffuseDepth;
    }

    getReflectionDepth():number {
        return this.reflectionDepth;
    }

    getRefractionDepth():number {
        return this.refractionDepth;
    }

    getPoint():Point3 {
        return this.p;
    }

    getNormal():Vector3 {
        return this.n;
    }

    getUV():Point2 {
        return this.tex;
    }

    getGeoNormal():Vector3 {
        return this.ng;
    }

    getBasis():OrthoNormalBasis {
        return this.basis;
    }

    setBasis(basis:OrthoNormalBasis) {
        this.basis = this.basis;
    }

    getRay():Ray {
        return this.r;
    }

    getCameraToWorld():Matrix4 {
        let c:Camera = this.server.getScene().getCamera();
        return (c != null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getWorldToCamera():Matrix4 {
        let c:Camera = this.server.getScene().getCamera();
        return (c != null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getTrianglePoints(p:Point3[]):boolean {
        let prims:PrimitiveList = this.instance.getGeometry().getPrimitiveList();
        if ((prims instanceof  TriangleMesh)) {
            let m:TriangleMesh = (<TriangleMesh>(prims));
            m.getPoint(this.primitiveID, 0, p[0Unknown=newPoint3(Unknown);
            m.getPoint(this.primitiveID, 1, p[1Unknown=newPoint3(Unknown);
            m.getPoint(this.primitiveID, 2, p[2Unknown=newPoint3(Unknown);
            return true;
        }

        return false;
    }

    initLightSamples() {
        this.server.initLightSamples(this);
    }

    initCausticSamples() {
        this.server.initCausticSamples(this);
    }

    traceGlossy(r:Ray, i:number):Color {
        return this.server.traceGlossy(this, this.r, this.i);
    }

    traceReflection(r:Ray, i:number):Color {
        return this.server.traceReflection(this, this.r, this.i);
    }

    traceRefraction(r:Ray, i:number):Color {
        //  this assumes the refraction ray is pointing away from the normal
        this.r.ox = (this.r.ox - (0.002 * this.ng.x));
        this.r.oy = (this.r.oy - (0.002 * this.ng.y));
        this.r.oz = (this.r.oz - (0.002 * this.ng.z));
        return this.server.traceRefraction(this, this.r, this.i);
    }

    traceTransparency():Color {
        return this.traceRefraction(new Ray(this.p.x, this.p.y, this.p.z, this.r.dx, this.r.dy, this.r.dz), 0);
    }

    traceShadow(r:Ray):Color {
        return this.server.getScene().traceShadow(this.r, this.istate);
    }

    storePhoton(dir:Vector3, power:Color, diffuse:Color) {
        this.map.store(this, dir, power, diffuse);
    }

    traceReflectionPhoton(r:Ray, power:Color) {
        if (this.map.allowReflectionBounced()) {
            this.server.traceReflectionPhoton(this, this.r, power);
        }

    }

    traceRefractionPhoton(r:Ray, power:Color) {
        if (this.map.allowRefractionBounced()) {
            //  this assumes the refraction ray is pointing away from the normal
            this.r.ox = (this.r.ox - (0.002 * this.ng.x));
            this.r.oy = (this.r.oy - (0.002 * this.ng.y));
            this.r.oz = (this.r.oz - (0.002 * this.ng.z));
            this.server.traceRefractionPhoton(this, this.r, power);
        }

    }

    traceDiffusePhoton(r:Ray, power:Color) {
        if (this.map.allowDiffuseBounced()) {
            this.server.traceDiffusePhoton(this, this.r, power);
        }

    }

    getGlobalRadiance():Color {
        return this.server.getGlobalRadiance(this);
    }

    getIrradiance(diffuseReflectance:Color):Color {
        return this.server.getIrradiance(this, diffuseReflectance);
    }

    traceFinalGather(r:Ray, i:number):ShadingState {
        return this.server.traceFinalGather(this, this.r, this.i);
    }

    occlusion(samples:number, maxDist:number):Color {
        return this.occlusion(samples, maxDist, Color.WHITE, Color.BLACK);
    }

    occlusion(samples:number, maxDist:number, bright:Color, dark:Color):Color {
        if ((this.n == null)) {
            //  in case we got called on a geometry without orientation
            return bright;
        }

        //  make sure we are on the right side of the material
        this.faceforward();
        let onb:OrthoNormalBasis = this.getBasis();
        let w:Vector3 = new Vector3();
        let result:Color = Color.black();
        for (let i:number = 0; (this.i < samples); this.i++) {
            let xi:number = (<number>(this.getRandom(this.i, 0, samples)));
            let xj:number = (<number>(this.getRandom(this.i, 1, samples)));
            let phi:number = (<number>((2
            * (Math.PI * xi))));
            let cosPhi:number = (<number>(Math.cos(phi)));
            let sinPhi:number = (<number>(Math.sin(phi)));
            let sinTheta:number = (<number>(Math.sqrt(xj)));
            let cosTheta:number = (<number>(Math.sqrt((1 - xj))));
            w.x = (cosPhi * sinTheta);
            w.y = (sinPhi * sinTheta);
            w.z = cosTheta;
            onb.transform(w);
            let r:Ray = new Ray(this.p, w);
            this.r.setMax(maxDist);
            this.result.add(Color.blend(bright, dark, this.traceShadow(this.r)));
        }

        return this.result.mul((1 / samples));
    }

    diffuse(diff:Color):Color {
        //  integrate a diffuse function
        let lr:Color = Color.black();
        if (diff.isBlack()) {
            return lr;
        }

        for (let sample:LightSample in this) {
            lr.madd(sample.dot(this.n), sample.getDiffuseRadiance());
        }

        lr.add(this.getIrradiance(diff));
        return lr.mul(diff).mul((1 / (<number>(Math.PI))));
    }

    specularPhong(spec:Color, power:number, numRays:number):Color {
        //  integrate a phong specular function
        let lr:Color = Color.black();
        if ((!this.includeSpecular
            || spec.isBlack())) {
            return lr;
        }

        //  reflected direction
        let dn:number = (2 * this.cosND);
        let refDir:Vector3 = new Vector3();
        refDir.x = ((dn * this.n.x)
        + this.r.dx);
        refDir.y = ((dn * this.n.y)
        + this.r.dy);
        refDir.z = ((dn * this.n.z)
        + this.r.dz);
        //  direct lighting
        for (let sample:LightSample in this) {
            let cosNL:number = sample.dot(this.n);
            let cosLR:number = sample.dot(refDir);
            if ((cosLR > 0)) {
                lr.madd((cosNL * (<number>(Math.pow(cosLR, power)))), sample.getSpecularRadiance());
            }

        }

        //  indirect lighting
        if ((numRays > 0)) {
            let numSamples:number = (this.getDepth() == 0);
            // TODO:Warning!!!, inline IF is not supported ?
            let onb:OrthoNormalBasis = OrthoNormalBasis.makeFromW(refDir);
            let mul:number = ((2
            * ((<number>(Math.PI))
            / (power + 1)))
            / numSamples);
            for (let i:number = 0; (this.i < numSamples); this.i++) {
                //  specular indirect lighting
                let r1:number = this.getRandom(this.i, 0, numSamples);
                let r2:number = this.getRandom(this.i, 1, numSamples);
                let u:number = (2
                * (Math.PI * r1));
                let s:number = (<number>(Math.pow(r2, (1
                / (power + 1)))));
                let s1:number = (<number>(Math.sqrt((1
                - (s * s)))));
                let w:Vector3 = new Vector3((<number>((Math.cos(u) * s1))), (<number>((Math.sin(u) * s1))), (<number>(s)));
                w = onb.transform(w, new Vector3());
                let wn:number = Vector3.dot(w, this.n);
                if ((wn > 0)) {
                    lr.madd((wn * mul), this.traceGlossy(new Ray(this.p, w), this.i));
                }

            }

        }

        lr.mul(spec).mul(((power + 2) / (2 * (<number>(Math.PI)))));
        return lr;
    }

    iterator():Iterator<LightSample> {
        return new LightSampleIterator(this.lightSample);
    }

    class LightSampleIterator implements Iterator<LightSample> {

private current:LightSample;

    constructor (head:LightSample) {
        this.current = head;
    }

hasNext():boolean {
        return (this.current != null);
    }

next():LightSample {
        let c:LightSample = this.current;
        this.current = this.current.next;
        return c;
    }

remove() {
        throw new UnsupportedOperationException();
    }
}
}