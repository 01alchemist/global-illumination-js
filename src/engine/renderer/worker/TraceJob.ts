import {TraceWorker} from "./TraceWorker";
import {Thread} from "./Thread";
import {ByteArrayBase} from "../../../pointer/ByteArrayBase";

export class TraceJob {

    private id:number;
    public finished:boolean;

    constructor(public param) {
        this.id = param.id;
        this.finished = false;
    }
    start(thread:Thread, onComplete:Function){
        thread.trace(this.param, onComplete);
    }
}
