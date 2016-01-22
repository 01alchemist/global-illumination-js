import {IFilter} from "./../../core/IFilter";
import {BoxFilter} from "./BoxFilter";
import {GaussianFilter} from "./GaussianFilter";
import {MitchellFilter} from "./MitchellFilter";
import {CatmullRomFilter} from "./CatmullRomFilter";
import {BlackmanHarrisFilter} from "./BlackmanHarrisFilter";
import {SincFilter} from "./SincFilter";
import {LanczosFilter} from "./LanczosFilter";
import {TriangleFilter} from "./TriangleFilter";
/**
 * Created by Nidin Vinayakan on 20/1/2016.
 */
export class FilterFactory {

    static get(filterName:string):IFilter {
        switch (filterName){
            case "box":return new BoxFilter(1);
            case "gaussian":return new GaussianFilter(3);
            case "mitchell":return new MitchellFilter();
            case "catmull-rom":return new CatmullRomFilter();
            case "blackman-harris":return new BlackmanHarrisFilter(4);
            case "sinc":return new SincFilter(4);
            case "lanczos":return new LanczosFilter();
            case "triangle":return new TriangleFilter(2);
        }
        return null;
    }
}