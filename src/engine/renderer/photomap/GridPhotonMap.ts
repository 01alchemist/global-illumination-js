/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class GridPhotonMap implements GlobalPhotonMapInterface {

    private numGather: number;

    private gatherRadius: number;

    private numStoredPhotons: number;

    private nx: number;

    private ny: number;

    private nz: number;

    private bounds: BoundingBox;

    private cellHash: PhotonGroup[];

    private hashSize: number;

    private hashPrime: number;

    private rwl: ReentrantReadWriteLock;

    private numEmit: number;

    private static NORMAL_THRESHOLD: number = (<number>(Math.cos((10
    * (Math.PI / 180)))));

    private static PRIMES: number[];

    private static 19: number[];

    private static 37: number[];

    private static 109: number[];

    private static 163: number[];

    private static 251: number[];

    private static 367: number[];

    private static 557: number[];

    private static 823: number[];

    private static 1237: number[];

    private static 1861: number[];

    private static 2777: number[];

    private static 4177: number[];

    private static 6247: number[];

    private static 9371: number[];

    private static 21089: number[];

    private static 31627: number[];

    private static 47431: number[];

    private static 71143: number[];

    private static 106721: number[];

    private static 160073: number[];

    private static 240101: number[];

    private static 360163: number[];

    private static 540217: number[];

    private static 810343: number[];

    private static 1215497: number[];

    private static 1823231: number[];

    private static 2734867: number[];

    private static 4102283: number[];

    private static 6153409: number[];

    private static 9230113: number[];

    private static 13845163: number[];

    public constructor (numEmit: number, numGather: number, gatherRadius: number) {
        this.numEmit = this.numEmit;
        this.numGather = this.numGather;
        this.gatherRadius = this.gatherRadius;
        this.numStoredPhotons = 0;
        this.hashSize = 0;
        //  number of unique IDs in the hash
        this.rwl = new ReentrantReadWriteLock();
        this.numEmit = 100000;
    }

    public prepare(sceneBounds: BoundingBox) {
        this.bounds = new BoundingBox(sceneBounds);
        this.bounds.enlargeUlps();
        let w: Vector3 = this.bounds.getExtents();
        this.nx = (<number>(Math.max(((w.x / this.gatherRadius)
        + 0.5), 1)));
        this.ny = (<number>(Math.max(((w.y / this.gatherRadius)
        + 0.5), 1)));
        this.nz = (<number>(Math.max(((w.z / this.gatherRadius)
        + 0.5), 1)));
        let numCells: number = (this.nx
        * (this.ny * this.nz));
        UI.printInfo(Module.LIGHT, "Initializing grid photon map:");
        UI.printInfo(Module.LIGHT, "  * Resolution:  %dx%dx%d", this.nx, this.ny, this.nz);
        UI.printInfo(Module.LIGHT, "  * Total cells: %d", numCells);
        for (this.hashPrime = 0; (this.hashPrime < PRIMES.length); this.hashPrime++) {
            if ((PRIMES[this.hashPrime]
                > (numCells / 5))) {
                break;
            }

        }

        this.cellHash = new Array(PRIMES[this.hashPrime]);
        UI.printInfo(Module.LIGHT, "  * Initial hash size: %d", this.cellHash.length);
    }

    public size(): number {
        return this.numStoredPhotons;
    }

    public store(state: ShadingState, dir: Vector3, power: Color, diffuse: Color) {
        //  don't store on the wrong side of a surface
        if ((Vector3.dot(state.getNormal(), dir) > 0)) {
            return;
        }

        let pt: Point3 = state.getPoint();
        //  outside grid bounds ?
        if (!this.bounds.contains(pt)) {
            return;
        }

        let ext: Vector3 = this.bounds.getExtents();
        let ix: number = (<number>((((pt.x - this.bounds.getMinimum().x)
        * this.nx)
        / ext.x)));
        let iy: number = (<number>((((pt.y - this.bounds.getMinimum().y)
        * this.ny)
        / ext.y)));
        let iz: number = (<number>((((pt.z - this.bounds.getMinimum().z)
        * this.nz)
        / ext.z)));
        ix = MathUtils.clamp(ix, 0, (this.nx - 1));
        iy = MathUtils.clamp(iy, 0, (this.ny - 1));
        iz = MathUtils.clamp(iz, 0, (this.nz - 1));
        let id: number = (ix
        + ((iy * this.nx)
        + (iz
        * (this.nx * this.ny))));
        this;
        let hid: number = (id % this.cellHash.length);
        let g: PhotonGroup = this.cellHash[hid];
        let last: PhotonGroup = null;
        let hasID: boolean = false;
        while ((g != null)) {
            if ((g.id == id)) {
                hasID = true;
                if ((Vector3.dot(state.getNormal(), g.normal) > NORMAL_THRESHOLD)) {
                    break;
                }

            }

            last = g;
            g = g.next;
        }

        if ((g == null)) {
            g = new PhotonGroup(id, state.getNormal());
            if ((last == null)) {
                this.cellHash[hid] = g;
            }
            else {
                last.next = g;
            }

            if (!hasID) {
                this.hashSize++;
                //  we have not seen this ID before
                //  resize hash if we have grown too large
                if ((this.hashSize > this.cellHash.length)) {
                    this.growPhotonHash();
                }

            }

        }

        g.count++;
        g.flux.add(power);
        g.diffuse.add(diffuse);
        this.numStoredPhotons++;
    }

    public init() {
        UI.printInfo(Module.LIGHT, "Initializing photon grid ...");
        UI.printInfo(Module.LIGHT, "  * Photon hits:      %d", this.numStoredPhotons);
        UI.printInfo(Module.LIGHT, "  * Final hash size:  %d", this.cellHash.length);
        let cells: number = 0;
        for (let i: number = 0; (i < this.cellHash.length); i++) {
            for (let g: PhotonGroup = this.cellHash[i]; (g != null); g = g.next) {
                g.diffuse.mul((1 / g.count));
                cells++;
            }

        }

        UI.printInfo(Module.LIGHT, "  * Num photon cells: %d", cells);
    }

    public precomputeRadiance(includeDirect: boolean, includeCaustics: boolean) {

    }

    private growPhotonHash() {
        //  enlarge the hash size:
        if ((this.hashPrime
            >= (PRIMES.length - 1))) {
            return;
        }

        let temp: PhotonGroup[] = new Array(PRIMES[++hashPrime]);
        for (let i: number = 0; (i < this.cellHash.length); i++) {
            let g: PhotonGroup = this.cellHash[i];
            while ((g != null)) {
                //  re-hash into the new table
                let hid: number = (g.id % temp.length);
                let last: PhotonGroup = null;
                for (let gn: PhotonGroup = temp[hid]; (gn != null); gn = gn.next) {
                    last = gn;
                }

                if ((last == null)) {
                    temp[hid] = g;
                }
                else {
                    last.next = g;
                }

                let next: PhotonGroup = g.next;
                g.next = null;
                g = next;
            }

        }

        this.cellHash = temp;
    }

    public getRadiance(p: Point3, n: Vector3): Color {
        if (!this.bounds.contains(p)) {
            return Color.BLACK;
        }

        let ext: Vector3 = this.bounds.getExtents();
        let ix: number = (<number>((((p.x - this.bounds.getMinimum().x)
        * this.nx)
        / ext.x)));
        let iy: number = (<number>((((p.y - this.bounds.getMinimum().y)
        * this.ny)
        / ext.y)));
        let iz: number = (<number>((((p.z - this.bounds.getMinimum().z)
        * this.nz)
        / ext.z)));
        ix = MathUtils.clamp(ix, 0, (this.nx - 1));
        iy = MathUtils.clamp(iy, 0, (this.ny - 1));
        iz = MathUtils.clamp(iz, 0, (this.nz - 1));
        let id: number = (ix
        + ((iy * this.nx)
        + (iz
        * (this.nx * this.ny))));
        this.rwl.readLock().lock();
        let center: PhotonGroup = null;
        for (let g: PhotonGroup = this.get(ix, iy, iz); (g != null); g = g.next) {
            if (((g.id == id)
                && (Vector3.dot(n, g.normal) > NORMAL_THRESHOLD))) {
                if ((g.radiance == null)) {
                    center = g;
                    break;
                }

                let r: Color = g.radiance.copy();
                this.rwl.readLock().unlock();
                return r;
            }

        }

        let vol: number = 1;
        while (true) {
            let numPhotons: number = 0;
            let ndiff: number = 0;
            let irr: Color = Color.black();
            let diff: Color = (center == null);
            // TODO: Warning!!!, inline IF is not supported ?
            for (let z: number = (iz
            - (vol - 1)); (z
            <= (iz
            + (vol - 1))); z++) {
                for (let y: number = (iy
                - (vol - 1)); (y
                <= (iy
                + (vol - 1))); y++) {
                    for (let x: number = (ix
                    - (vol - 1)); (x
                    <= (ix
                    + (vol - 1))); x++) {
                        let vid: number = (x
                        + ((y * this.nx)
                        + (z
                        * (this.nx * this.ny))));
                        for (let g: PhotonGroup = this.get(x, y, z); (g != null); g = g.next) {
                            if (((g.id == vid)
                                && (Vector3.dot(n, g.normal) > NORMAL_THRESHOLD))) {
                                numPhotons = (numPhotons + g.count);
                                irr.add(g.flux);
                                if ((diff != null)) {
                                    diff.add(g.diffuse);
                                    ndiff++;
                                }

                                break;
                                //  only one valid group can be found,
                                //  skip the others
                            }

                        }

                    }

                }

            }

            if (((numPhotons >= this.numGather)
                || (vol >= 3))) {
                //  we have found enough photons
                //  cache irradiance and return
                let area: number = (((2 * vol)
                - 1) / (3
                * ((ext.x / this.nx)
                + ((ext.y / this.ny)
                + (ext.z / this.nz)))));
                area = (area * area);
                area = (area * Math.PI);
                irr.mul((1 / area));
                //  upgrade lock manually
                this.rwl.readLock().unlock();
                this.rwl.writeLock().lock();
                if ((center == null)) {
                    if ((ndiff > 0)) {
                        diff.mul((1 / ndiff));
                    }

                    center = new PhotonGroup(id, n);
                    center.diffuse.set(diff);
                    center.next = this.cellHash[(id % this.cellHash.length)];
                    this.cellHash[(id % this.cellHash.length)] = center;
                }

                irr.mul(center.diffuse);
                center.radiance = irr.copy();
                this.rwl.writeLock().unlock();
                //  unlock write - done
                return irr;
            }

            vol++;
        }

    }

    private get(x: number, y: number, z: number): PhotonGroup {
        //  returns the list associated with the specified location
        if (((x < 0)
            || (x >= this.nx))) {
            return null;
        }

        if (((y < 0)
            || (y >= this.ny))) {
            return null;
        }

        if (((z < 0)
            || (z >= this.nz))) {
            return null;
        }

        return this.cellHash[((x
        + ((y * this.nx)
        + (z
        * (this.nx * this.ny))))
        % this.cellHash.length)];
    }

    class PhotonGroup {

    id: number;

    count: number;

    normal: Vector3;

    flux: Color;

    radiance: Color;

    diffuse: Color;

    next: PhotonGroup;

    constructor (id: number, n: Vector3) {
        this.normal = new Vector3(n);
        this.flux = Color.black();
        this.diffuse = Color.black();
        this.radiance = null;
        this.count = 0;
        this.id = this.id;
        this.next = null;
    }
}

public allowDiffuseBounced(): boolean {
    return true;
}

public allowReflectionBounced(): boolean {
    return true;
}

public allowRefractionBounced(): boolean {
    return true;
}

public numEmit(): number {
    return this.numEmit;
}
}