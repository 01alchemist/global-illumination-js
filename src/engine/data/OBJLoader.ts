import {Mesh} from "../scene/shapes/Mesh";
import {Material} from "../scene/materials/Material";
import {Vector3} from "../math/Vector3";
import {Triangle} from "../scene/shapes/Triangle";
import {append} from "../utils/MapUtils";
import {Color} from "../math/Color";
import {Texture} from "../scene/materials/Texture";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class OBJLoader {

    parentMaterial:Material;
    lastMesh:Mesh;
    materials:Map;

    constructor() {

    }

    load(url:string, onLoad:Function):Mesh {
        console.log("Loading OBJ:" + url);
        var self = this;
        var xhr:XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            self.lastMesh = self.loadOBJ(xhr.response);
            if(onLoad){
                onLoad(self.lastMesh);
            }
        };
        xhr.send(null);
        return null;
    }

    static parseIndex(value:string, length:number):number {
        var n = parseInt(value);
        if (n < 0) {
            n += length;
        }
        return n;
    }

    static getEntry(line:string):{keyword:string, value:string[]} {
        var _str = line.match(/^(\S+)\s(.*)/).slice(1);
        return {
            keyword: _str[0],
            value: _str[1].split(/ {1,}/)
        };
    }

    static parseFloats(fs:string[]):number[] {
        var floats:number[] = [];
        fs.forEach(function (f:string) {
            floats.push(parseFloat(f));
        });
        return floats;
    }

    loadOBJ(data:string):Mesh {

        var vs:Vector3[] = [null]; //1024 // 1-based indexing
        var vts:Vector3[] = [null]; // 1-based indexing
        var vns:Vector3[] = [null]; // 1-based indexing
        var triangles:Triangle[];
        this.materials = new Map();//make(map[string]*Material)
        var material:Material = this.parentMaterial;
        var lines = data.split("\n");

        for (var i = 0; i < lines.length; i++) {
            let line:string = lines[i];
            if (line.length == 0) {
                continue;
            }
            let item = OBJLoader.getEntry(line);
            let f:number[];
            let v:Vector3;

            switch (item.keyword) {
                case "mtllib":
                    var path:string = item.value[0];
                    this.loadMTL(p, parent, materials);
                    break;

                case "usemtl":
                    material = this.getMaterial(item.value[0]);
                    break;

                case "v":
                    f = OBJLoader.parseFloats(item.value);
                    v = new Vector3(f[0], f[1], f[2]);
                    vs = append(vs, v);
                    break;

                case "vt":
                    f = OBJLoader.parseFloats(item.value);
                    v = new Vector3(f[0], f[1], 0);
                    vts = append(vts, v);
                    break;

                case "vn":
                    f = OBJLoader.parseFloats(item.value);
                    v = new Vector3(f[0], f[1], f[2]);
                    vns = append(vns, v);
                    break;

                case "f":
                    var fvs:number[] = [];
                    var fvts:number[] = [];
                    var fvns:number[] = [];

                    item.value.forEach(function (str:string, i) {
                        let vertex:string[] = str.split(/\/\/{1,}/);
                        fvs[i] = OBJLoader.parseIndex(vertex[0], vs.length);
                        fvts[i] = OBJLoader.parseIndex(vertex[1], vts.length);
                        fvns[i] = OBJLoader.parseIndex(vertex[2], vns.length);
                    });

                    for (let i:number = 1; i < fvs.length - 1; i++) {
                        let i1 = 0;
                        let i2 = i;
                        let i3 = i + 1;
                        let t:Triangle = new Triangle();
                        t.material = material;
                        t.v1 = vs[fvs[i1]];
                        t.v2 = vs[fvs[i2]];
                        t.v3 = vs[fvs[i3]];
                        t.t1 = vts[fvts[i1]];
                        t.t2 = vts[fvts[i2]];
                        t.t3 = vts[fvts[i3]];
                        t.n1 = vns[fvns[i1]];
                        t.n2 = vns[fvns[i2]];
                        t.n3 = vns[fvns[i3]];
                        t.updateBox();
                        t.fixNormals();
                        triangles = append(triangles, t);
                    }
                    break;
            }
        }
        return Mesh.newMesh(triangles);
    }
    getMaterial(index:string):Material{
        if(this.materials[index] == undefined){
            var material:Material = new Material();
            this.materials[index] = material;
            return material;
        }else{
            return this.materials[index];
        }
    }
    loadMTL(url:string, parent:Material, materials:Map<string,Material>) {

        console.log("Loading MTL:" + url);
        var self = this;
        var xhr:XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            var lines = xhr.response.split("\n");

            for (var i = 0; i < lines.length; i++) {
                let line:string = lines[i];
                if (line.length == 0) {
                    continue;
                }
                let item = OBJLoader.getEntry(line);
                var material:Material;
                switch(item.keyword){
                    case "newmtl":
                        material = self.materials[item.value[0]];
                        material = material?material:new Material();
                        self.materials[item.value[0]] = material;
                        break;
                    case "Kd":
                        var c:number[] = OBJLoader.parseFloats(item.value);
                        material.color = new Color(c[0], c[1], c[2]);
                        break;
                    case "map_Kd":
                        material.texture = Texture.getTexture(item.value[0]);
                        break;
                }
            }
        };
        xhr.send(null);
        return null;


    }
}
