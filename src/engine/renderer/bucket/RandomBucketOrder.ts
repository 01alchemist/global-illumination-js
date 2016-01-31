/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class RandomBucketOrder implements BucketOrder {

    getBucketSequence(nbw:number, nbh:number):number[] {
        let coords:number[] = new Array((2
        * (nbw * nbh)));
        for (let i:number = 0; (i
        < (nbw * nbh)); i++) {
            let by:number = (i / nbw);
            let bx:number = (i % nbw);
            if (((by & 1)
                == 1)) {
                bx = (nbw - (1 - bx));
            }

            coords[((2 * i)
            + 0)] = bx;
            coords[((2 * i)
            + 1)] = by;
        }

        let seed:number;
        for (let i:number = 0; (i < coords.length); i++) {
            //  pick 2 random indices
            seed = this.xorshift(seed);
            let src:number = this.mod((<number>(seed)), (nbw * nbh));
            seed = this.xorshift(seed);
            let dst:number = this.mod((<number>(seed)), (nbw * nbh));
            let tmp:number = coords[((2 * src)
            + 0)];
            coords[((2 * src)
            + 0)] = coords[((2 * dst)
            + 0)];
            coords[((2 * dst)
            + 0)] = tmp;
            tmp = coords[((2 * src)
            + 1)];
            coords[((2 * src)
            + 1)] = coords[((2 * dst)
            + 1)];
            coords[((2 * dst)
            + 1)] = tmp;
        }

        return coords;
    }

    private mod(a:number, b:number):number {
        let m:int = a % b;
        return (m < 0) ? m + b : m;
    }

    private xorshift(y:number):number {
        y = y ^ (y << 13);
        y = y ^ (y >>> 17); // unsigned
        y = y ^ (y << 5);
        return y;
    }
}