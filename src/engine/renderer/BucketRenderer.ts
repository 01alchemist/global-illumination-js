///<reference path="worker/TraceWorkerManager.ts"/>
import {Camera} from "../scene/Camera";
import {Scene} from "../scene/Scene";
import {Color} from "../math/Color";
import {RGBA} from "../math/Color";
import {Ray} from "../math/Ray";
import {TraceWorkerManager} from "./worker/TraceWorkerManager";
import {SharedScene} from "../scene/SharedScene";
import {MathUtils} from "../utils/MathUtils";
import {IBucketOrder} from "./bucket/IBucketOrder";
import {IFilter} from "./filter/IFilter";
import {QMC} from "../math/QMC";
import {BucketOrderFactory} from "./bucket/BucketOrderFactory";
import {FilterFactory} from "./filter/FilterFactory";
import {BoxFilter} from "./filter/BoxFilter";
import {IDisplay} from "../display/IDisplay";
import {BucketThread} from "./worker/BucketThread";
import {Thread} from "./worker/Thread";
/**
 * Created by Nidin Vinayakan on 10-01-2016.
 */
export class BucketRenderer {

    static DEBUG:boolean = false;

    private scene:SharedScene;
    private display:IDisplay;
    // resolution
    private imageWidth:number;
    private imageHeight:number;
    // bucketing
    private bucketOrderName:string;
    private bucketOrder:IBucketOrder;
    private bucketSize:number;
    private bucketCounter:number;
    private bucketCoords:number[];
    private dumpBuckets:boolean;

    // anti-aliasing
    private minAADepth:number;
    private maxAADepth:number;
    private superSampling:number;
    private contrastThreshold:number;
    private jitter:boolean;
    private displayAA:boolean;

    // derived quantities
    private invSuperSampling:number;
    private subPixelSize:number;
    private minStepSize:number;
    private maxStepSize:number;
    private sigma:Int32Array;
    private thresh:number;
    private useJitter:boolean;

    // filtering
    private filterName:string;
    private filter:IFilter;
    private fs:number;
    private fhs:number;

    workerManager:TraceWorkerManager;

    constructor(bucketSize:number = 32,
                bucketOrderName:string = "hilbert",
                displayAA:boolean = false,
                contrastThreshold:number = 0.1,
                filterName:string = "box",
                jitter:boolean = false) {

        this.bucketSize = bucketSize;
        this.bucketOrderName = bucketOrderName;
        this.displayAA = displayAA;
        this.contrastThreshold = contrastThreshold;
        this.filterName = filterName;
        this.jitter = jitter;
        this.workerManager = new TraceWorkerManager();
    }

