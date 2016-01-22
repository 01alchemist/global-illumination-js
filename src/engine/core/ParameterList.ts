/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ParameterList {

    protected list: FastHashMap<String, Parameter>;

    private numVerts: number;

    private numFaces: number;

    private numFaceVerts: number;

    enum ParameterType {

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

public constructor () {
    this.list = new FastHashMap<String, Parameter>();
    this.numFaceVerts = 0;
    this.numFaces = 0;
    this.numVerts = 0;
}

public clear(showUnused: boolean) {
    if (showUnused) {
        for (let e: FastHashMap.Entry<String, Parameter> in this.list) {
            if (!e.getValue().checked) {
                UI.printWarning(Module.API, "Unused parameter: %s - %s", e.getKey(), e.getValue());
            }

        }

    }

    this.list.clear();
    this.numFaceVerts = 0;
    this.numFaces = 0;
    this.numVerts = 0;
}

public setFaceCount(numFaces: number) {
    this.numFaces = this.numFaces;
}

public setVertexCount(numVerts: number) {
    this.numVerts = this.numVerts;
}

public setFaceVertexCount(numFaceVerts: number) {
    this.numFaceVerts = this.numFaceVerts;
}

public addString(name: String, value: String) {
    this.add(name, new Parameter(value));
}

public addInteger(name: String, value: number) {
    this.add(name, new Parameter(value));
}

public addBoolean(name: String, value: boolean) {
    this.add(name, new Parameter(value));
}

public addFloat(name: String, value: number) {
    this.add(name, new Parameter(value));
}

public addColor(name: String, value: Color) {
    if ((value == null)) {
        throw new NullPointerException();
    }

    this.add(name, new Parameter(value));
}

public addIntegerArray(name: String, array: number[]) {
    if ((array == null)) {
        throw new NullPointerException();
    }

    this.add(name, new Parameter(array));
}

public addStringArray(name: String, array: String[]) {
    if ((array == null)) {
        throw new NullPointerException();
    }

    this.add(name, new Parameter(array));
}

public addFloats(name: String, interp: InterpolationType, data: number[]) {
    if ((data == null)) {
        UI.printError(Module.API, "Cannot create float parameter %s -- invalid data length", name);
        return;
    }

    this.add(name, new Parameter(ParameterType.FLOAT, interp, data));
}

public addPoints(name: String, interp: InterpolationType, data: number[]) {
    if (((data == null)
        || ((data.length % 3)
        != 0))) {
        UI.printError(Module.API, "Cannot create point parameter %s -- invalid data length", name);
        return;
    }

    this.add(name, new Parameter(ParameterType.POINT, interp, data));
}

public addVectors(name: String, interp: InterpolationType, data: number[]) {
    if (((data == null)
        || ((data.length % 3)
        != 0))) {
        UI.printError(Module.API, "Cannot create vector parameter %s -- invalid data length", name);
        return;
    }

    this.add(name, new Parameter(ParameterType.VECTOR, interp, data));
}

public addTexCoords(name: String, interp: InterpolationType, data: number[]) {
    if (((data == null)
        || ((data.length % 2)
        != 0))) {
        UI.printError(Module.API, "Cannot create texcoord parameter %s -- invalid data length", name);
        return;
    }

    this.add(name, new Parameter(ParameterType.TEXCOORD, interp, data));
}

public addMatrices(name: String, interp: InterpolationType, data: number[]) {
    if (((data == null)
        || ((data.length % 16)
        != 0))) {
        UI.printError(Module.API, "Cannot create matrix parameter %s -- invalid data length", name);
        return;
    }

    this.add(name, new Parameter(ParameterType.MATRIX, interp, data));
}

private add(name: String, param: Parameter) {
    if ((name == null)) {
        UI.printError(Module.API, "Cannot declare parameter with null name");
    }
    else if ((this.list.put(name, param) != null)) {
        UI.printWarning(Module.API, "Parameter %s was already defined -- overwriting", name);
    }

}

public getString(name: String, defaultValue: String): String {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.STRING, InterpolationType.NONE, 1, p)) {
        return p.getStringValue();
    }

    return defaultValue;
}

