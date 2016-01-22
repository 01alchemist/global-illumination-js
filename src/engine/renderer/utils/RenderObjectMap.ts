/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class RenderObjectMap {

    private renderObjects: FastHashMap<String, RenderObjectHandle>;

    private rebuildInstanceList: boolean;

    private rebuildLightList: boolean;

    enum RenderObjectType {

    UNKNOWN,

    SHADER,

    MODIFIER,

    GEOMETRY,

    INSTANCE,

    LIGHT,

    CAMERA,

    OPTIONS,
}

constructor () {
    this.renderObjects = new FastHashMap<String, RenderObjectHandle>();
    this.rebuildLightList = false;
    this.rebuildInstanceList = false;
}

has(name: String): boolean {
    return this.renderObjects.containsKey(name);
}

remove(name: String) {
    let obj: RenderObjectHandle = this.renderObjects.get(name);
    if ((obj == null)) {
        UI.printWarning(Module.API, "Unable to remove \""%s\"" - object was not defined yet");
        return;
    }

    UI.printDetailed(Module.API, "Removing object \""%s\"""", name)", this.renderObjects.remove(name));
    //  scan through all objects to make sure we don't have any
    //  references to the old object still around
    switch (obj.type) {
        case SHADER:
            let s: Shader = obj.getShader();
            for (let e: FastHashMap.Entry<String, RenderObjectHandle> in this.renderObjects) {
                let i: Instance = e.getValue().getInstance();
                if ((i != null)) {
                    UI.printWarning(Module.API, "Removing shader \""%s\"" from instance \""%s\"""", name, e.getKey())", i.removeShader(s));
                }

            }

            break;
        case MODIFIER:
            let m: Modifier = obj.getModifier();
            for (let e: FastHashMap.Entry<String, RenderObjectHandle> in this.renderObjects) {
                let i: Instance = e.getValue().getInstance();
                if ((i != null)) {
                    UI.printWarning(Module.API, "Removing modifier \""%s\"" from instance \""%s\"""", name, e.getKey())", i.removeModifier(m));
                }

            }

            break;
        case GEOMETRY:
            let g: Geometry = obj.getGeometry();
            for (let e: FastHashMap.Entry<String, RenderObjectHandle> in this.renderObjects) {
                let i: Instance = e.getValue().getInstance();
                if (((i != null)
                    && i.hasGeometry(g))) {
                    UI.printWarning(Module.API, "Removing instance \""%s\"" because it referenced geometry \""%s\"""", e.getKey(), name)", this.remove(e.getKey()));
                }

            }

            break;
            break;
        case INSTANCE:
            this.rebuildInstanceList = true;
            break;
        case LIGHT:
            this.rebuildLightList = true;
            break;
    }

}

