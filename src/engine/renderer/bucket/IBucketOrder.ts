/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
/**
 * Creates an array of coordinates that iterate over the tiled screen. Classes
 * which implement this interface are responsible for guarenteeing the entire
 * screen is tiled. No attempt is made to check for duplicates or incomplete
 * coverage.
 */
export interface IBucketOrder{
    /**
     * Computes the order in which each coordinate on the screen should be
     * visited.
     *
     * @param nbw number of buckets in the X direction
     * @param nbh number of buckets in the Y direction
     * @return array of coordinates with interleaved X, Y of the positions of
     *         buckets to be rendered.
     */
    getBucketSequence(nbw:number, nbh:number):Int32Array;
}
