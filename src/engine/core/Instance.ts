import {Matrix4} from "../math/Matrix4";
import {Vector3} from "../math/Vector3";
import {Point3} from "../math/Point3";
import {Modifier} from "./Modifier";
import {PrimitiveList} from "./PrimitiveList";
import {Geometry} from "./Geometry";
import {ShadingState} from "./ShadingState";
import {Ray} from "./Ray";
import {IntersectionState} from "./IntersectionState";
import {BoundingBox} from "../math/BoundingBox";
import {Shader} from "./Shader";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Instance implements RenderObject {

    private o2w:Matrix4;

    private w2o:Matrix4;

    private bounds:BoundingBox;

    private geometry:Geometry;

    private shaders:Shader[];

    private modifiers:Modifier[];

    update(pl:ParameterList, api:GlobalIlluminationAPI):boolean {
        let geometryName:string = pl.getString("geometry", null);
        if (((this.geometry == null)
            || (geometryName != null))) {
            if ((geometryName == null)) {
                console.error("GEOM", "geometry parameter missing - unable to create instance");
                return false;
            }

            this.geometry = api.lookupGeometry(geometryName);
            if ((this.geometry == null)) {
                console.error("GEOM  Geometry " + geometryName + " was not declared yet - instance is invalid");
                return false;
            }

        }

        let shaderNames:string[] = pl.getStringArray("shaders", null);
        if ((shaderNames != null)) {
            //  new shader names have been provided
            this.shaders = new Array(shaderNames.length);
            for (let i:number = 0; (i < this.shaders.length); i++) {
                this.shaders[i] = api.lookupShader(shaderNames[i]);
                if ((this.shaders[i] == null)) {
                    console.warn("GEOM", "Shader " + shaderNames[i] + " was not declared yet - ignoring");
                }
            }
        }
        else {
            //  re-use existing shader array
        }

        let modifierNames:string[] = pl.getStringArray("modifiers", null);
        if ((modifierNames != null)) {
            //  new modifier names have been provided
            this.modifiers = new Array(modifierNames.length);
            for (let i:number = 0; (i < this.modifiers.length); i++) {
                this.modifiers[i] = api.lookupModifier(modifierNames[i]);
                if ((this.modifiers[i] == null)) {
                    console.warn("GEOM", "Modifier " + modifierNames[i] + " was not declared yet - ignoring");
                }
            }
        }

        let transform:Matrix4 = pl.getMatrix("transform", this.o2w);
        if ((transform != this.o2w)) {
            this.o2w = transform;
            if ((this.o2w != null)) {
                this.w2o = this.o2w.inverse();
                if ((this.w2o == null)) {
                    console.error("GEOM", "Unable to compute transform inverse - determinant is:" + this.o2w.determinant());
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

    updateBounds() {
        this.bounds = this.geometry.getWorldBounds(this.o2w);
    }

    hasGeometry(g:Geometry):boolean {
        return (this.geometry == g);
    }

    removeShader(s:Shader) {
        if ((this.shaders != null)) {
            for (let i:number = 0; (i < this.shaders.length); i++) {
                if ((this.shaders[i] == s)) {
                    this.shaders[i] = null;
                }

            }

        }

    }

    removeModifier(m:Modifier) {
        if ((this.modifiers != null)) {
            for (let i:number = 0; (i < this.modifiers.length); i++) {
                if ((this.modifiers[i] == m)) {
                    this.modifiers[i] = null;
                }

            }

        }

    }

    getBounds():BoundingBox {
        return this.bounds;
    }

    getNumPrimitives():number {
        return this.geometry.getNumPrimitives();
    }

    intersect(r:Ray, state:IntersectionState) {
        let localRay:Ray = r.transform(this.w2o);
        state.current = this;
        this.geometry.intersect(localRay, state);
        //  FIXME:transfer max distance to current ray
        r.setMax(localRay.getMax());
    }

    prepareShadingState(state:ShadingState) {
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

    getShader(i:number):Shader {
        if (((this.shaders == null)
            || ((i < 0)
            || (i >= this.shaders.length)))) {
            return null;
        }

        return this.shaders[i];
    }

    getModifier(i:number):Modifier {
        if (((this.modifiers == null)
            || ((i < 0)
            || (i >= this.modifiers.length)))) {
            return null;
        }

        return this.modifiers[i];
    }

    transformObjectToWorld(p:Point3):Point3 {
        return (this.o2w == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    transformWorldToObject(p:Point3):Point3 {
        return (this.o2w == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    transformNormalObjectToWorld(n:Vector3):Vector3 {
        return (this.o2w == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    transformNormalWorldToObject(n:Vector3):Vector3 {
        return (this.o2w == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    transformVectorObjectToWorld(v:Vector3):Vector3 {
        return (this.o2w == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    transformVectorWorldToObject(v:Vector3):Vector3 {
        return (this.o2w == null);
        // TODO:Warning!!!, inline IF is not supported ?
    }

    getBakingPrimitives():PrimitiveList {
        return this.geometry.getBakingPrimitives();
    }

    getGeometry():Geometry {
        return this.geometry;
    }
}