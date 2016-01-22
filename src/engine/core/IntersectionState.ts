/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export /* sealed */ class IntersectionState {

    private static MAX_STACK_SIZE: number = 64;

    u: number;

    v: number;

    instance: Instance;

    id: number;

    private stack: StackNode[];

    private rstack: number[];

    current: Instance;

    export /* sealed */ class StackNode {

    public node: number;

    public near: number;

    public far: number;
}

public constructor () {
    this.stack = new Array((MAX_STACK_SIZE * 2));
    for (let i: number = 0; (i < this.stack.length); i++) {
        this.stack[i] = new StackNode();
    }

    this.rstack = new Array((53 * 256));
}

public getStack(): StackNode[] {
    return this.stack;
}

public getStackTop(): number {
    return (this.current == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

public getRobustStack(): number[] {
    return this.rstack;
}

public hit(): boolean {
    return (this.instance != null);
}

public setIntersection(id: number, u: number, v: number) {
    this.instance = this.current;
    this.id = this.id;
    this.u = this.u;
    this.v = this.v;
}
}