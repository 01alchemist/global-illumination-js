import {ByteArrayBase} from "./ByteArrayBase";
/**
 * Created by r3f on 15/1/2016.
 */
export interface IPointer{

    size:number;
    write(memory:ByteArrayBase, offset:number):number;
}