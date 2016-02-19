import {TraceWorker} from "./TraceWorker";
import {Thread} from "./Thread";
import {ByteArrayBase} from "../../../pointer/ByteArrayBase";

export class TraceJob {

    public finished:boolean;

    private id:number;
    private _time:number;
    private _runCount:number=0;

    public get time():number{
        return this._time;
    }
    public get runCount():number{
        return this._runCount;
    }

    constructor(public param) {
        this.id = param.id;
        this.finished = false;
    }

    start(thread:Thread, onComplete:Function) {
        this._runCount++;
        this._time = performance.now();
        var self = this;
        this.param.init_iterations = this._runCount;
        thread.trace(this.param, function (thread:Thread) {
            self._time = performance.now() - self._time;
            if (onComplete) {
                onComplete(thread);
            }
        });
    }
}
