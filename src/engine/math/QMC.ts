/**
 * Quasi-Monte Carlo Sampler
 */
export class QMC {
    private static NUM:number = 128;
    private static SIGMA:Array<Int32Array> = [];//[QMC.NUM][];
    private static PRIMES:Int32Array = new Int32Array(QMC.NUM);//[NUM];

    static init() {
        console.log("Initializing Faure scrambling tables (for low-discrepancy sequences)...");
        // build table of first QMC.PRIMES
        QMC.PRIMES[0] = 2;
        for (var i = 1; i < QMC.PRIMES.length; i++) {
            QMC.PRIMES[i] = QMC.nextPrime(QMC.PRIMES[i - 1]);
        }
        var table:Array<Int32Array> = [];//[QMC.PRIMES[QMC.PRIMES.length - 1] + 1][];
        table[2] = new Int32Array([0, 1]);
        //table[2][0] = 0;
        //table[2][1] = 1;
        for (var i = 3; i <= QMC.PRIMES[QMC.PRIMES.length - 1]; i++) {
            table[i] = new Int32Array(i);
            if ((i & 1) == 0) {
                var prev:Int32Array = table[i >> 1];
                for (var j = 0; j < prev.length; j++) {
                    table[i][j] = 2 * prev[j];
                }
                for (var j = 0; j < prev.length; j++) {
                    table[i][prev.length + j] = 2 * prev[j] + 1;
                }
            } else {
                prev = table[i - 1];
                var med:number = (i - 1) >> 1;
                for (var j = 0; j < med; j++) {
                    table[i][j] = prev[j] + ((prev[j] >= med) ? 1 : 0);
                }
                table[i][med] = med;
                for (var j = 0; j < med; j++) {
                    table[i][med + j + 1] = prev[j + med] + ((prev[j + med] >= med) ? 1 : 0);
                }
            }
        }
        for (var i = 0; i < QMC.PRIMES.length; i++) {
            var p = QMC.PRIMES[i];
            QMC.SIGMA[i] = new Int32Array(p);
            QMC.SIGMA[i].set(table[p]);
            //System.arraycopy(table[p], 0, QMC.SIGMA[i], 0, p);
        }
    }

    private static nextPrime(p):number {
        p = p + (p & 1) + 1;
        while (true) {
            var div = 3;
            var isPrime:boolean = true;
            while (isPrime && ((div * div) <= p)) {
                isPrime = ((p % div) != 0);
                div += 2;
            }
            if (isPrime) {
                return p;
            }

            p += 2;
        }
    }

    static riVDC(bits, r):number {
        bits = (bits << 16) | (bits >>> 16);
        bits = ((bits & 0x00ff00ff) << 8) | ((bits & 0xff00ff00) >>> 8);
        bits = ((bits & 0x0f0f0f0f) << 4) | ((bits & 0xf0f0f0f0) >>> 4);
        bits = ((bits & 0x33333333) << 2) | ((bits & 0xcccccccc) >>> 2);
        bits = ((bits & 0x55555555) << 1) | ((bits & 0xaaaaaaaa) >>> 1);
        bits ^= r;
        return (bits & 0xFFFFFFFF) / 0x100000000;
    }

    static riS(i, r) {
        for (var v = 1 << 31; i != 0; i >>>= 1, v ^= v >>> 1)
            if ((i & 1) != 0)
                r ^= v;
        return r / 0x100000000;
    }

    static riLP(i, r) {
        for (var v = 1 << 31; i != 0; i >>>= 1, v |= v >>> 1)
            if ((i & 1) != 0)
                r ^= v;
        return r / 0x100000000;
    }

    static halton(d, i) {
        // generalized Halton sequence
        switch (d) {
            case 0:
            {
                i = (i << 16) | (i >>> 16);
                i = ((i & 0x00ff00ff) << 8) | ((i & 0xff00ff00) >>> 8);
                i = ((i & 0x0f0f0f0f) << 4) | ((i & 0xf0f0f0f0) >>> 4);
                i = ((i & 0x33333333) << 2) | ((i & 0xcccccccc) >>> 2);
                i = ((i & 0x55555555) << 1) | ((i & 0xaaaaaaaa) >>> 1);
                return (i & 0xFFFFFFFF) / 0x100000000;
            }
            case 1:
            {
                var v:number = 0;
                var inv:number = 1.0 / 3;
                var p:number;
                var n:number;
                for (p = inv, n = i; n != 0; p *= inv, n /= 3) {
                    v += (n % 3) * p;
                }
                return v;
            }
        }
        var base:number = QMC.PRIMES[d];
        var perm:Int32Array = QMC.SIGMA[d];
        var v:number = 0;
        var inv:number = 1.0 / base;
        var p:number;
        var n:number;
        for (p = inv, n = i; n != 0; p *= inv, n /= base) {
            v += perm[n % base] * p;
        }
        return v;
    }

    static mod1(x:number) {
        // assumes x >= 0
        return x - Math.round(x);
    }

    static generateSigmaTable(n):Int32Array {
        //assert (n & (n - 1)) == 0;
        var sigma:Int32Array = new Int32Array(n);
        for (var i = 0; i < n; i++) {
            var digit = n;
            sigma[i] = 0;
            for (var bits = i; bits != 0; bits >>= 1) {
                digit >>= 1;
                if ((bits & 1) != 0) {
                    sigma[i] += digit;
                }
            }
        }
        return sigma;
    }
}