import {FastHashMap} from "../utils/FastHashMap";
import {Point3} from "../math/Point3";
import {Vector3} from "../math/Vector3";
import {Matrix4} from "../math/Matrix4";
import {Color} from "../math/Color";
import {Point2} from "../math/Point2";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export enum ParameterType {
    STRING,
    INT,
    BOOL,
    FLOAT,
    POINT,
    VECTOR,
    TEXCOORD,
    MATRIX,
    COLOR,
}

export enum InterpolationType {
    NONE,
    FACE,
    VERTEX,
    FACEVARYING,
}

export class ParameterList {

    protected list:FastHashMap<string, Parameter>;

    private numVerts:number;

    private numFaces:number;

    private numFaceVerts:number;

    constructor() {
        this.list = new FastHashMap<string, Parameter>();
        this.numFaceVerts = 0;
        this.numFaces = 0;
        this.numVerts = 0;
    }

    clear(showUnused:boolean) {
        if (showUnused) {
            for (let e:FastHashMap.Entry<string, Parameter> in this.list) {
                if (!e.getValue().checked) {
                    console.warn(Module.API, "Unused parameter:%s - %s", e.getKey(), e.getValue());
                }
            }
        }

        this.list.clear();
        this.numFaceVerts = 0;
        this.numFaces = 0;
        this.numVerts = 0;
    }

    setFaceCount(numFaces:number) {
        this.numFaces = this.numFaces;
    }

    setVertexCount(numVerts:number) {
        this.numVerts = this.numVerts;
    }

    setFaceVertexCount(numFaceVerts:number) {
        this.numFaceVerts = this.numFaceVerts;
    }

    addString(name:string, value:string) {
        this.add(name, new Parameter(value));
    }

    addInteger(name:string, value:number) {
        this.add(name, new Parameter(value));
    }

    addBoolean(name:string, value:boolean) {
        this.add(name, new Parameter(value));
    }

    addFloat(name:string, value:number) {
        this.add(name, new Parameter(value));
    }

    addColor(name:string, value:Color) {
        if ((value == null)) {
            throw new NullPointerException();
        }

        this.add(name, new Parameter(value));
    }

    addIntegerArray(name:string, array:Int32Array) {
        if ((array == null)) {
            throw new NullPointerException();
        }

        this.add(name, new Parameter(array));
    }

    addStringArray(name:string, array:string[]) {
        if ((array == null)) {
            throw new NullPointerException();
        }

        this.add(name, new Parameter(array));
    }

    addFloats(name:string, interp:InterpolationType, data:number[]) {
        if ((data == null)) {
            console.error(Module.API, "Cannot create float parameter %s -- invalid data length", name);
            return;
        }

        this.add(name, new Parameter(ParameterType.FLOAT, interp, data));
    }

    addPoints(name:string, interp:InterpolationType, data:number[]) {
        if (((data == null)
            || ((data.length % 3)
            != 0))) {
            console.error(Module.API, "Cannot create point parameter %s -- invalid data length", name);
            return;
        }

        this.add(name, new Parameter(ParameterType.POINT, interp, data));
    }

    addVectors(name:string, interp:InterpolationType, data:number[]) {
        if (((data == null)
            || ((data.length % 3)
            != 0))) {
            console.error(Module.API, "Cannot create vector parameter %s -- invalid data length", name);
            return;
        }

        this.add(name, new Parameter(ParameterType.VECTOR, interp, data));
    }

    addTexCoords(name:string, interp:InterpolationType, data:number[]) {
        if (((data == null)
            || ((data.length % 2)
            != 0))) {
            console.error(Module.API, "Cannot create texcoord parameter %s -- invalid data length", name);
            return;
        }

        this.add(name, new Parameter(ParameterType.TEXCOORD, interp, data));
    }

    addMatrices(name:string, interp:InterpolationType, data:number[]) {
        if (((data == null)
            || ((data.length % 16)
            != 0))) {
            console.error(Module.API, "Cannot create matrix parameter %s -- invalid data length", name);
            return;
        }

        this.add(name, new Parameter(ParameterType.MATRIX, interp, data));
    }

    private add(name:string, param:Parameter) {
        if ((name == null)) {
            console.error(Module.API, "Cannot declare parameter with null name");
        }
        else if ((this.list.put(name, param) != null)) {
            console.warn(Module.API, "Parameter %s was already defined -- overwriting", name);
        }

    }

