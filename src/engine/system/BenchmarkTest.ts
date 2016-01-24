/**
 * Created by Nidin Vinayakan on 22-01-2016.
 */
/**
 * This interface is used to represent a piece of code which is to be
 * benchmarked by repeatedly running and timing the kernel code. The begin/end
 * routines are called per-iteration to do any local initialization which is not
 * meant to be taken into acount in the timing (like preparing or destroying
 * data structures).
 */
export interface BenchmarkTest {

    kernelBegin():void;

    kernelMain():void;

    kernelEnd():void;
}
