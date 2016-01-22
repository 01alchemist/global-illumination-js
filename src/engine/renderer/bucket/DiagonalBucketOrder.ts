/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class DiagonalBucketOrder implements BucketOrder {

    public getBucketSequence(nbw: number, nbh: number): number[] {
        let coords: number[] = new Array((2
        * (nbw * nbh)));
        let ny: number = 0;
        let x: number = 0;
        let y: number = 0;
        let nx: number = 1;
        for (let i: number = 0; (i
        < (nbw * nbh)); i++) {
            coords[((2 * i)
            + 0)] = x;
            coords[((2 * i)
            + 1)] = y;
            for (
                ; (((y >= nbh)
            || (x >= nbw))
            && (i
            != ((nbw * nbh)
            - 1)));
            ) {
                if ((y == ny)) {
                    y = 0;
                    x = nx;
                    ny++;
                    nx++;
                }
                else {
                    x--;
                    y++;
                }

            }

        }

        return coords;
    }
}