    getString(name:string, defaultValue:string):string {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.STRING, InterpolationType.NONE, 1, p)) {
            return p.getStringValue();
        }

        return defaultValue;
    }

    getStringArray(name:string, defaultValue:string[]):string[] {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.STRING, InterpolationType.NONE, -1, p)) {
            return p.getStrings();
        }

        return defaultValue;
    }

    getInt(name:string, defaultValue:number):number {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.INT, InterpolationType.NONE, 1, p)) {
            return p.getIntValue();
        }

        return defaultValue;
    }

    getIntArray(name:string):number[] {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.INT, InterpolationType.NONE, -1, p)) {
            return p.getInts();
        }

        return null;
    }

    getBoolean(name:string, defaultValue:boolean):boolean {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.BOOL, InterpolationType.NONE, 1, p)) {
            return p.getBoolValue();
        }

        return defaultValue;
    }

    getFloat(name:string, defaultValue:number):number {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.FLOAT, InterpolationType.NONE, 1, p)) {
            return p.getFloatValue();
        }

        return defaultValue;
    }

    getColor(name:string, defaultValue:Color):Color {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.COLOR, InterpolationType.NONE, 1, p)) {
            return p.getColor();
        }

        return defaultValue;
    }

    getPoint(name:string, defaultValue:Point3):Point3 {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.POINT, InterpolationType.NONE, 1, p)) {
            return p.getPoint();
        }

        return defaultValue;
    }

    getVector(name:string, defaultValue:Vector3):Vector3 {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.VECTOR, InterpolationType.NONE, 1, p)) {
            return p.getVector();
        }

        return defaultValue;
    }

    getTexCoord(name:string, defaultValue:Point2):Point2 {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.TEXCOORD, InterpolationType.NONE, 1, p)) {
            return p.getTexCoord();
        }

        return defaultValue;
    }

    getMatrix(name:string, defaultValue:Matrix4):Matrix4 {
        let p:Parameter = this.list.get(name);
        if (this.isValidParameter(name, ParameterType.MATRIX, InterpolationType.NONE, 1, p)) {
            return p.getMatrix();
        }

        return defaultValue;
    }

    getFloatArray(name:string):FloatParameter {
        return this.getFloatParameter(name, ParameterType.FLOAT, this.list.get(name));
    }

    getPointArray(name:string):FloatParameter {
        return this.getFloatParameter(name, ParameterType.POINT, this.list.get(name));
    }

    getVectorArray(name:string):FloatParameter {
        return this.getFloatParameter(name, ParameterType.VECTOR, this.list.get(name));
    }

    getTexCoordArray(name:string):FloatParameter {
        return this.getFloatParameter(name, ParameterType.TEXCOORD, this.list.get(name));
    }

    getMatrixArray(name:string):FloatParameter {
        return this.getFloatParameter(name, ParameterType.MATRIX, this.list.get(name));
    }

    private isValidParameter(name:string, type:ParameterType, interp:InterpolationType, requestedSize:number, p:Parameter):boolean {
        if ((p == null)) {
            return false;
        }

        if ((p.type != type)) {
            console.warn(Module.API, "Parameter %s requested as a %s - declared as %s", name, type.name().toLowerCase(), p.type.name().toLowerCase());
            return false;
        }

        if ((p.interp != interp)) {
            console.warn(Module.API, "Parameter %s requested as a %s - declared as %s", name, interp.name().toLowerCase(), p.interp.name().toLowerCase());
            return false;
        }

        if (((requestedSize > 0)
            && (p.size() != requestedSize))) {
            console.warn(Module.API, "Parameter %s requires %d %s - declared with %d", name, requestedSize, (requestedSize == 1));
            // TODO:Warning!!!, inline IF is not supported ?
            return false;
        }

        p.checked = true;
        return true;
    }

    private getFloatParameter(name:string, type:ParameterType, p:Parameter):FloatParameter {
        if ((p == null)) {
            return null;
        }

        switch (p.interp) {
            case NONE:
                if (!this.isValidParameter(name, type, p.interp, -1, p)) {
                    return null;
                }

                break;
            case VERTEX:
                if (!this.isValidParameter(name, type, p.interp, this.numVerts, p)) {
                    return null;
                }

                break;
            case FACE:
                if (!this.isValidParameter(name, type, p.interp, this.numFaces, p)) {
                    return null;
                }

                break;
            case FACEVARYING:
                if (!this.isValidParameter(name, type, p.interp, this.numFaceVerts, p)) {
                    return null;
                }

                break;
            default:
                return null;
                break;
        }

        return p.getFloats();
    }

}
export class FloatParameter {

    constructor(public interp:InterpolationType = InterpolationType.NONE, public data:Float32Array) {
    }
}
class Parameter {

    private obj:any|any[];
    private checked:boolean;

    private constructor(value:any, private type:ParameterType, private interp:InterpolationType = InterpolationType.NONE) {

        if (value instanceof Array) {
            this.obj = value;
        } else {
            this.obj = type == (ParameterType.BOOL || ParameterType.COLOR) ? value : [value];
        }
        this.checked = false;
    }

    private size():number {
        //  number of elements
        switch (this.type) {
            case ParameterType.STRING:
                return this.obj.length;
                break;
            case ParameterType.INT:
                return this.obj.length;
                break;
            case ParameterType.BOOL:
                return 1;
                break;
            case ParameterType.FLOAT:
                return this.obj.length;
                break;
            case ParameterType.POINT:
                return this.obj.length / 3;
                break;
            case ParameterType.VECTOR:
                return this.obj.length / 3;
                break;
            case ParameterType.TEXCOORD:
                return this.obj.length / 2;
                break;
            case ParameterType.MATRIX:
                return this.obj.length / 16;
                break;
            case ParameterType.COLOR:
                return 1;
                break;
            default:
                return -1;
                break;
        }

    }

    protected check() {
        this.checked = true;
    }

    toString():string {
        return (this.interp == InterpolationType.NONE ? "" : InterpolationType[this.interp].toLowerCase() + " ") + ParameterType[this.type].toLowerCase() + "[" + this.size() + "]";
    }

    private getStringValue():string {
        return this.obj[0];
    }

    private getBoolValue():boolean {
        return this.obj;
    }

    private getIntValue():number {
        return this.obj[0];
    }

    private getInts():number[] {
        return this.obj;
    }

    private getStrings():string[] {
        return this.obj;
    }

    private getFloatValue():number {
        return this.obj;
    }

    private getFloats():FloatParameter {
        return new FloatParameter(this.interp, this.obj);
    }

    private getPoint():Point3 {
        let floats:float[] = this.obj;
        return new Point3(floats[0], floats[1], floats[2]);
    }

    private getVector():Vector3 {
        let floats:float[] = this.obj;
        return new Vector3(floats[0], floats[1], floats[2]);
    }

    private getTexCoord():Point2 {
        let floats:float[] = this.obj;
        return new Point2(floats[0], floats[1]);
    }

    private getMatrix():Matrix4 {
        let floats:float[] = this.obj;
        return new Matrix4(floats, true);
    }

    private getColor():Color {
        return <Color>this.obj;
    }
}