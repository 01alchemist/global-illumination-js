/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class IntersectionState {

    private static MAX_STACK_SIZE:number = 64;

    u:number;

    v:number;

    instance:Instance;

    id:number;

    private stack:StackNode[];

    private rstack:number[];

    current:Instance;

    export class StackNode {

    node:number;

    near:number;

    far:number;
}

constructor () {
    this.stack = new Array((MAX_STACK_SIZE * 2));
    for (let i:number = 0; (i < this.stack.length); i++) {
        this.stack[i] = new StackNode();
    }

    this.rstack = new Array((53 * 256));
}

getStack():StackNode[] {
    return this.stack;
}

getStackTop():number {
    return (this.current == null);
    // TODO:Warning!!!, inline IF is not supported ?
}

getRobustStack():number[] {
    return this.rstack;
}

hit():boolean {
    return (this.instance != null);
}

setIntersection(id:number, u:number, v:number) {
    this.instance = this.current;
    this.id = this.id;
    this.u = this.u;
    this.v = this.v;
}
}