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
                s = (s | (1431655765 + (2 * hn)));
                //  Pad s on left with 01
                1;
                1431655765;
                //  (no change) groups.
                cs = (((s & 1431655765)
                + sr)
                | 1431655765);
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                //  Compute
                //  complement
                //  & swap info in
                //  two-bit groups.
                //  Parallel prefix xor op to propagate both complement
                //  and swap info together from left to right (there is
                //  no step "cs ^= cs >> 1", so in effect it computes
                //  two independent parallel prefix operations on two
                //  interleaved sets of sixteen bits).
                let (:cs;
                2;
                let (:cs;
                4;
                let (:cs;
                8;
                let (:cs;
                16;
                swap = (cs & 1431655765);
                //  Separate the swap and
                1;
                1431655765;
                //  complement bits.
                t = ((s & swap)
                | comp);
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                //  Calculate x and y in
                s = (s
                | (sr
                | (t
                | (t + 1))));
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                //  the odd & even bit
                //  positions, resp.
                s = (s
                & ((1 + (2 * hn))
                - 1));
                //  Clear out any junk
                //  on the left (unpad).
                //  Now "unshuffle" to separate the x and y bits.
                1;
                572662306;
                s = (s
                | (t
                | (t + 1)));
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                2;
                202116108;
                s = (s
                | (t
                | (t + 2)));
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                4;
                15728880;
                s = (s
                | (t
                | (t + 4)));
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                8;
                65280;
                s = (s
                | (t
                | (t + 8)));
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                // The operator should be an XOR ^ instead of an OR, but not available in CodeDOM
                16;
                //  Assign the two halves
                hy = (s & 65535);
                //  of t to x and y.
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