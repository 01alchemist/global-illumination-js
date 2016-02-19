import {CanvasDisplay} from "./CanvasDisplay";
import {SmartBucketRenderer} from "../src/engine/renderer/SmartBucketRenderer";
/**
 * Created by Nidin Vinayakan on 19/2/2016.
 */
export class RenderBase extends CanvasDisplay {

    private renderer:SmartBucketRenderer;
    private pixels:Uint8ClampedArray;

    constructor(i_width, i_height) {
        super(i_width, i_height);
    }
    onInit() {

    }
    render(scene, camera, cameraSamples, hitSamples, bounces, iterations){

        if(!this.renderer){
            this.renderer = new SmartBucketRenderer();
        }
        var self = this;
        this.pixels = this.renderer.render(scene, camera, this.i_width, this.i_height, cameraSamples, hitSamples, bounces, iterations,
            function(rect){
                self.updatePixelsRect(rect, self.pixels);
            }
        );
    }

}