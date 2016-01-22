/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ProgressiveRenderer implements ImageSampler {

    private scene: Scene;

    private imageWidth: number;

    private imageHeight: number;

    private sigma: number[];

    private smallBucketQueue: PriorityBlockingQueue<SmallBucket>;

    private display: Display;

    private counter: number;

    private counterMax: number;

    public constructor () {
        this.imageWidth = 640;
        this.imageHeight = 480;
        this.sigma = null;
        this.smallBucketQueue = null;
    }

    public prepare(options: Options, scene: Scene, w: number, h: number): boolean {
        this.scene = this.scene;
        this.imageWidth = w;
        this.imageHeight = h;
        //  prepare table used by deterministic anti-aliasing
        this.sigma = QMC.generateSigmaTable((1 + 7));
        return true;
    }

    public render(display: Display) {
        this.display = this.display;
        this.display.imageBegin(this.imageWidth, this.imageHeight, 0);
        //  create first bucket
        let b: SmallBucket = new SmallBucket();
        b.y = 0;
        b.x = 0;
        let s: number = Math.max(this.imageWidth, this.imageHeight);
        b.size = 1;
        while ((b.size < s)) {
        }

        1;
        this.smallBucketQueue = new PriorityBlockingQueue<SmallBucket>();
        this.smallBucketQueue.add(b);
        UI.taskStart("Progressive Render", 0, (this.imageWidth * this.imageHeight));
        let t: Timer = new Timer();
        t.start();
        this.counter = 0;
        this.counterMax = (this.imageWidth * this.imageHeight);
        let renderThreads: Thread[] = new Array(this.scene.getThreads());
        for (let i: number = 0; (i < renderThreads.length); i++) {
            renderThreads[i] = new SmallBucketThread();
            renderThreads[i].start();
        }

        for (let i: number = 0; (i < renderThreads.length); i++) {
            try {
                renderThreads[i].join();
            }
            catch (e /*:InterruptedException*/) {
                UI.printError(Module.IPR, "Thread %d of %d was interrupted", (i + 1), renderThreads.length);
            }

        }

        UI.taskStop();
        t.end();
        UI.printInfo(Module.IPR, "Rendering time: %s", t.toString());
        this.display.imageEnd();
    }

    class SmallBucketThread extends Thread {

    public run() {
        let istate: IntersectionState = new IntersectionState();
        while (true) {
            let n: number = this.progressiveRenderNext(istate);
            ProgressiveRenderer.this;
            if ((counter >= counterMax)) {
                return;
            }

            counter = (counter + n);
            UI.taskUpdate(counter);
            if (UI.taskCanceled()) {
                return;
            }

        }

    }
}

private progressiveRenderNext(istate: IntersectionState): number {
    let TASK_SIZE: number = 16;
    let first: SmallBucket = this.smallBucketQueue.poll();
    if ((first == null)) {
        return 0;
    }

    let ds: number = (first.size / TASK_SIZE);
    let useMask: boolean = !this.smallBucketQueue.isEmpty();
    let mask: number = ((2
    * (first.size / TASK_SIZE))
    - 1);
    let pixels: number = 0;
    for (let y: number = first.y; ((i < TASK_SIZE)
    && (y < this.imageHeight)); i++) {
    }

    let i: number = 0;
    y = (y + ds);
    for (let x: number = first.x; ((j < TASK_SIZE)
    && (x < this.imageWidth)); j++) {
    }

    let j: number = 0;
    x = (x + ds);
    //  check to see if this is a pixel from a higher level tile
    if ((useMask
        && (((x & mask)
        == 0)
        && ((y & mask)
        == 0)))) {
        // TODO: Warning!!! continue If
    }

    let instance: number = (((x
    & (this.sigma.length - 1))
    * this.sigma.length)
    + this.sigma[(y
    & (this.sigma.length - 1))]);
    let time: number = QMC.halton(1, instance);
    let lensU: number = QMC.halton(2, instance);
    let lensV: number = QMC.halton(3, instance);
    let state: ShadingState = this.scene.getRadiance(istate, x, (this.imageHeight - (1 - y)), lensU, lensV, time, instance);
    let c: Color = (state != null);
    // TODO: Warning!!!, inline IF is not supported ?
    pixels++;
    //  fill region
    this.display.imageFill(x, y, Math.min(ds, (this.imageWidth - x)), Math.min(ds, (this.imageHeight - y)), c);
    if ((first.size >= (2 * TASK_SIZE))) {
        //  generate child buckets
        let size: number;
        1;
        for (let i: number = 0; (i < 2); i++) {
            if ((first.y
                + ((i * size)
                < this.imageHeight))) {
                for (let j: number = 0; (j < 2); j++) {
                    if ((first.x
                        + ((j * size)
                        < this.imageWidth))) {
                        let b: SmallBucket = new SmallBucket();
                        b.x = (first.x
                        + (j * size));
                        b.y = (first.y
                        + (i * size));
                        b.size = size;
                        b.constrast = (1 / size);
                        this.smallBucketQueue.put(b);
                    }

                }

            }

        }

    }

    return pixels;
}

//  progressive rendering
class SmallBucket implements Comparable<SmallBucket> {

    x: number;

    y: number;

    size: number;

    constrast: number;

    public compareTo(o: SmallBucket): number {
        if ((this.constrast < o.constrast)) {
            return -1;
        }

        if ((this.constrast == o.constrast)) {
            return 0;
        }

        return 1;
    }
}
}