update(name: String, pl: ParameterList, api: SunflowAPI): boolean {
    let obj: RenderObjectHandle = this.renderObjects.get(name);
    let success: boolean;
    if ((obj == null)) {
        UI.printError(Module.API, "Unable to update \""%s\"" - object was not defined yet", name);
        success = false;
    }
    else {
        UI.printDetailed(Module.API, "Updating %s object \""%s\"""", obj.typeName(), name)", success=obj.update(pl,apiUnknown);
        if (!success) {
            UI.printError(Module.API, "Unable to update \""%s\"" - removing", name);
            this.remove(name);
        }
        else {
            switch (obj.type) {
                case GEOMETRY:
                case INSTANCE:
                    this.rebuildInstanceList = true;
                    break;
                case LIGHT:
                    this.rebuildLightList = true;
                    break;
            }

        }

    }

    return success;
}

updateScene(scene: Scene) {
    if (this.rebuildInstanceList) {
        UI.printInfo(Module.API, "Building scene instance list for rendering ...");
        let numInstance: number = 0;
        let numInfinite: number = 0;
        for (let e: FastHashMap.Entry<String, RenderObjectHandle> in this.renderObjects) {
            let i: Instance = e.getValue().getInstance();
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

        let infinite: Instance[] = new Array(numInfinite);
        let instance: Instance[] = new Array(numInstance);
        numInstance = 0;
        numInfinite = 0;
        for (let e: FastHashMap.Entry<String, RenderObjectHandle> in this.renderObjects) {
            let i: Instance = e.getValue().getInstance();
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
        let lightList: ArrayList<LightSource> = new ArrayList<LightSource>();
        for (let e: FastHashMap.Entry<String, RenderObjectHandle> in this.renderObjects) {
            let light: LightSource = e.getValue().getLight();
            if ((light != null)) {
                lightList.add(light);
            }

        }

        scene.setLightList(lightList.toArray(new Array(lightList.size())));
        this.rebuildLightList = false;
    }

}

put(name: String, shader: Shader) {
    this.renderObjects.put(name, new RenderObjectHandle(shader));
}

put(name: String, modifier: Modifier) {
    this.renderObjects.put(name, new RenderObjectHandle(modifier));
}

put(name: String, primitives: PrimitiveList) {
    this.renderObjects.put(name, new RenderObjectHandle(primitives));
}

put(name: String, tesselatable: Tesselatable) {
    this.renderObjects.put(name, new RenderObjectHandle(tesselatable));
}

put(name: String, instance: Instance) {
    this.renderObjects.put(name, new RenderObjectHandle(instance));
}

put(name: String, light: LightSource) {
    this.renderObjects.put(name, new RenderObjectHandle(light));
}

put(name: String, camera: Camera) {
    this.renderObjects.put(name, new RenderObjectHandle(camera));
}

put(name: String, options: Options) {
    this.renderObjects.put(name, new RenderObjectHandle(options));
}

lookupGeometry(name: String): Geometry {
    if ((name == null)) {
        return null;
    }

    let handle: RenderObjectHandle = this.renderObjects.get(name);
    return (handle == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

lookupInstance(name: String): Instance {
    if ((name == null)) {
        return null;
    }

    let handle: RenderObjectHandle = this.renderObjects.get(name);
    return (handle == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

lookupCamera(name: String): Camera {
    if ((name == null)) {
        return null;
    }

    let handle: RenderObjectHandle = this.renderObjects.get(name);
    return (handle == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

lookupOptions(name: String): Options {
    if ((name == null)) {
        return null;
    }

    let handle: RenderObjectHandle = this.renderObjects.get(name);
    return (handle == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

lookupShader(name: String): Shader {
    if ((name == null)) {
        return null;
    }

    let handle: RenderObjectHandle = this.renderObjects.get(name);
    return (handle == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

lookupModifier(name: String): Modifier {
    if ((name == null)) {
        return null;
    }

    let handle: RenderObjectHandle = this.renderObjects.get(name);
    return (handle == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

lookupLight(name: String): LightSource {
    if ((name == null)) {
        return null;
    }

    let handle: RenderObjectHandle = this.renderObjects.get(name);
    return (handle == null);
    // TODO: Warning!!!, inline IF is not supported ?
}

/* sealed */ class RenderObjectHandle {

    private obj: RenderObject;

    private type: RenderObjectType;

    private constructor (shader: Shader) {
        this.obj = shader;
        this.type = RenderObjectType.SHADER;
    }

    private constructor (modifier: Modifier) {
        this.obj = modifier;
        this.type = RenderObjectType.MODIFIER;
    }

    private constructor (tesselatable: Tesselatable) {
        this.obj = new Geometry(tesselatable);
        this.type = RenderObjectType.GEOMETRY;
    }

    private constructor (prims: PrimitiveList) {
        this.obj = new Geometry(prims);
        this.type = RenderObjectType.GEOMETRY;
    }

    private constructor (instance: Instance) {
        this.obj = instance;
        this.type = RenderObjectType.INSTANCE;
    }

    private constructor (light: LightSource) {
        this.obj = light;
        this.type = RenderObjectType.LIGHT;
    }

    private constructor (camera: Camera) {
        this.obj = camera;
        this.type = RenderObjectType.CAMERA;
    }

    private constructor (options: Options) {
        this.obj = options;
        this.type = RenderObjectType.OPTIONS;
    }

    private update(pl: ParameterList, api: SunflowAPI): boolean {
        return this.obj.update(pl, api);
    }

    private typeName(): String {
        return this.type.name().toLowerCase();
    }

    private getShader(): Shader {
        return (this.type == RenderObjectType.SHADER);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    private getModifier(): Modifier {
        return (this.type == RenderObjectType.MODIFIER);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    private getGeometry(): Geometry {
        return (this.type == RenderObjectType.GEOMETRY);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    private getInstance(): Instance {
        return (this.type == RenderObjectType.INSTANCE);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    private getLight(): LightSource {
        return (this.type == RenderObjectType.LIGHT);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    private getCamera(): Camera {
        return (this.type == RenderObjectType.CAMERA);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    private getOptions(): Options {
        return (this.type == RenderObjectType.OPTIONS);
        // TODO: Warning!!!, inline IF is not supported ?
    }
}
}