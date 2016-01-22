import {SharedScene} from "../scene/SharedScene";
import {IDisplay} from "./../core/IDisplay";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 *
 * This interface represents an image sampling algorithm capable of rendering
 * the entire image. Implementations are responsible for anti-aliasing and
 * filtering.
 */
export interface ImageSampler {

    /**
     * Prepare the sampler for rendering an image of w x h pixels
     *
     * @param w width of the image
     * @param h height of the image
     */
    prepare(options:any, scene:SharedScene, w:int, h:int):boolean;

    /**
     * Render the image to the specified display. The sampler can assume the
     * display has been opened and that it will be closed after the method
     * returns.
     *
     * @param display Display driver to send image data to
     */
    render(display:IDisplay):void;
}