    public prepare(options:any, scene:SharedScene, w:number, h:number):boolean {
        this.scene = scene;
        this.imageWidth = w;
        this.imageHeight = h;

        // fetch options
        this.bucketSize = options.bucketSize;
        this.bucketOrderName = options.bucketOrderName;
        this.minAADepth = options.minAADepth;
        this.maxAADepth = options.maxAADepth;
        this.superSampling = options.superSampling;
        this.displayAA = options.displayAA;
        this.jitter = options.jitter;
        this.contrastThreshold = options.contrastThreshold;

        // limit bucket size and compute number of buckets in each direction
        this.bucketSize = MathUtils.clamp(this.bucketSize, 16, 512);
        var numBucketsX:number = (this.imageWidth + this.bucketSize - 1) / this.bucketSize;
        var numBucketsY:number = (this.imageHeight + this.bucketSize - 1) / this.bucketSize;
        this.bucketOrder = BucketOrderFactory.create(this.bucketOrderName);
        this.bucketCoords = this.bucketOrder.getBucketSequence(numBucketsX, numBucketsY);
        // validate AA options
        this.minAADepth = MathUtils.clamp(this.minAADepth, -4, 5);
        this.maxAADepth = MathUtils.clamp(this.maxAADepth, this.minAADepth, 5);
        this.superSampling = MathUtils.clamp(this.superSampling, 1, 256);
        this.invSuperSampling = 1.0 / this.superSampling;
        // compute AA stepping sizes
        this.subPixelSize = (this.maxAADepth > 0) ? (1 << this.maxAADepth) : 1;
        this.minStepSize = this.maxAADepth >= 0 ? 1 : 1 << (-this.maxAADepth);
        if (this.minAADepth == this.maxAADepth)
            this.maxStepSize = this.minStepSize;
        else
            this.maxStepSize = this.minAADepth > 0 ? 1 << this.minAADepth : this.subPixelSize << (-this.minAADepth);
        this.useJitter = this.jitter && this.maxAADepth > 0;
        // compute anti-aliasing contrast thresholds
        this.contrastThreshold = MathUtils.clamp(this.contrastThreshold, 0, 1);
        this.thresh = this.contrastThreshold * Math.pow(2.0, this.minAADepth);
        // read filter settings from scene
        this.filterName = options.filterName;
        this.filter = FilterFactory.get(this.filterName);
        // adjust filter
        if (this.filter == null) {
            console.log("Unrecognized filter type: " + this.filterName + " - defaulting to box");
            this.filter = new BoxFilter(1);
            this.filterName = "box";
        }
        this.fhs = this.filter.getSize() * 0.5;
        this.fs = Math.ceil(this.subPixelSize * (this.fhs - 0.5));

        // prepare QMC sampling
        this.sigma = QMC.generateSigmaTable(this.subPixelSize << 7);
        console.log("BCKT   info:  Bucket renderer settings:");
        console.log("BCKT   info:    * Resolution:         " + this.imageWidth + "x" + this.imageHeight);
        console.log("BCKT   info:    * Bucket size:        " + this.bucketSize);
        console.log("BCKT   info:    * Number of buckets:  " + numBucketsX + "x" + numBucketsY);
        if (this.minAADepth != this.maxAADepth)
            console.log("BCKT   info:    * Anti-aliasing:      " + this.aaDepthToString(this.minAADepth) + " -> " + this.aaDepthToString(this.maxAADepth) + " (adaptive)");
        else
            console.log("BCKT   info:    * Anti-aliasing:      " + this.aaDepthToString(this.minAADepth) + " (fixed)");
        console.log("BCKT   info:    * Rays per sample:    " + this.superSampling);
        console.log("BCKT   info:    * Subpixel jitter:    " + this.useJitter ? "on" : (this.jitter ? "auto-off" : "off"));
        console.log("BCKT   info:    * Contrast threshold: " + this.contrastThreshold.toFixed(2));
        console.log("BCKT   info:    * Filter type:        " + this.filterName);
        console.log("BCKT   info:    * Filter size:        " + this.filter.getSize() + " pixels");
        return true;
    }

    private aaDepthToString(depth:number):string {
        var pixelAA:number = (depth) < 0 ? -(1 << (-depth)) : (1 << depth);
        return (depth < 0 ? "1/" : "")+(pixelAA * pixelAA)+" sample"+(depth == 0 ? "" : "s");
    }

    render(display:IDisplay):void{
        this.display = display;
        display.imageBegin(this.imageWidth, this.imageHeight, this.bucketSize);
        // set members variables
        this.bucketCounter = 0;
        // start task
        console.time("Rendering");
        console.log("bucketCoords:"+this.bucketCoords.length);
        var renderThreads:Thread[] = new Thread[scene.getThreads()];
        for (var i = 0; i < renderThreads.length; i++) {
            renderThreads[i] = new BucketThread(i);
            renderThreads[i].setPriority(scene.getThreadPriority());
            renderThreads[i].start();
        }
        for (var i = 0; i < renderThreads.length; i++) {
            try {
                renderThreads[i].join();
            } catch (e) {
                console.log("Bucket processing thread "+(i + 1)+" of "+renderThreads.length+" was interrupted");
            }
        }

        console.timeEnd("Rendering");
        display.imageEnd();
    }

