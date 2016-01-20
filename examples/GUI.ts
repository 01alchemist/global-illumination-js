import {Component} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";
/**
 * Created by Nidin Vinayakan on 20-01-2016.
 */
@Component({
    selector:"gui",
    templateUrl:"./examples/GUI.html"
})
export class GUI{

    constructor(){

    }

    init():void {
        /*some styling */
        document.body.style.background = "#2B2B2B";
        document.body.style.fontFamily = "Courier New";
        document.body.style.color = "#ffffff";
    }
}
bootstrap(GUI,[]);