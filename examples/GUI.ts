import {SharedScene} from "../src/engine/scene/SharedScene";
import {Camera} from "../src/engine/scene/Camera";
/**
 * Created by Nidin Vinayakan on 20-01-2016.
 */
declare module UIL {

    export var BW:number;
    export var AW:number;

    export class Title {
        constructor(arg:any);
    }
    export class Button {
        constructor(arg:any);
    }
    export class Gui {
        constructor(arg:any);

        add(type:string, arg:any);
    }
}
export abstract class GUI {

    isSupported:boolean;
    info:UIL.Title;
    protected _iterations:any;
    protected _blockIterations:any;
    protected _cameraSamples:any;
    protected _hitSamples:any;
    protected _eye:any;
    protected _lookAt:any;
    protected _up:any;
    protected _fov:any;

    abstract onInit();
    abstract onSceneChange(value);
    abstract onRendererChange(value);
    abstract onEngineChange(value);
    abstract onBucketSizeChange(value);
    abstract onIterationsChange(value);
    abstract onBlockIterationsChange(value);
    abstract onCameraSamplesChange(value);
    abstract onHitSamplesChange(value);
    abstract onOutputChange(value);
    abstract onEyeChange(value);
    abstract onLookAtChange(value);
    abstract onThreadsChange(value);

    rendererList:string[] = [
        "Simple Renderer",
        "Bucket Renderer",
        "Progressive Renderer"
    ];
    GIEngineList:string[] = [
        "Instant GI",
        "Path Tracing",
        "Irradiance Cache",
        "Ambient Occlusion GI",
        "Fake GI"
    ];
    sceneList:string[] = [];
    superSampling:string[] = [
        "1x",
        "2x",
        "4x",
        "8x",
        "16x"
    ];


    get cameraSamples():number{
        return this._cameraSamples.value;
    }
    set cameraSamples(value:number){
        this._cameraSamples.value = value;
    }

    get hitSamples():number{
        return this._hitSamples.value;
    }
    set hitSamples(value:number){
        this._hitSamples.value = value;
    }
    bounces:number;
    //scene:SharedScene;
    camera:Camera;

    constructor() {

    }