    private renderBucket(display:IDisplay, bx:number, by:number, threadID:number, istate:IntersectionState):void{
        // pixel sized extents
        var x0:number = bx * this.bucketSize;
        var y0:number = by * this.bucketSize;
        var bw:number = Math.min(this.bucketSize, this.imageWidth - x0);
        var bh:number = Math.min(this.bucketSize, this.imageHeight - y0);

        // prepare bucket
        display.imagePrepare(x0, y0, bw, bh, threadID);

        var bucketRGB:Color[] = [];//new Color[bw * bh];

        // subpixel extents
        var sx0:number = x0 * this.subPixelSize - this.fs;
        var sy0:number = y0 * this.subPixelSize - this.fs;
        var sbw:number = bw * this.subPixelSize + this.fs * 2;
        var sbh:number = bh * this.subPixelSize + this.fs * 2;

        // round up to align with maximum step size
        sbw = (sbw + (this.maxStepSize - 1)) & (~(this.maxStepSize - 1));
        sbh = (sbh + (this.maxStepSize - 1)) & (~(this.maxStepSize - 1));
        // extra padding as needed
        if (this.maxStepSize > 1) {
            sbw++;
            sbh++;
        }
        // allocate bucket memory
        var samples:ImageSample[] = [];//new ImageSample[sbw * sbh];
        // allocate samples and compute jitter offsets
        var invSubPixelSize:number = 1.0 / this.subPixelSize;
        for (var y:number = 0, index = 0; y < sbh; y++) {
            for (var x:number = 0; x < sbw; x++, index++) {
                var sx:number = sx0 + x;
                var sy:number = sy0 + y;
                var j:number = sx & (this.sigma.length - 1);
                var k:number = sy & (this.sigma.length - 1);
                var i:number = j * this.sigma.length + this.sigma[k];
                var dx:number = this.useJitter ? this.sigma[k] / this.sigma.length : 0.5;
                var dy:number = this.useJitter ? this.sigma[j] / this.sigma.length : 0.5;
                var rx:number = (sx + dx) * this.invSubPixelSize;
                var ry:number = (sy + dy) * this.invSubPixelSize;
                ry = this.imageHeight - ry - 1;
                this.samples[index] = new ImageSample(rx, ry, i);
            }
        }
        for (var x = 0; x < sbw - 1; x += this.maxStepSize) {
            for (var y = 0; y < sbh - 1; y += this.maxStepSize) {
                this.refineSamples(samples, sbw, x, y, this.maxStepSize, this.thresh, istate);
            }
        }
        if (this.dumpBuckets) {
            console.log("Dumping bucket ["+bx+", "+by+"] to file ...");
            var bitmap:Bitmap = new Bitmap(sbw, sbh, true);
            for (var y:number = sbh - 1, index:number = 0; y >= 0; y--) {
                for (var x:number = 0; x < sbw; x++, index++) {
                    bitmap.setPixel(x, y, samples[index].c.copy().toNonLinear());
                }
            }
            bitmap.save("bucket_"+bx+"_"+by+".png");
        }
        if (this.displayAA) {
            // color coded image of what is visible
            var invArea:number = invSubPixelSize * invSubPixelSize;
            for (var y:number = 0, index:number = 0; y < bh; y++) {
                for (var x:number = 0; x < bw; x++, index++) {
                    var sampled:number = 0;
                    for (var i:number = 0; i < this.subPixelSize; i++) {
                        for (var j:number = 0; j < this.subPixelSize; j++) {
                            var sx:number = x * this.subPixelSize + fs + i;
                            var sy:number = y * this.subPixelSize + fs + j;
                            var s:number = sx + sy * sbw;
                            sampled += samples[s].sampled() ? 1 : 0;
                        }
                    }
                    bucketRGB[index] = new Color(sampled * invArea);
                }
            }
        } else {
            // filter samples into pixels
            var cy:number = this.imageHeight - 1 - (y0 + 0.5);
            for (var y:number = 0, index:number = 0; y < bh; y++, cy--) {
                var cx:number = x0 + 0.5;
                for (var x:number = 0; x < bw; x++, index++, cx++) {
                    var c:Color = Color.black();
                    var weight:number = 0.0;
                    for (var j:number = -fs, sy = y * subPixelSize; j <= fs; j++, sy++) {
                        for (var i:number = -fs, sx = x * subPixelSize, s = sx + sy * sbw; i <= fs; i++, sx++, s++) {
                            var dx:number = samples[s].rx - cx;
                            if (Math.abs(dx) > fhs) {
                                continue;
                            }
                            var dy:number = samples[s].ry - cy;
                            if (Math.abs(dy) > fhs) {
                                continue;
                            }
                            var f:number = filter.get(dx, dy);
                            c.madd(f, samples[s].c);
                            weight += f;
                        }
                    }
                    c.mul(1.0 / weight);
                    bucketRGB[index] = c;
                }
            }
        }
        // update pixels
        display.imageUpdate(x0, y0, bw, bh, bucketRGB);
    }

private computeSubPixel(sample:ImageSample, istate:IntersectionState):void{
    var x = sample.rx;//float
    var y = sample.ry;//float
    var q0 = QMC.halton(1, sample.i);//double
    var q1 = QMC.halton(2, sample.i);//double
    var q2 = QMC.halton(3, sample.i);//double
    if (superSampling > 1) {
        // multiple sampling
        sample.add(scene.getRadiance(istate, x, y, q1, q2, q0, sample.i));
        for (var i = 1; i < superSampling; i++) {
            var time = QMC.mod1(q0 + i * invSuperSampling);//double
            var lensU = QMC.mod1(q1 + QMC.halton(0, i));//double
            var lensV = QMC.mod1(q2 + QMC.halton(1, i));//double
            sample.add(scene.getRadiance(istate, x, y, lensU, lensV, time, sample.i + i));
        }
        sample.scale(invSuperSampling);
    } else {
        // single sample
        sample.set(scene.getRadiance(istate, x, y, q1, q2, q0, sample.i));
    }
}

private void refineSamples(ImageSample[] samples, int sbw, int x, int y, int stepSize, float thresh, IntersectionState istate) {
    var dx = stepSize;
    var dy = stepSize * sbw;
    var i00 = x + y * sbw;
    ImageSample s00 = samples[i00];
    ImageSample s01 = samples[i00 + dy];
    ImageSample s10 = samples[i00 + dx];
    ImageSample s11 = samples[i00 + dx + dy];
    if (!s00.sampled())
        computeSubPixel(s00, istate);
    if (!s01.sampled())
        computeSubPixel(s01, istate);
    if (!s10.sampled())
        computeSubPixel(s10, istate);
    if (!s11.sampled())
        computeSubPixel(s11, istate);
    if (stepSize > minStepSize) {
        if (s00.isDifferent(s01, thresh) || s00.isDifferent(s10, thresh) || s00.isDifferent(s11, thresh) || s01.isDifferent(s11, thresh) || s10.isDifferent(s11, thresh) || s01.isDifferent(s10, thresh)) {
            stepSize >>= 1;
            thresh *= 2;
            refineSamples(samples, sbw, x, y, stepSize, thresh, istate);
            refineSamples(samples, sbw, x + stepSize, y, stepSize, thresh, istate);
            refineSamples(samples, sbw, x, y + stepSize, stepSize, thresh, istate);
            refineSamples(samples, sbw, x + stepSize, y + stepSize, stepSize, thresh, istate);
            return;
        }
    }

    // interpolate remaining samples
    float ds = 1.0f / stepSize;
    for (var i = 0; i <= stepSize; i++)
    for (var j = 0; j <= stepSize; j++)
    if (!samples[x + i + (y + j) * sbw].processed())
        ImageSample.bilerp(samples[x + i + (y + j) * sbw], s00, s01, s10, s11, i * ds, j * ds);
}

private static final class ImageSample {
    float rx, ry;
    var i, n;
    Color c;
    Instance instance;
    Shader shader;
    float nx, ny, nz;

