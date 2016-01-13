import {Mesh} from "../scene/shapes/Mesh";
import {Material} from "../scene/materials/Material";
import {Vector3} from "../math/Vector3";
import {Triangle} from "../scene/shapes/Triangle";
import {append} from "../utils/MapUtils";
/**
 * Created by Nidin Vinayakan on 11-01-2016.
 */
export class RayLXOLoader {

    parentMaterial:Material;
    lastMesh:Mesh;

    constructor() {

    }

    load(url:string, onLoad:Function):Mesh {
        console.log("Loading LXO:" + url);
        var self = this;
        var xhr:XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            self.lastMesh = self.loadLXOData(xhr.response);
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

    loadLXOData(data:any):Mesh {
        return null;
    }
    loadLXO(data:any):Mesh {
        return null;
        /*var vs:Vector3[] = [null]; //1024 // 1-based indexing
        var vts:Vector3[] = [null]; // 1-based indexing
        var vns:Vector3[] = [null]; // 1-based indexing
        var triangles:Triangle[];
        var materials:Map = new Map();//make(map[string]*Material)
        var material:Material = this.parentMaterial;



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

        return Mesh.newMesh(triangles);*/
    }

    loadMTL(url:string, parent:Material, materials:Map<string,Material>) {
        console.log("Loading MTL:" + url);
        /*file, err := os.Open(path)
         if err != nil {
         return err
         }
         defer file.Close()
         scanner := bufio.NewScanner(file)
         parentCopy := parent
         material := &parentCopy
         for scanner.Scan() {
         line := scanner.Text()
         fields := strings.Fields(line)
         if len(fields) == 0 {
         continue
         }
         keyword := fields[0]
         args := fields[1:]
         switch keyword {
         case "newmtl":
         parentCopy := parent
         material = &parentCopy
         materials[args[0]] = material
         case "Kd":
         c := ParseFloats(args)
         material.Color = Color{c[0], c[1], c[2]}
         case "map_Kd":
         p := RelativePath(path, args[0])
         material.Texture = GetTexture(p)
         }
         }
         return scanner.Err()*/
    }
}
