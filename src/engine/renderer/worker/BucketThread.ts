import {Thread} from "./Thread";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class BucketThread extends Thread {

    constructure(private threadID:number) {
    }

    run() {
        var istate:IntersectionState = new IntersectionState();
        while (true) {
            var bx, by;
            synchronized (BucketRenderer.this) {
                if (bucketCounter >= bucketCoords.length)
                    return;
                UI.taskUpdate(bucketCounter);
                bx = bucketCoords[bucketCounter + 0];
                by = bucketCoords[bucketCounter + 1];
                bucketCounter += 2;
            }
            renderBucket(display, bx, by, threadID, istate);
            if (UI.taskCanceled())
                return;
        }
    }
}