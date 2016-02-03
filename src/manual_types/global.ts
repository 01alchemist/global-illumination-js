interface Navigator {
    hardwareConcurrency:number;
    getHardwareConcurrency(callback, options?):void;
}
interface Headers {
    append(key:string, value:string);
    delete(key:string);
    entries():Iterator<any>;
    get(key:string):string;
    getAll():any[];
    has(value:string):boolean;
    keys():Iterator<string>;
    //keys():string[];
}
interface Response {
    type:string;
    url:string;
    useFinalURL:string;
    status:string;
    statusText:string;
    headers:Headers;
    ok:boolean;
    clone():Response;
    error();
    redirect();
    arrayBuffer():Promise<ArrayBuffer>;
    blob():Promise<Blob>;
    formData();
    json():Promise<Object>;
    text():Promise<string>;
}
declare function fetch(url:string, options:any):Promise<Response>;
interface String {
    startsWith(value:string):boolean;
    endsWith(value:string):boolean;
}
declare function postMessage(arg:any);

interface SharedArrayBuffer {
    /**
     * Read-only. The length of the ArrayBuffer (in bytes).
     */
    byteLength: number;

    /**
     * Returns a section of an ArrayBuffer.
     */
    slice(begin:number, end?:number): ArrayBuffer;
}
interface SharedArrayBufferConstructor extends ArrayBufferConstructor {

}
declare var SharedArrayBuffer:SharedArrayBufferConstructor;