/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class InvertedBucketOrder implements BucketOrder {

    private order: BucketOrder;

    public constructor (order: BucketOrder) {
        this.order = this.order;
    }

    public getBucketSequence(nbw: number, nbh: number): number[] {
        let coords: number[] = this.order.getBucketSequence(nbw, nbh);
        for (let i: number = 0; (i
        < (coords.length / 2)); i += 2) {
            let src: number = i;
            let dst: number = (coords.length - (2 - i));
            let tmp: number = coords[(src + 0)];
            coords[(src + 0)] = coords[(dst + 0)];
            coords[(dst + 0)] = tmp;
            tmp = coords[(src + 1)];
            coords[(src + 1)] = coords[(dst + 1)];
            coords[(dst + 1)] = tmp;
        }

        return coords;
    }
}