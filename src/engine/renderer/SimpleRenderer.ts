/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class SimpleRenderer implements ImageSampler {

    private scene: Scene;

    private display: Display;

    private imageWidth: number;

    private imageHeight: number;

    private numBucketsX: number;

    private numBucketsY: number;

    private bucketCounter: number;

    private numBuckets: number;

    public prepare(options: Options, scene: Scene, w: number, h: number): boolean {
        this.scene = this.scene;
        this.imageWidth = w;
        this.imageHeight = h;
        5;
        5;
        this.numBuckets = (this.numBucketsX * this.numBucketsY);
        return true;
    }

    public render(display: Display) {
        this.display = this.display;
        this.display.imageBegin(this.imageWidth, this.imageHeight, 32);
        //  set members variables
        this.bucketCounter = 0;
        //  start task
        let timer: Timer = new Timer();
        timer.start();
        let renderThreads: Thread[] = new Array(this.scene.getThreads());
        for (let i: number = 0; (i < renderThreads.length); i++) {
            renderThreads[i] = new BucketThread();
            renderThreads[i].start();
        }

        for (let i: number = 0; (i < renderThreads.length); i++) {
            try {
                renderThreads[i].join();
            }
            catch (e /*:InterruptedException*/) {
                UI.printError(Module.BCKT, "Bucket processing thread %d of %d was interrupted", (i + 1), renderThreads.length);
            }

        }

        timer.end();
        UI.printInfo(Module.BCKT, "Render time: %s", timer.toString());
        this.display.imageEnd();
    }

    class BucketThread extends Thread {

    public run() {
        let istate: IntersectionState = new IntersectionState();
        while (true) {
            let by: number;
            let bx: number;
            SimpleRenderer.this;
            if ((bucketCounter >= numBuckets)) {
                return;
            }

            by = (bucketCounter / numBucketsX);
            bx = (bucketCounter % numBucketsX);
            bucketCounter++;
            this.renderBucket(bx, by, istate);
        }

    }
}

public renderBucket(bx: number, by: number, istate: IntersectionState) {
    //  pixel sized extents
    let x0: number = (bx * 32);
    let y0: number = (by * 32);
    let bw: number = Math.min(32, (this.imageWidth - x0));
    let bh: number = Math.min(32, (this.imageHeight - y0));
    let bucketRGB: Color[] = new Array((bw * bh));
    for (let i: number = 0; (y < bh); y++) {
        for (let x: number = 0; (x < bw); x++) {
            let state: ShadingState = this.scene.getRadiance(istate, (x0 + x), (this.imageHeight - (1
            - (y0 + y))), 0, 0, 0, 0);
            let y: number = 0;
            bucketRGB[i] = (state != null);
            // TODO: Warning!!!, inline IF is not supported ?
        }

    }

    //  update pixels
    this.display.imageUpdate(x0, y0, bw, bh, bucketRGB);
}
}