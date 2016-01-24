/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class SpiralBucketOrder implements BucketOrder {

    getBucketSequence(nbw:number, nbh:number):number[] {
        let coords:number[] = new Array((2
        * (nbw * nbh)));
        for (let i:number = 0; (i
        < (nbw * nbh)); i++) {
            let by:number;
            let bx:number;
            let center:number = ((Math.min(nbw, nbh) - 1)
            / 2);
            let nx:number = nbw;
            let ny:number = nbh;
            while ((i
            < (nx * ny))) {
                nx--;
                ny--;
            }

            let nxny:number = (nx * ny);
            let minnxny:number = Math.min(nx, ny);
            if (((minnxny & 1)
                == 1)) {
                if ((i
                    <= (nxny + ny))) {
                    bx = (nx
                    - (minnxny / 2));
                    by = (((minnxny / 2)
                    * -1)
                    + (i - nxny));
                }
                else {
                    bx = (nx
                    - ((minnxny / 2)
                    - (i
                    - (nxny + ny))));
                    by = (ny
                    - (minnxny / 2));
                }

            }
            else if ((i
                <= (nxny + ny))) {
                bx = ((minnxny / 2)
                * -1);
                by = (ny
                - ((minnxny / 2)
                - (i - nxny)));
            }
            else {
                bx = (((minnxny / 2)
                * -1)
                + (i
                - (nxny + ny)));
                by = ((minnxny / 2)
                * -1);
            }

            coords[((2 * i)
            + 0)] = (bx + center);
            coords[((2 * i)
            + 1)] = (by + center);
        }

        return coords;
    }
}