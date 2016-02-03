import {GridPhotonMap} from "../photomap/GridPhotonMap";
import {GlobalPhotonMap} from "../photomap/GlobalPhotonMap";
import {Color} from "../../math/Color";
import {Vector3} from "../../math/Vector3";
import {Point3} from "../../math/Point3";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
class Node {

    children:Node[];
    first:Sample;
    center:Point3;
    sideLength:number;
    halfSideLength:number;
    quadSideLength:number;

    constructor (center:Point3, sideLength:number) {
        this.children = new Array(8);
        for (let i:number = 0; (i < 8); i++) {
            this.children[i] = null;
        }

        this.center = new Point3(this.center);
        this.sideLength = sideLength;
        this.halfSideLength = (0.5 * this.sideLength);
        this.quadSideLength = (0.5 * this.halfSideLength);
        this.first = null;
    }

    isInside(p:Point3):boolean {
        return ((Math.abs((p.x - this.center.x)) < this.halfSideLength)
        && ((Math.abs((p.y - this.center.y)) < this.halfSideLength)
        && (Math.abs((p.z - this.center.z)) < this.halfSideLength)));
    }

    find(x:Sample):number {
        let weight:number = 0;
        for (let s:Sample = this.first; (s != null); s = s.next) {
            let c2:number = (1
            - ((x.nix * s.nix)
            + ((x.niy * s.niy)
            + (x.niz * s.niz))));
            let d2:number = (((x.pix - s.pix)
            * (x.pix - s.pix))
            + (((x.piy - s.piy)
            * (x.piy - s.piy))
            + ((x.piz - s.piz)
            * (x.piz - s.piz))));
            if (((c2
                > (tolerance * tolerance))
                || (d2
                > (maxSpacing * maxSpacing)))) {
                // TODO:Warning!!! continue If
            }

            let invWi:number = (<number>(((Math.sqrt(d2) * s.invR0)
            + Math.sqrt(Math.max(c2, 0)))));
            if (((invWi < tolerance)
                || (d2
                < (minSpacing * minSpacing)))) {
                let wi:number = Math.min(1E+10, (1 / invWi));
                if ((x.irr != null)) {
                    x.irr.madd(wi, s.irr);
                }
                else {
                    x.irr = s.irr.copy().mul(wi);
                }

                weight = (weight + wi);
            }

        }

        for (let i:number = 0; (i < 8); i++) {
            if (((this.children[i] != null)
                && ((Math.abs((this.children[i].center.x - x.pix)) <= this.halfSideLength)
                && ((Math.abs((this.children[i].center.y - x.piy)) <= this.halfSideLength)
                && (Math.abs((this.children[i].center.z - x.piz)) <= this.halfSideLength))))) {
                weight = (weight + this.children[i].find(x));
            }

        }

        return weight;
    }
}

class Sample {

    pix:number;

    piy:number;

    piz:number;

    nix:number;

    niy:number;

    niz:number;

    invR0:number;

    irr:Color;

    next:Sample;

    constructor (p:Point3, n:Vector3) {
        this.pix = p.x;
        this.piy = p.y;
        this.piz = p.z;
        let ni:Vector3 = (new Vector3(n) + normalize());
        this.nix = ni.x;
        this.niy = ni.y;
        this.niz = ni.z;
        this.irr = null;
        this.next = null;
    }

    constructor (p:Point3, n:Vector3, r0:number, irr:Color) {
        this.pix = p.x;
        this.piy = p.y;
        this.piz = p.z;
        let ni:Vector3 = (new Vector3(n) + normalize());
        this.nix = ni.x;
        this.niy = ni.y;
        this.niz = ni.z;
        this.invR0 = (1 / r0);
        this.irr = this.irr;
        this.next = null;
    }
}
export class IrradianceCacheGIEngine implements GIEngine {

    private samples:number;

    private tolerance:number;

    private invTolerance:number;

    private minSpacing:number;

    private maxSpacing:number;

