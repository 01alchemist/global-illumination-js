import {CanvasDisplay} from "./CanvasDisplay";
import {SmartBucketRenderer} from "../src/engine/renderer/SmartBucketRenderer";
/**
 * Created by Nidin Vinayakan on 19/2/2016.
 */
export abstract class RenderBase extends CanvasDisplay {

    private renderer:SmartBucketRenderer;
    private pixels:Uint8ClampedArray;

    constructor(i_width, i_height) {
        super(i_width, i_height);
    }

    onRendererChange(newValue:string){
        console.log(newValue);
    }

    onEngineChange(newValue:string){
        console.log(newValue);
    }

    onBucketSizeChange(newValue:number){
        console.log(newValue);
    }

    onIterationsChange(newValue:number){
        console.log(newValue);
    }

    onBlockIterationsChange(newValue:number){
        console.log(newValue);
    }

    onCameraSamplesChange(newValue:number){
        if(this.cameraSamples != newValue){
            this.cameraSamples = newValue;
            this.renderer.updateCameraSamples(newValue);
        }
    }

    onHitSamplesChange(newValue:number){
        if(this.hitSamples != newValue){
            this.hitSamples = newValue;
            this.renderer.updateHitSamples(newValue);
        }
    }

    onOutputChange(newValue:number){
        console.log(newValue);
    }

    onThreadsChange(newValue:number){
        console.log(newValue);
    }

    render(scene, camera, cameraSamples, hitSamples, bounces, iterations, blockIterations) {

        console.info("+ Render settings");
        console.info("      Resolution          :   " + this.i_width + "x" + this.i_height);
        console.info("      CameraSamples       :   " + cameraSamples);
        console.info("      HitSamples          :   " + hitSamples);
        console.info("      Bounces             :   " + bounces);
        console.info("      Iterations          :   " + iterations);
        console.info("      Block-Iterations    :   " + blockIterations);

        this.cameraSamples = cameraSamples;
        this.hitSamples = hitSamples;
        this.bounces = bounces;

        if (!this.renderer) {
            this.renderer = new SmartBucketRenderer();
        }
        var self = this;
        this.pixels = this.renderer.render(scene, camera, this.i_width, this.i_height, cameraSamples, hitSamples,
            bounces, iterations, blockIterations,
            function (rect) {
                self.updatePixelsRect(rect, self.pixels);
            }
        );
    }

}