public getStringArray(name: String, defaultValue: String[]): String[] {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.STRING, InterpolationType.NONE, -1, p)) {
        return p.getStrings();
    }

    return defaultValue;
}

public getInt(name: String, defaultValue: number): number {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.INT, InterpolationType.NONE, 1, p)) {
        return p.getIntValue();
    }

    return defaultValue;
}

public getIntArray(name: String): number[] {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.INT, InterpolationType.NONE, -1, p)) {
        return p.getInts();
    }

    return null;
}

public getBoolean(name: String, defaultValue: boolean): boolean {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.BOOL, InterpolationType.NONE, 1, p)) {
        return p.getBoolValue();
    }

    return defaultValue;
}

public getFloat(name: String, defaultValue: number): number {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.FLOAT, InterpolationType.NONE, 1, p)) {
        return p.getFloatValue();
    }

    return defaultValue;
}

public getColor(name: String, defaultValue: Color): Color {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.COLOR, InterpolationType.NONE, 1, p)) {
        return p.getColor();
    }

    return defaultValue;
}

public getPoint(name: String, defaultValue: Point3): Point3 {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.POINT, InterpolationType.NONE, 1, p)) {
        return p.getPoint();
    }

    return defaultValue;
}

public getVector(name: String, defaultValue: Vector3): Vector3 {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.VECTOR, InterpolationType.NONE, 1, p)) {
        return p.getVector();
    }

    return defaultValue;
}

public getTexCoord(name: String, defaultValue: Point2): Point2 {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.TEXCOORD, InterpolationType.NONE, 1, p)) {
        return p.getTexCoord();
    }

    return defaultValue;
}

public getMatrix(name: String, defaultValue: Matrix4): Matrix4 {
    let p: Parameter = this.list.get(name);
    if (this.isValidParameter(name, ParameterType.MATRIX, InterpolationType.NONE, 1, p)) {
        return p.getMatrix();
    }

    return defaultValue;
}

public getFloatArray(name: String): FloatParameter {
    return this.getFloatParameter(name, ParameterType.FLOAT, this.list.get(name));
}

public getPointArray(name: String): FloatParameter {
    return this.getFloatParameter(name, ParameterType.POINT, this.list.get(name));
}

public getVectorArray(name: String): FloatParameter {
    return this.getFloatParameter(name, ParameterType.VECTOR, this.list.get(name));
}

public getTexCoordArray(name: String): FloatParameter {
    return this.getFloatParameter(name, ParameterType.TEXCOORD, this.list.get(name));
}

public getMatrixArray(name: String): FloatParameter {
    return this.getFloatParameter(name, ParameterType.MATRIX, this.list.get(name));
}

private isValidParameter(name: String, type: ParameterType, interp: InterpolationType, requestedSize: number, p: Parameter): boolean {
    if ((p == null)) {
        return false;
    }

    if ((p.type != type)) {
        UI.printWarning(Module.API, "Parameter %s requested as a %s - declared as %s", name, type.name().toLowerCase(), p.type.name().toLowerCase());
        return false;
    }

    if ((p.interp != interp)) {
        UI.printWarning(Module.API, "Parameter %s requested as a %s - declared as %s", name, interp.name().toLowerCase(), p.interp.name().toLowerCase());
        return false;
    }

    if (((requestedSize > 0)
        && (p.size() != requestedSize))) {
        UI.printWarning(Module.API, "Parameter %s requires %d %s - declared with %d", name, requestedSize, (requestedSize == 1));
        // TODO: Warning!!!, inline IF is not supported ?
        return false;
    }

    p.checked = true;
    return true;
}

