import {BucketOrder} from "../../core/BucketOrder";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class HilbertBucketOrder implements BucketOrder {

    getBucketSequence(nbw:number, nbh:number):number[] {
        let hi:number = 0;
        //  hilbert curve index
        let hn:number = 0;
        //  hilbert curve order
        while (((((1 + hn)
        < nbw)
        || ((1 + hn)
        < nbh))
        && (hn < 16))) {
            hn++;
        }

        //  fit to number of buckets
        let hN:number = (1 + (2 * hn));
        //  number of hilbert buckets - 2**2n
        let n:number = (nbw * nbh);
        //  total number of buckets
        let coords:number[] = new Array((2 * n));
        //  storage for bucket coordinates
        for (let i:number = 0; (i < n); i++) {
            let hy:number;
            let hx:number;
            for (
                ; (((hx >= nbw)
            || ((hy >= nbh)
            || ((hx < 0)
            || (hy < 0))))
            && (hi < hN));
            ) {
                //  s is the hilbert index, shifted to start in the middle
                let s:number = hi;
                //  (hi + (hN >> 1)) & (hN - 1);
                //  int n = hn;
                //  adapted from Hacker's Delight
                let sr:number;
                let comp:number;
                let swap:number;
                let cs:number;
                let t:number;
                s = s | (0x55555555 << (2 * hn)); // Pad s on left with 01
                sr = (s >>> 1) & 0x55555555; // (no change) groups.
                cs = ((s & 0x55555555) + sr) ^ 0x55555555;// Compute
                // complement
                // & swap info in
                // two-bit groups.
                // Parallel prefix xor op to propagate both complement
                // and swap info together from left to right (there is
                // no step "cs ^= cs >> 1", so in effect it computes
                // two independent parallel prefix operations on two
                // interleaved sets of sixteen bits).
                cs = cs ^ (cs >>> 2);
                cs = cs ^ (cs >>> 4);
                cs = cs ^ (cs >>> 8);
                cs = cs ^ (cs >>> 16);
                swap = cs & 0x55555555; // Separate the swap and
                comp = (cs >>> 1) & 0x55555555; // complement bits.
                t = (s & swap) ^ comp; // Calculate x and y in
                s = s ^ sr ^ t ^ (t << 1); // the odd & even bit
                // positions, resp.
                s = s & ((1 << 2 * hn) - 1); // Clear out any junk
                // on the left (unpad).
                // Now "unshuffle" to separate the x and y bits.
                t = (s ^ (s >>> 1)) & 0x22222222;
                s = s ^ t ^ (t << 1);
                t = (s ^ (s >>> 2)) & 0x0C0C0C0C;
                s = s ^ t ^ (t << 2);
                t = (s ^ (s >>> 4)) & 0x00F000F0;
                s = s ^ t ^ (t << 4);
                t = (s ^ (s >>> 8)) & 0x0000FF00;
                s = s ^ t ^ (t << 8);
                hx = s >>> 16; // Assign the two halves
                hy = s & 0xFFFF; // of t to x and y.
                hi++;
            }

            coords[((2 * i)
            + 0)] = hx;
            coords[((2 * i)
            + 1)] = hy;
        }

        return coords;
    }
}