    private root:Node;

    private rwl:ReentrantReadWriteLock;

    private globalPhotonMap:GlobalPhotonMapInterface;

    constructor (options:Options) {
        this.samples = options.getInt("gi.irr-cache.samples", 256);
        this.tolerance = options.getFloat("gi.irr-cache.tolerance", 0.05);
        this.invTolerance = (1 / this.tolerance);
        this.minSpacing = options.getFloat("gi.irr-cache.min_spacing", 0.05);
        this.maxSpacing = options.getFloat("gi.irr-cache.max_spacing", 5);
        this.root = null;
        this.rwl = new ReentrantReadWriteLock();
        this.globalPhotonMap = null;
        let gmap:string = options.getString("gi.irr-cache.gmap", null);
        if (((gmap == null)
            || gmap.equals("none"))) {
            return;
        }

        let numEmit:number = options.getInt("gi.irr-cache.gmap.emit", 100000);
        let gather:number = options.getInt("gi.irr-cache.gmap.gather", 50);
        let radius:number = options.getFloat("gi.irr-cache.gmap.radius", 0.5);
        if (gmap.equals("kd")) {
            this.globalPhotonMap = new GlobalPhotonMap(numEmit, gather, radius);
        }
        else if (gmap.equals("grid")) {
            this.globalPhotonMap = new GridPhotonMap(numEmit, gather, radius);
        }
        else {
            console.warn(Module.LIGHT, "Unrecognized global photon map type \""+gmap+"\" - ignoring");
        }

    }

