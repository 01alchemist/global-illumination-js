import {FastHashMap} from "../../utils/FastHashMap";
import {Shader} from "../../core/Shader";
import {Instance} from "../../core/Instance";
import {Modifier} from "../../core/Modifier";
import {Geometry} from "../../core/Geometry";
import {ParameterList} from "../../core/ParameterList";
import {GlobalIlluminationAPI} from "../../GlobalIlluminatiionAPI";
import {LightSource} from "../../core/LightSource";
import {Camera} from "../../core/Camera";
import {Options} from "../../core/Options";
import {RenderObject} from "../../core/RenderObject";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export enum RenderObjectType {
    UNKNOWN,
    SHADER,
    MODIFIER,
    GEOMETRY,
    INSTANCE,
    LIGHT,
    CAMERA,
    OPTIONS,
}
class RenderObjectHandle {

    private obj:RenderObject;

    private type:RenderObjectType;

    private constructor(shader:Shader) {
        this.obj = shader;
        this.type = RenderObjectType.SHADER;
    }

    private constructor(modifier:Modifier) {
        this.obj = modifier;
        this.type = RenderObjectType.MODIFIER;
    }

    private constructor(tesselatable:Tesselatable) {
        this.obj = new Geometry(tesselatable);
        this.type = RenderObjectType.GEOMETRY;
    }

    private constructor(prims:PrimitiveList) {
        this.obj = new Geometry(prims);
        this.type = RenderObjectType.GEOMETRY;
    }

    private constructor(instance:Instance) {
        this.obj = instance;
        this.type = RenderObjectType.INSTANCE;
    }

    private constructor(light:LightSource) {
        this.obj = light;
        this.type = RenderObjectType.LIGHT;
    }

    private constructor(camera:Camera) {
        this.obj = camera;
        this.type = RenderObjectType.CAMERA;
    }

    private constructor(options:Options) {
        this.obj = options;
        this.type = RenderObjectType.OPTIONS;
    }