    init():void {
        /*some styling */
        document.body.style.background = "#161616";
        document.body.style.fontFamily = "Courier New";
        document.body.style.color = "#CCCCCC";

        new UIL.Title({
            target: document.body,
            name: 'Global illumination JS by Nidin Vinayakan',
            id: "v1.0",
            size: 400,
            pos: {left: '10px', top: '10px'},
            simple: false
        });

        this.info = new UIL.Title({
            target: document.body,
            name: 'Info:',
            id: "!",
            size: 400,
            pos: {left: '10px', bottom: '10px'},
            simple: false
        });

        if (!window["SharedArrayBuffer"]) {
            var msg:string = "Oops! Your browser does not supported. If you want to try this app go and get Firefox Nightly 46";
            new UIL.Title({
                target: document.body,
                name: msg,
                id: "!",
                size: "790",
                pos: {left: '10px', top: '50px'},
                titleColor: "#ff0000",
                fontColor: "#ff0000",
                simple: false
            });
            new UIL.Button({
                target: document.body,
                callback: gotoDownloadPage,
                name: 'Download Firefox Nightly',
                size: 200,
                pos: {left: '10px', top: '100px'},
                simple: true
            });

            function gotoDownloadPage() {
                location.href = "https://nightly.mozilla.org";
            }

            this.isSupported = false;
            throw "Oops! Your browser does not supported. If you want to try this app go and get Firefox Nightly 46 https://nightly.mozilla.org";

        } else {

            this.isSupported = true;
            var ui = new UIL.Gui({css: 'top:10px; right:10px;', Tpercent:50, size: 250, left: 200});
            ui.add('title', {name: 'Options', id: "v1.0", titleColor: '#D4B87B', fontColor: "#D4B87B"});

            ui.add('list', {name: 'Scenes', callback: this.onSceneChange.bind(this), list: this.sceneList});
            //ui.add('list', {name: 'Antialiasing', callback: callback, list: this.superSampling});
            //ui.add('list', {name: 'Renderer', callback: this.onRendererChange.bind(this), list: this.rendererList});
            //ui.add('list', {name: 'GI Engine', callback: this.onEngineChange.bind(this), list: this.GIEngineList});

            var renderGroup = ui.add('group', {name: 'Render', titleColor: '#D4B87B', fontColor: '#D4B87B', height: 30});

            renderGroup.add('list', {
                name: 'Block Size',
                callback: this.onBucketSizeChange.bind(this),
                list: [8, 16, 24, 32, 64, 128]
            });
            this._iterations = renderGroup.add('slide', {
                name: 'Iterations',
                callback: this.onIterationsChange.bind(this),
                value: 1,
                min: 1,
                max: 1000,
                step: 1
            });
            this._blockIterations = renderGroup.add('slide', {
                name: 'Block Iterations',
                callback: this.onBlockIterationsChange.bind(this),
                value: 1,
                min: 1,
                max: 16,
                step: 1
            });
            this._cameraSamples = renderGroup.add('slide', {
                name: 'Camera Samples',
                callback: this.onCameraSamplesChange.bind(this),
                value: 1,
                min: -1,
                max: 16,
                step: 1
            });
            this._hitSamples = renderGroup.add('slide', {
                name: 'Hit Samples',
                callback: this.onHitSamplesChange.bind(this),
                value: 1,
                min: 1,
                max: 16,
                step: 1
            });

            renderGroup.add('number', {name: 'Output', callback: this.onOutputChange.bind(this), value: [1280, 720], step: 1});


            //Camera
            var camera = ui.add('group', {name: 'Camera', titleColor: '#D4B87B', fontColor: '#D4B87B', height: 30});
            this._eye = camera.add('number', {
                name: 'Eye',
                callback: this.onEyeChange.bind(this),
                step: 1,
                precision: 3,
                value: [0, -1, 0]
            });
            this._lookAt = camera.add('number', {
                name: 'Look At',
                callback: this.onLookAtChange.bind(this),
                step: 1,
                precision: 3,
                value: [0, 0, 0]
            });
            this._up = camera.add('number', {
                name: 'Up',
                callback: callback,
                min: -1,
                max: 1,
                step: 1,
                precision: 3,
                value: [0, 1, 0]
            });
            this._fov = camera.add('number', {
                name: 'FOV',
                callback: callback,
                min: 0,
                max: 128,
                step: 1,
                precision: 0,
                value: 45
            });

            //Lights
            var sun = ui.add('group', {name: 'Sun', titleColor: '#D4B87B', fontColor: '#D4B87B', height: 30});

            //ui.add('title', {name: 'Sun', id: "--", fontColor: "#D4B87B"});
            sun.add('bool', {name: 'On', height: 30});
            sun.add('number', {
                name: 'Direction',
                callback: callback,
                min: -1,
                max: 1,
                step: 0.001,
                precision: 3,
                value: [0, -1, 0]
            });
            sun.add('slide', {
                name: 'Brightness',
                callback: callback,
                min: 0,
                max: 1,
                value: 1,
                step: 0.0001,
                precision: 4
            });

            var debug = ui.add('group', {name: 'Debug', titleColor: '#D4B87B', fontColor: '#D4B87B', height: 30});

            //ui.add('title', {name: 'Debug Options', id: "--", color: "#313131", fontColor: "#D4B87B"});

            debug.add('slide', {
                name: 'Threads',
                callback: callback,
                min: 1,
                max: 16,
                value: 4,
                step: 1,
                precision: 0.1
            });

            debug.add('color', {name: 'Background', callback: callback, type: 'html', value: 0});
            debug.add('color', {name: 'No Hit', callback: callback, type: 'html', value: 0});

            function callback(data) {
                console.log(data);
            }
        }

        if (this.onInit) {
            this.onInit();
        }
    }
}