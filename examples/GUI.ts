/**
 * Created by Nidin Vinayakan on 20-01-2016.
 */
declare module UIL {
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
export class GUI {

    isSupported:boolean;
    info:UIL.Title;

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
    sceneList:string[] = [
        "Spheres",
        "Cornell"
    ];
    superSampling:string[] = [
        "1x",
        "2x",
        "4x",
        "8x",
        "16x"
    ];

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
            var ui = new UIL.Gui('top:10px; right:10px; margin-left:-150px;');
            ui.add('title', {name: 'Renderer Options', id: "v1.0", fontColor: "#D4B87B"});

            ui.add('list', {name: 'Scenes', callback: callback, list: this.sceneList});
            ui.add('list', {name: 'Antialiasing', callback: callback, list: this.superSampling});
            ui.add('list', {name: 'Renderer', callback: callback, list: this.rendererList});
            ui.add('list', {name: 'GI Engine', callback: callback, list: this.GIEngineList});

            ui.add('number', {name: 'Output', callback: callback, value: [640, 480], step: 1});

            ui.add('title', {name: 'Sun', id: "--", fontColor: "#D4B87B"});

            ui.add('number', {
                name: 'Direction',
                callback: callback,
                min: -1,
                max: 1,
                step: 0.001,
                precision: 3,
                value: [0, -1, 0]
            });
            ui.add('slide', {
                name: 'Brightness',
                callback: callback,
                min: 0,
                max: 1,
                value: 1,
                step: 0.0001,
                precision: 4
            });

            ui.add('title', {name: 'Debug Options', id: "--", color: "#313131", fontColor: "#D4B87B"});

            ui.add('slide', {name: 'Threads', callback: callback, min: 1, max: 16, value: 4, step: 1, precision: 0.1});

            ui.add('color', {name: 'Background', callback: callback, type: 'html', value: 0});
            ui.add('color', {name: 'No Hit', callback: callback, type: 'html', value: 0});

            function callback(data) {
                console.log(data);
            }
        }
    }
}