    private update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        return this.obj.update(pl, api);
    }

    private typeName():string {
        return this.type.name().toLowerCase();
    }

    private getShader():Shader {
        return (this.type == RenderObjectType.SHADER);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    private getModifier():Modifier {
        return (this.type == RenderObjectType.MODIFIER);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    private getGeometry():Geometry {
        return (this.type == RenderObjectType.GEOMETRY);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    private getInstance():Instance {
        return (this.type == RenderObjectType.INSTANCE);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    private getLight():LightSource {
        return (this.type == RenderObjectType.LIGHT);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    private getCamera():Camera {
        return (this.type == RenderObjectType.CAMERA);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    private getOptions():Options {
        return (this.type == RenderObjectType.OPTIONS);
        // TODO:Warning!!!, inline IF is not supported ?
    }
}
export class RenderObjectMap {

    private renderObjects:FastHashMap<string, RenderObjectHandle>;
    private rebuildInstanceList:boolean;
    private rebuildLightList:boolean;

    constructor() {
        this.renderObjects = new FastHashMap<string, RenderObjectHandle>();
        this.rebuildLightList = false;
        this.rebuildInstanceList = false;
    }

    has(name:string):boolean {
        return this.renderObjects.containsKey(name);
    }

    remove(name:string) {
        let obj:RenderObjectHandle = this.renderObjects.get(name);
        if ((obj == null)) {
            console.warn(Module.API, "Unable to remove \"" + name + "\" - object was not defined yet");
            return;
        }

        UI.printDetailed(Module.API, "Removing object \"" + name + "\"");
        this.renderObjects.remove(name);
        //  scan through all objects to make sure we don't have any
        //  references to the old object still around
        switch (obj.type) {
            case RenderObjectType.SHADER:
                let s:Shader = obj.getShader();
                for (let e:FastHashMap.Entry<string, RenderObjectHandle> in this.renderObjects) {
                    let i:Instance = e.getValue().getInstance();
                    if (i != null) {
                        console.warn(Module.API, "Removing shader \"" + name + "\" from instance \"" + e.getKey() + "\"");
                        i.removeShader(s);
                    }

                }

                break;
            case RenderObjectType.MODIFIER:
                let m:Modifier = obj.getModifier();
                for (let e:FastHashMap.Entry<string, RenderObjectHandle> in this.renderObjects) {
                    let i:Instance = e.getValue().getInstance();
                    if ((i != null)) {
                        console.warn(Module.API, "Removing modifier \"" + name + "\" from instance \"" + e.getKey() + "\"");
                        i.removeModifier(m);
                    }

                }

                break;
            case RenderObjectType.GEOMETRY:
                let g:Geometry = obj.getGeometry();
                for (let e:FastHashMap.Entry<string, RenderObjectHandle> in this.renderObjects) {
                    let i:Instance = e.getValue().getInstance();
                    if (((i != null)
                        && i.hasGeometry(g))) {
                        console.warn(Module.API, "Removing instance \"" + e.getKey() + "\" because it referenced geometry \"" + name + "\"");
                        this.remove(e.getKey());
                    }

                }

                break;
                break;
            case RenderObjectType.INSTANCE:
                this.rebuildInstanceList = true;
                break;
            case RenderObjectType.LIGHT:
                this.rebuildLightList = true;
                break;
        }

    }

    update(name:string, pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let obj:RenderObjectHandle = this.renderObjects.get(name);
        let success:boolean;
        if ((obj == null)) {
            console.error(Module.API, "Unable to update \"" + name + "\" - object was not defined yet");
            success = false;
        }
        else {
            UI.printDetailed(Module.API, "Updating \"" + obj.typeName() + "\" object \"" + name + "\"");
            success = obj.update(pl, apiUnknown);
            if (!success) {
                console.error(Module.API, "Unable to update \"" + name + "\" - removing");
                this.remove(name);
            }
            else {
                switch (obj.type) {
                    case RenderObjectType.GEOMETRY:
                    case RenderObjectType.INSTANCE:
                        this.rebuildInstanceList = true;
                        break;
                    case RenderObjectType.LIGHT:
                        this.rebuildLightList = true;
                        break;
                }

            }

        }

        return success;
    }

    updateScene(scene:Scene) {
        if (this.rebuildInstanceList) {
            UI.printInfo(Module.API, "Building scene instance list for rendering ...");
            let numInstance:number = 0;
            let numInfinite:number = 0;
            for (let e:FastHashMap.Entry<string, RenderObjectHandle> in this.renderObjects) {
                let i:Instance = e.getValue().getInstance();
                if ((i != null)) {
                    i.updateBounds();
                    if ((i.getBounds() == null)) {
                        numInfinite++;
                    }
                    else {
                        numInstance++;
                    }

                }

            }

            let infinite:Instance[] = new Array(numInfinite);
            let instance:Instance[] = new Array(numInstance);
            numInstance = 0;
            numInfinite = 0;
            for (let e:FastHashMap.Entry<string, RenderObjectHandle> in this.renderObjects) {
                let i:Instance = e.getValue().getInstance();
                if ((i != null)) {
                    if ((i.getBounds() == null)) {
                        infinite[numInfinite] = i;
                        numInfinite++;
                    }
                    else {
                        instance[numInstance] = i;
                        numInstance++;
                    }

                }

            }

            scene.setInstanceLists(instance, infinite);
            this.rebuildInstanceList = false;
        }

        if (this.rebuildLightList) {
            UI.printInfo(Module.API, "Building scene light list for rendering ...");
            let lightList:ArrayList<LightSource> = new ArrayList<LightSource>();
            for (let e:FastHashMap.Entry<string, RenderObjectHandle> in this.renderObjects) {
                let light:LightSource = e.getValue().getLight();
                if ((light != null)) {
                    lightList.add(light);
                }

            }

            scene.setLightList(lightList.toArray(new Array(lightList.size())));
            this.rebuildLightList = false;
        }

    }

    put(name:string, shader:Shader) {
        this.renderObjects.put(name, new RenderObjectHandle(shader));
    }

    put(name:string, modifier:Modifier) {
        this.renderObjects.put(name, new RenderObjectHandle(modifier));
    }

    put(name:string, primitives:PrimitiveList) {
        this.renderObjects.put(name, new RenderObjectHandle(primitives));
    }

    put(name:string, tesselatable:Tesselatable) {
        this.renderObjects.put(name, new RenderObjectHandle(tesselatable));
    }

    put(name:string, instance:Instance) {
        this.renderObjects.put(name, new RenderObjectHandle(instance));
    }

    put(name:string, light:LightSource) {
        this.renderObjects.put(name, new RenderObjectHandle(light));
    }

    put(name:string, camera:Camera) {
        this.renderObjects.put(name, new RenderObjectHandle(camera));
    }

    put(name:string, options:Options) {
        this.renderObjects.put(name, new RenderObjectHandle(options));
    }

    lookupGeometry(name:string):Geometry {
        if ((name == null)) {
            return null;
        }

        let handle:RenderObjectHandle = this.renderObjects.get(name);
        return (handle == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    lookupInstance(name:string):Instance {
        if ((name == null)) {
            return null;
        }

        let handle:RenderObjectHandle = this.renderObjects.get(name);
        return (handle == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    lookupCamera(name:string):Camera {
        if ((name == null)) {
            return null;
        }

        let handle:RenderObjectHandle = this.renderObjects.get(name);
        return (handle == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    lookupOptions(name:string):Options {
        if ((name == null)) {
            return null;
        }

        let handle:RenderObjectHandle = this.renderObjects.get(name);
        return (handle == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    lookupShader(name:string):Shader {
        if ((name == null)) {
            return null;
        }

        let handle:RenderObjectHandle = this.renderObjects.get(name);
        return (handle == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    lookupModifier(name:string):Modifier {
        if ((name == null)) {
            return null;
        }

        let handle:RenderObjectHandle = this.renderObjects.get(name);
        return (handle == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    lookupLight(name:string):LightSource {
        if ((name == null)) {
            return null;
        }

        let handle:RenderObjectHandle = this.renderObjects.get(name);
        return (handle == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }
}