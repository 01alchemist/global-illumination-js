/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class RowBucketOrder implements BucketOrder {

    public getBucketSequence(nbw: number, nbh: number): number[] {
        let coords: number[] = new Array((2
        * (nbw * nbh)));
        for (let i: number = 0; (i
        < (nbw * nbh)); i++) {
            let by: number = (i / nbw);
            let bx: number = (i % nbw);
            if (((by & 1)
                == 1)) {
                bx = (nbw - (1 - bx));
            }

            coords[((2 * i)
            + 0)] = bx;
            coords[((2 * i)
            + 1)] = by;
        }

        return coords;
    }
}