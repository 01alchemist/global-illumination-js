/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class ColumnBucketOrder implements BucketOrder {

    getBucketSequence(nbw:number, nbh:number):number[] {
        let coords:number[] = new Array((2
        * (nbw * nbh)));
        for (let i:number = 0; (i
        < (nbw * nbh)); i++) {
            let bx:number = (i / nbh);
            let by:number = (i % nbh);
            if (((bx & 1)
                == 1)) {
                by = (nbh - (1 - by));
            }

            coords[((2 * i)
            + 0)] = bx;
            coords[((2 * i)
            + 1)] = by;
        }

        return coords;
    }
}