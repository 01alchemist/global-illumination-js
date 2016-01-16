import {ByteArrayBase} from "./ByteArrayBase";
/**
 * Created by r3f on 15/1/2016.
 */
export interface IPointer{

    memorySize:number;
    write(memory:ByteArrayBase):number;
    read(memory:ByteArrayBase):number;
}