    ImageSample(float rx, float ry, int i) {
    this.rx = rx;
    this.ry = ry;
    this.i = i;
    n = 0;
    c = null;
    instance = null;
    shader = null;
    nx = ny = nz = 1;
}

final void set(ShadingState state) {
    if (state == null)
        c = Color.BLACK;
    else {
        c = state.getResult();
        checkNanInf();
        shader = state.getShader();
        instance = state.getInstance();
        if (state.getNormal() != null) {
            nx = state.getNormal().x;
            ny = state.getNormal().y;
            nz = state.getNormal().z;
        }
    }
    n = 1;
}

final void add(ShadingState state) {
    if (n == 0)
        c = Color.black();
    if (state != null) {
        c.add(state.getResult());
        checkNanInf();
    }
    n++;
}

final void checkNanInf() {
    if (c.isNan())
        UI.printError(Module.BCKT, "NaN shading sample!");
    else if (c.isInf())
        UI.printError(Module.BCKT, "Inf shading sample!");

}

final void scale(float s) {
    c.mul(s);
}

final boolean processed() {
    return c != null;
}

final boolean sampled() {
    return n > 0;
}

final boolean isDifferent(ImageSample sample, float thresh) {
    if (instance != sample.instance)
        return true;
    if (shader != sample.shader)
        return true;
    if (Color.hasContrast(c, sample.c, thresh))
        return true;
    // only compare normals if this pixel has not been averaged
    float dot = (nx * sample.nx + ny * sample.ny + nz * sample.nz);
    return dot < 0.9f;
}

static final ImageSample bilerp(ImageSample result, ImageSample i00, ImageSample i01, ImageSample i10, ImageSample i11, float dx, float dy) {
    float k00 = (1.0f - dx) * (1.0f - dy);
    float k01 = (1.0f - dx) * dy;
    float k10 = dx * (1.0f - dy);
    float k11 = dx * dy;
    Color c00 = i00.c;
    Color c01 = i01.c;
    Color c10 = i10.c;
    Color c11 = i11.c;
    Color c = Color.mul(k00, c00);
    c.madd(k01, c01);
    c.madd(k10, c10);
    c.madd(k11, c11);
    result.c = c;
    return result;
}
}