    init(scene:Scene):boolean {
        //  check settings
        this.samples = Math.max(0, this.samples);
        this.minSpacing = Math.max(0.001, this.minSpacing);
        this.maxSpacing = Math.max(0.001, this.maxSpacing);
        //  display settings
        UI.printInfo(Module.LIGHT, "Irradiance cache settings:");
        UI.printInfo(Module.LIGHT, "  * Samples:%d", this.samples);
        if ((this.tolerance <= 0)) {
            UI.printInfo(Module.LIGHT, "  * Tolerance:off");
        }
        else {
            UI.printInfo(Module.LIGHT, "  * Tolerance:%.3f", this.tolerance);
        }

        UI.printInfo(Module.LIGHT, "  * Spacing:%.3f to %.3f", this.minSpacing, this.maxSpacing);
        //  prepare root node
        let ext:Vector3 = scene.getBounds().getExtents();
        this.root = new Node(scene.getBounds().getCenter(), (1.0001 * MathUtils.max(ext.x, ext.y, ext.z)));
        //  init global photon map
        return (this.globalPhotonMap != null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getGlobalRadiance(state:ShadingState):Color {
        if ((this.globalPhotonMap == null)) {
            if ((state.getShader() != null)) {
                return state.getShader().getRadiance(state);
            }
            else {
                return Color.BLACK;
            }

        }
        else {
            return this.globalPhotonMap.getRadiance(state.getPoint(), state.getNormal());
        }

    }

    getIrradiance(state:ShadingState, diffuseReflectance:Color):Color {
        if ((this.samples <= 0)) {
            return Color.BLACK;
        }

        if ((state.getDiffuseDepth() > 0)) {
            //  do simple path tracing for additional bounces (single ray)
            let xi:number = (<number>(state.getRandom(0, 0, 1)));
            let xj:number = (<number>(state.getRandom(0, 1, 1)));
            let phi:number = (<number>((xi * (2 * Math.PI))));
            let cosPhi:number = (<number>(Math.cos(phi)));
            let sinPhi:number = (<number>(Math.sin(phi)));
            let sinTheta:number = (<number>(Math.sqrt(xj)));
            let cosTheta:number = (<number>(Math.sqrt((1 - xj))));
            let w:Vector3 = new Vector3();
            w.x = (cosPhi * sinTheta);
            w.y = (sinPhi * sinTheta);
            w.z = cosTheta;
            let onb:OrthoNormalBasis = state.getBasis();
            onb.transform(w);
            let r:Ray = new Ray(state.getPoint(), w);
            let temp:ShadingState = state.traceFinalGather(r, 0);
            return (temp != null);
            // TODO:Warning!!!, inline IF is not supported ?
        }

        this.rwl.readLock().lock();
        let irr:Color = this.getIrradiance(state.getPoint(), state.getNormal());
        this.rwl.readLock().unlock();
        if ((irr == null)) {
            //  compute new sample
            irr = Color.black();
            let onb:OrthoNormalBasis = state.getBasis();
            let invR:number = 0;
            let minR:number = Float.POSITIVE_INFINITY;
            let w:Vector3 = new Vector3();
            for (let i:number = 0; (i < this.samples); i++) {
                let xi:number = (<number>(state.getRandom(i, 0, this.samples)));
                let xj:number = (<number>(state.getRandom(i, 1, this.samples)));
                let phi:number = (<number>((xi * (2 * Math.PI))));
                let cosPhi:number = (<number>(Math.cos(phi)));
                let sinPhi:number = (<number>(Math.sin(phi)));
                let sinTheta:number = (<number>(Math.sqrt(xj)));
                let cosTheta:number = (<number>(Math.sqrt((1 - xj))));
                w.x = (cosPhi * sinTheta);
                w.y = (sinPhi * sinTheta);
                w.z = cosTheta;
                onb.transform(w);
                let r:Ray = new Ray(state.getPoint(), w);
                let temp:ShadingState = state.traceFinalGather(r, i);
                if ((temp != null)) {
                    minR = Math.min(r.getMax(), minR);
                    invR = (invR + (1 / r.getMax()));
                    temp.getInstance().prepareShadingState(temp);
                    irr.add(this.getGlobalRadiance(temp));
                }

            }

            irr.mul(((<number>(Math.PI)) / this.samples));
            invR = (this.samples / invR);
            this.rwl.writeLock().lock();
            this.insert(state.getPoint(), state.getNormal(), invR, irr);
            this.rwl.writeLock().unlock();
            //  view irr-cache points
            //  irr = Color.YELLOW.copy().mul(1e6f);
        }

        return irr;
    }

    private insert(p:Point3, n:Vector3, r0:number, irr:Color) {
        if ((this.tolerance <= 0)) {
            return;
        }

        let node:Node = this.root;
        r0 = (MathUtils.clamp((r0 * this.tolerance), this.minSpacing, this.maxSpacing) * this.invTolerance);
        if (this.root.isInside(p)) {
            while ((node.sideLength >= (4
            * (r0 * this.tolerance)))) {
                let k:number = 0;
                k = (k
                | (p.x > node.center.x));
                // TODO:Warning!!!, inline IF is not supported ?
                k = (k
                | (p.y > node.center.y));
                // TODO:Warning!!!, inline IF is not supported ?
                k = (k
                | (p.z > node.center.z));
                // TODO:Warning!!!, inline IF is not supported ?
                if ((node.children[k] == null)) {
                    let c:Point3 = new Point3(node.center);
                    c.x = (c.x
                    + ((k & 1)
                    == 0));
                    // TODO:Warning!!!, inline IF is not supported ?
                    c.y = (c.y
                    + ((k & 2)
                    == 0));
                    // TODO:Warning!!!, inline IF is not supported ?
                    c.z = (c.z
                    + ((k & 4)
                    == 0));
                    // TODO:Warning!!!, inline IF is not supported ?
                    node.children[k] = new Node(c, node.halfSideLength);
                }

                node = node.children[k];
            }

        }

        let s:Sample = new Sample(p, n, r0, irr);
        s.next = node.first;
        node.first = s;
    }

    private getIrradiance(p:Point3, n:Vector3):Color {
        if ((this.tolerance <= 0)) {
            return null;
        }

        let x:Sample = new Sample(p, n);
        let w:number = this.root.find(x);
        return (x.irr == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }
}