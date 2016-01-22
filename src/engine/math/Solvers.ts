/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* sealed */ class Solvers {

    public static solveQuadric(a: number, b: number, c: number): number[] {
        let disc: number = ((b * b) - (4
        * (a * c)));
        if ((disc < 0)) {
            return null;
        }

        disc = Math.sqrt(disc);
        let q: number = (b < 0);
        // TODO: Warning!!!, inline IF is not supported ?
        let t0: number = (q / a);
        let t1: number = (c / q);
        //  return sorted array
        return (t0 > t1);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public static solveQuartic(a: number, b: number, c: number, d: number, e: number): number[] {
        let inva: number = (1 / a);
        let c1: number = (b * inva);
        let c2: number = (c * inva);
        let c3: number = (d * inva);
        let c4: number = (e * inva);
        //  cubic resolvant
        let c12: number = (c1 * c1);
        let p: number = (((0.375 * c12)
        * -1)
        + c2);
        let q: number = (((0.125
        * (c12 * c1)) - (0.5
        * (c1 * c2)))
        + c3);
        let r: number = (((0.01171875
        * (c12 * c12))
        * -1)
        + (((0.0625
        * (c12 * c2)) - (0.25
        * (c1 * c3)))
        + c4));
        let z: number = Solvers.solveCubicForQuartic(((0.5 * p)
        * -1), (r * -1), ((0.5
        * (r * p)) - (0.125
        * (q * q))));
        let d1: number = ((2 * z)
        - p);
        if ((d1 < 0)) {
            if ((d1 > 1E-10)) {
                d1 = 0;
            }
            else {
                return null;
            }

        }

        let d2: number;
        if ((d1 < 1E-10)) {
            d2 = ((z * z)
            - r);
            if ((d2 < 0)) {
                return null;
            }

            d2 = Math.sqrt(d2);
        }
        else {
            d1 = Math.sqrt(d1);
            d2 = (0.5
            * (q / d1));
        }

        //  setup usefull values for the quadratic factors
        let q1: number = (d1 * d1);
        let q2: number = ((0.25 * c1)
        * -1);
        let pm: number = (q1 - (4
        * (z - d2)));
        let pp: number = (q1 - (4
        * (z + d2)));
        if (((pm >= 0)
            && (pp >= 0))) {
            //  4 roots (!)
            pm = Math.sqrt(pm);
            pp = Math.sqrt(pp);
            let results: number[] = new Array(4);
            results[0] = (((0.5
            * (d1 + pm))
            * -1)
            + q2);
            results[1] = (((0.5
            * (d1 - pm))
            * -1)
            + q2);
            results[2] = ((0.5
            * (d1 + pp))
            + q2);
            results[3] = ((0.5
            * (d1 - pp))
            + q2);
            //  tiny insertion sort
            for (let i: number = 1; (i < 4); i++) {
                for (let j: number = i; ((j > 0)
                && (results[(j - 1)] > results[j])); j--) {
                    let t: number = results[j];
                    results[j] = results[(j - 1)];
                    results[(j - 1)] = t;
                }

            }

            return results;
        }
        else if ((pm >= 0)) {
            pm = Math.sqrt(pm);
            let results: number[] = new Array(2);
            results[0] = (((0.5
            * (d1 + pm))
            * -1)
            + q2);
            results[1] = (((0.5
            * (d1 - pm))
            * -1)
            + q2);
            return results;
        }
        else if ((pp >= 0)) {
            pp = Math.sqrt(pp);
            let results: number[] = new Array(2);
            results[0] = ((0.5
            * (d1 - pp))
            + q2);
            results[1] = ((0.5
            * (d1 + pp))
            + q2);
            return results;
        }

        return null;
    }

    private static solveCubicForQuartic(p: number, q: number, r: number): number {
        let A2: number = (p * p);
        let Q: number = ((A2 - (3 * q))
        / 9);
        let R: number = (((p
        * (A2 - (4.5 * q))) + (13.5 * r))
        / 27);
        let Q3: number = (Q
        * (Q * Q));
        let R2: number = (R * R);
        let d: number = (Q3 - R2);
        let an: number = (p / 3);
        if ((d >= 0)) {
            d = (R / Math.sqrt(Q3));
            let theta: number = (Math.acos(d) / 3);
            let sQ: number = ((2 * Math.sqrt(Q))
            * -1);
            return ((sQ * Math.cos(theta))
            - an);
        }
        else {
            let sQ: number = Math.pow((Math.sqrt((R2 - Q3)) + Math.abs(R)), (1 / 3));
            if ((R < 0)) {
                return ((sQ
                + (Q / sQ))
                - an);
            }
            else {
                return (((sQ
                + (Q / sQ))
                - an)
                * -1);
            }

        }

    }
}