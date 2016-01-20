import {IBucketOrder} from "./IBucketOrder";
import {RowBucketOrder} from "./RowBucketOrder";
import {ColumnBucketOrder} from "./ColumnBucketOrder";
import {DiagonalBucketOrder} from "./DiagonalBucketOrder";
import {SpiralBucketOrder} from "./SpiralBucketOrder";
import {HilbertBucketOrder} from "./HilbertBucketOrder";
import {RandomBucketOrder} from "./RandomBucketOrder";
import {InvertedBucketOrder} from "./InvertedBucketOrder";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class BucketOrderFactory {
    static create(order:string) {
        var flip:boolean = false;
        if (order.startsWith("inverse") || order.startsWith("invert") || order.startsWith("reverse")) {
            var tokens:string[] = order.split("\\s+");
            if (tokens.length == 2) {
                order = tokens[1];
                flip = true;
            }
        }
        var o:IBucketOrder = null;

        switch (order) {
            case "row":
                o = new RowBucketOrder();
                break;
            case "column":
                o = new ColumnBucketOrder();
                break;
            case "diagonal":
                o = new DiagonalBucketOrder();
                break;
            case "spiral":
                o = new SpiralBucketOrder();
                break;
            case "hilbert":
                o = new HilbertBucketOrder();
                break;
            case "random":
                o = new RandomBucketOrder();
                break;
            default:
                console.log("Unrecognized bucket ordering: " + order + " - using hilbert");
                o = new HilbertBucketOrder();
                flip = false;
                break;
        }
        if (flip) {
            o = new InvertedBucketOrder(o);
        }
        return o;
    }
}