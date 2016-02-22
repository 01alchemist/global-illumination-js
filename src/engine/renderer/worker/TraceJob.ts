import {TraceWorker} from "./TraceWorker";
import {Thread} from "./Thread";
import {ByteArrayBase} from "../../../pointer/ByteArrayBase";

export class TraceJob {

    public finished:boolean;

    private id:number;
    private _time:number;
    private _runCount:number = 0;

    public get time():number {
        return this._time;
    }

    public get runCount():number {
        return this._runCount;
    }

    constructor(public param, public extra = {}) {
        this.id = param.id;
        this.finished = false;
    }

    start(thread:Thread, onComplete:Function) {

        this._time = performance.now();
        var self = this;
        var _param = this.getTraceParam();
        thread.trace(_param, function (thread:Thread) {
            self._time = performance.now() - self._time;
            if (onComplete) {
                onComplete(self, thread);
            }
        });

        this._runCount++;
    }

    getTraceParam() {

        var _param = {};
        var extraCount = 0;
        for (key in this.extra) {
            if (this.extra.hasOwnProperty(key)) {
                _param[key] = this.extra[key];
                if(key === "camera"){
                    this._runCount = 0;
                }

                delete this.extra[key];
                extraCount++;
            }
        }
        if (extraCount > 0) {
            for (var key in this.param) {
                if (this.param.hasOwnProperty(key)) {
                    _param[key] = this.param[key];
                }
            }
        } else {
            this.param.init_iterations = (this._runCount * this.param.blockIterations) - (this._runCount > 0 ? (this.param.blockIterations - 1) : 0);
            return this.param;
        }

        this.param.init_iterations = (this._runCount * this.param.blockIterations) - (this._runCount > 0 ? (this.param.blockIterations - 1) : 0);
        return _param;
    }
}
