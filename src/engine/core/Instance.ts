/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Instance implements RenderObject {

    private o2w: Matrix4;

    private w2o: Matrix4;

    private bounds: BoundingBox;

    private geometry: Geometry;

    private shaders: Shader[];

    private modifiers: Modifier[];

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let geometryName: String = pl.getString("geometry", null);
        if (((this.geometry == null)
            || (geometryName != null))) {
            if ((geometryName == null)) {
                UI.printError(Module.GEOM, "geometry parameter missing - unable to create instance");
                return false;
            }

            this.geometry = api.lookupGeometry(geometryName);
            if ((this.geometry == null)) {
                UI.printError(Module.GEOM, "Geometry \""%s\"" was not declared yet - instance is invalid", geometryName);
                return false;
            }

        }

        let shaderNames: String[] = pl.getStringArray("shaders", null);
        if ((shaderNames != null)) {
            //  new shader names have been provided
            this.shaders = new Array(shaderNames.length);
            for (let i: number = 0; (i < this.shaders.length); i++) {
                this.shaders[i] = api.lookupShader(shaderNames[i]);
                if ((this.shaders[i] == null)) {
                    UI.printWarning(Module.GEOM, "Shader \""%s\"" was not declared yet - ignoring", shaderNames[i]);
                }

            }

        }
        else {
            //  re-use existing shader array
        }

        let modifierNames: String[] = pl.getStringArray("modifiers", null);
        if ((modifierNames != null)) {
            //  new modifier names have been provided
            this.modifiers = new Array(modifierNames.length);
            for (let i: number = 0; (i < this.modifiers.length); i++) {
                this.modifiers[i] = api.lookupModifier(modifierNames[i]);
                if ((this.modifiers[i] == null)) {
                    UI.printWarning(Module.GEOM, "Modifier \""%s\"" was not declared yet - ignoring", modifierNames[i]);
                }

            }

        }

        let transform: Matrix4 = pl.getMatrix("transform", this.o2w);
        if ((transform != this.o2w)) {
            this.o2w = transform;
            if ((this.o2w != null)) {
                this.w2o = this.o2w.inverse();
                if ((this.w2o == null)) {
                    UI.printError(Module.GEOM, "Unable to compute transform inverse - determinant is: %g", this.o2w.determinant());
                    return false;
                }

            }
            else {
                this.w2o = null;
            }

            this.o2w = null;
        }

        return true;
    }

    public updateBounds() {
        this.bounds = this.geometry.getWorldBounds(this.o2w);
    }

    public hasGeometry(g: Geometry): boolean {
        return (this.geometry == g);
    }

    public removeShader(s: Shader) {
        if ((this.shaders != null)) {
            for (let i: number = 0; (i < this.shaders.length); i++) {
                if ((this.shaders[i] == s)) {
                    this.shaders[i] = null;
                }

            }

        }

    }

    public removeModifier(m: Modifier) {
        if ((this.modifiers != null)) {
            for (let i: number = 0; (i < this.modifiers.length); i++) {
                if ((this.modifiers[i] == m)) {
                    this.modifiers[i] = null;
                }

            }

        }

    }

    public getBounds(): BoundingBox {
        return this.bounds;
    }

    getNumPrimitives(): number {
        return this.geometry.getNumPrimitives();
    }

    intersect(r: Ray, state: IntersectionState) {
        let localRay: Ray = r.transform(this.w2o);
        state.current = this;
        this.geometry.intersect(localRay, state);
        //  FIXME: transfer max distance to current ray
        r.setMax(localRay.getMax());
    }

    public prepareShadingState(state: ShadingState) {
        this.geometry.prepareShadingState(state);
        if (((state.getNormal() != null)
            && (state.getGeoNormal() != null))) {
            state.correctShadingNormal();
        }

        //  run modifier if it was provided
        if ((state.getModifier() != null)) {
            state.getModifier().modify(state);
        }

    }

    public getShader(i: number): Shader {
        if (((this.shaders == null)
            || ((i < 0)
            || (i >= this.shaders.length)))) {
            return null;
        }

        return this.shaders[i];
    }

    public getModifier(i: number): Modifier {
        if (((this.modifiers == null)
            || ((i < 0)
            || (i >= this.modifiers.length)))) {
            return null;
        }

        return this.modifiers[i];
    }

    public transformObjectToWorld(p: Point3): Point3 {
        return (this.o2w == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public transformWorldToObject(p: Point3): Point3 {
        return (this.o2w == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public transformNormalObjectToWorld(n: Vector3): Vector3 {
        return (this.o2w == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public transformNormalWorldToObject(n: Vector3): Vector3 {
        return (this.o2w == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public transformVectorObjectToWorld(v: Vector3): Vector3 {
        return (this.o2w == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    public transformVectorWorldToObject(v: Vector3): Vector3 {
        return (this.o2w == null);
        // TODO: Warning!!!, inline IF is not supported ?
    }

    getBakingPrimitives(): PrimitiveList {
        return this.geometry.getBakingPrimitives();
    }

    getGeometry(): Geometry {
        return this.geometry;
    }
}