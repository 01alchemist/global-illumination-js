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

public render(display:IDisplay):void{
    this.display = display;
    display.imageBegin(this.imageWidth, this.imageHeight, this.bucketSize);
    // set members variables
    this.bucketCounter = 0;
    // start task
    UI.taskStart("Rendering", 0, this.bucketCoords.length);
    var timer:Timer = new Timer();
    timer.start();
    var renderThreads:Thread[] = new Thread[scene.getThreads()];
    for (var i = 0; i < renderThreads.length; i++) {
        renderThreads[i] = new BucketThread(i);
        renderThreads[i].setPriority(scene.getThreadPriority());
        renderThreads[i].start();
    }
    for (var i = 0; i < renderThreads.length; i++) {
        try {
            renderThreads[i].join();
        } catch (InterruptedException e) {
            UI.printError(Module.BCKT, "Bucket processing thread %d of %d was interrupted", i + 1, renderThreads.length);
        }
    }
    UI.taskStop();
    timer.end();
    UI.printInfo(Module.BCKT, "Render time: %s", timer.toString());
    display.imageEnd();
}

private renderBucket(display:IDisplay, bx:number, by:number, threadID:number, istate:IntersectionState):void{
    // pixel sized extents
    var x0 = bx * bucketSize;
    var y0 = by * bucketSize;
    var bw = Math.min(bucketSize, imageWidth - x0);
    var bh = Math.min(bucketSize, imageHeight - y0);

    // prepare bucket
    display.imagePrepare(x0, y0, bw, bh, threadID);

    var bucketRGB:Color[] = [];//new Color[bw * bh];

    // subpixel extents
    var sx0 = x0 * subPixelSize - fs;
    var sy0 = y0 * subPixelSize - fs;
    var sbw = bw * subPixelSize + fs * 2;
    var sbh = bh * subPixelSize + fs * 2;

    // round up to align with maximum step size
    sbw = (sbw + (maxStepSize - 1)) & (~(maxStepSize - 1));
    sbh = (sbh + (maxStepSize - 1)) & (~(maxStepSize - 1));
    // extra padding as needed
    if (maxStepSize > 1) {
        sbw++;
        sbh++;
    }
    // allocate bucket memory
    var samples:ImageSample[] = [];//new ImageSample[sbw * sbh];
    // allocate samples and compute jitter offsets
    float invSubPixelSize = 1.0f / subPixelSize;
    for (var y = 0, index = 0; y < sbh; y++) {
        for (var x = 0; x < sbw; x++, index++) {
            var sx = sx0 + x;
            var sy = sy0 + y;
            var j = sx & (sigma.length - 1);
            var k = sy & (sigma.length - 1);
            var i = j * sigma.length + sigma[k];
            float dx = useJitter ? (float) sigma[k] / (float) sigma.length : 0.5f;
            float dy = useJitter ? (float) sigma[j] / (float) sigma.length : 0.5f;
            float rx = (sx + dx) * invSubPixelSize;
            float ry = (sy + dy) * invSubPixelSize;
            ry = imageHeight - ry - 1;
            samples[index] = new ImageSample(rx, ry, i);
        }
    }
    for (var x = 0; x < sbw - 1; x += maxStepSize)
    for (var y = 0; y < sbh - 1; y += maxStepSize)
    refineSamples(samples, sbw, x, y, maxStepSize, thresh, istate);
    if (dumpBuckets) {
        UI.printInfo(Module.BCKT, "Dumping bucket [%d, %d] to file ...", bx, by);
        Bitmap bitmap = new Bitmap(sbw, sbh, true);
        for (var y = sbh - 1, index = 0; y >= 0; y--)
        for (var x = 0; x < sbw; x++, index++)
        bitmap.setPixel(x, y, samples[index].c.copy().toNonLinear());
        bitmap.save(String.format("bucket_%04d_%04d.png", bx, by));
    }
    if (displayAA) {
        // color coded image of what is visible
        float invArea = invSubPixelSize * invSubPixelSize;
        for (var y = 0, index = 0; y < bh; y++) {
            for (var x = 0; x < bw; x++, index++) {
                var sampled = 0;
                for (var i = 0; i < subPixelSize; i++) {
                    for (var j = 0; j < subPixelSize; j++) {
                        var sx = x * subPixelSize + fs + i;
                        var sy = y * subPixelSize + fs + j;
                        var s = sx + sy * sbw;
                        sampled += samples[s].sampled() ? 1 : 0;
                    }
                }
                bucketRGB[index] = new Color(sampled * invArea);
            }
        }
    } else {
        // filter samples into pixels
        float cy = imageHeight - 1 - (y0 + 0.5f);
        for (var y = 0, index = 0; y < bh; y++, cy--) {
            float cx = x0 + 0.5f;
            for (var x = 0; x < bw; x++, index++, cx++) {
                Color c = Color.black();
                float weight = 0.0f;
                for (var j = -fs, sy = y * subPixelSize; j <= fs; j++, sy++) {
                    for (var i = -fs, sx = x * subPixelSize, s = sx + sy * sbw; i <= fs; i++, sx++, s++) {
                        float dx = samples[s].rx - cx;
                        if (Math.abs(dx) > fhs)
                            continue;
                        float dy = samples[s].ry - cy;
                        if (Math.abs(dy) > fhs)
                            continue;
                        float f = filter.get(dx, dy);
                        c.madd(f, samples[s].c);
                        weight += f;
                    }
                }
                c.mul(1.0f / weight);
                bucketRGB[index] = c;
            }
        }
    }
    // update pixels
    display.imageUpdate(x0, y0, bw, bh, bucketRGB);
}

private void computeSubPixel(ImageSample sample, IntersectionState istate) {
    float x = sample.rx;
    float y = sample.ry;
    double q0 = QMC.halton(1, sample.i);
    double q1 = QMC.halton(2, sample.i);
    double q2 = QMC.halton(3, sample.i);
    if (superSampling > 1) {
        // multiple sampling
        sample.add(scene.getRadiance(istate, x, y, q1, q2, q0, sample.i));
        for (var i = 1; i < superSampling; i++) {
            double time = QMC.mod1(q0 + i * invSuperSampling);
            double lensU = QMC.mod1(q1 + QMC.halton(0, i));
            double lensV = QMC.mod1(q2 + QMC.halton(1, i));
            sample.add(scene.getRadiance(istate, x, y, lensU, lensV, time, sample.i + i));
        }
        sample.scale((float) invSuperSampling);
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