private getFloatParameter(name: String, type: ParameterType, p: Parameter): FloatParameter {
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

export /* sealed */ class FloatParameter {

    public interp: InterpolationType;

    public data: number[];

    public constructor () :
    this(InterpolationType.NONE, null) {
    this.(InterpolationType.NONE, null);
}

public constructor (f: number) :
this(InterpolationType.NONE, [
    f]) {
    this.(InterpolationType.NONE, [
        f]);
}

private constructor (interp: InterpolationType, data: number[]) {
    this.interp = this.interp;
    this.data = this.data;
}
}

/* sealed */ class Parameter {

    private type: ParameterType;

    private interp: InterpolationType;

    private obj: Object;

    private constructor (value: String) {
        this.type = ParameterType.STRING;
        this.interp = InterpolationType.NONE;
        this.obj = [
            value];
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private constructor (value: number) {
        this.type = ParameterType.INT;
        this.interp = InterpolationType.NONE;
        this.obj = [
            value];
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private constructor (value: boolean) {
        this.type = ParameterType.BOOL;
        this.interp = InterpolationType.NONE;
        this.obj = value;
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private constructor (value: number) {
        this.type = ParameterType.FLOAT;
        this.interp = InterpolationType.NONE;
        this.obj = [
            value];
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private constructor (array: number[]) {
        this.type = ParameterType.INT;
        this.interp = InterpolationType.NONE;
        this.obj = array;
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private constructor (array: String[]) {
        this.type = ParameterType.STRING;
        this.interp = InterpolationType.NONE;
        this.obj = array;
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private constructor (c: Color) {
        this.type = ParameterType.COLOR;
        this.interp = InterpolationType.NONE;
        this.obj = c;
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private constructor (type: ParameterType, interp: InterpolationType, data: number[]) {
        this.type = this.type;
        this.interp = this.interp;
        this.obj = data;
        false;
        // TODO: checked/unchecked is not supported at this time
    }

    private size(): number {
        //  number of elements
        switch (this.type) {
            case STRING:
                return (<String[]>(this.obj)).length;
                break;
            case INT:
                return (<number[]>(this.obj)).length;
                break;
            case BOOL:
                return 1;
                break;
            case FLOAT:
                return (<number[]>(this.obj)).length;
                break;
            case POINT:
                return ((<number[]>(this.obj)).length / 3);
                break;
            case VECTOR:
                return ((<number[]>(this.obj)).length / 3);
                break;
            case TEXCOORD:
                return ((<number[]>(this.obj)).length / 2);
                break;
            case MATRIX:
                return ((<number[]>(this.obj)).length / 16);
                break;
            case COLOR:
                return 1;
                break;
            default:
                return -1;
                break;
        }

    }

    protected check() {
        true;
        // TODO: checked/unchecked is not supported at this time
    }

    public toString(): String {
        return String.format("%s%s[%d]", (this.interp == InterpolationType.NONE));
        // TODO: Warning!!!, inline IF is not supported ?
    }

    private getStringValue(): String {
        return (<String[]>(this.obj))[0];
    }

    private getBoolValue(): boolean {
        return (<Boolean>(this.obj));
    }

    private getIntValue(): number {
        return (<number[]>(this.obj))[0];
    }

    private getInts(): number[] {
        return (<number[]>(this.obj));
    }

    private getStrings(): String[] {
        return (<String[]>(this.obj));
    }

    private getFloatValue(): number {
        return (<number[]>(this.obj))[0];
    }

    private getFloats(): FloatParameter {
        return new FloatParameter(this.interp, (<number[]>(this.obj)));
    }

    private getPoint(): Point3 {
        let floats: number[] = (<number[]>(this.obj));
        return new Point3(floats[0], floats[1], floats[2]);
    }

    private getVector(): Vector3 {
        let floats: number[] = (<number[]>(this.obj));
        return new Vector3(floats[0], floats[1], floats[2]);
    }

    private getTexCoord(): Point2 {
        let floats: number[] = (<number[]>(this.obj));
        return new Point2(floats[0], floats[1]);
    }

    private getMatrix(): Matrix4 {
        let floats: number[] = (<number[]>(this.obj));
        return new Matrix4(floats, true);
    }

    private getColor(): Color {
        return (<Color>(this.obj));
    }
}
}