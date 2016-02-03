import {Hair} from "../../primitive/Hair";
import {Parser} from "angular2/src/core/change_detection/parser/parser";
import {IntArray} from "../../utils/IntArray";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ShaveRibParser implements SceneParser {

    parse(filename:string, api:GlobalIlluminationAPI):boolean {
        try {
            let p:Parser = new Parser(filename);
            p.checkNextToken("version");
            p.checkNextToken("3.04");
            p.checkNextToken("TransformBegin");
            if (p.peekNextToken("Procedural")) {
                //  read procedural shave rib
                let done:boolean = false;
                while (!done) {
                    p.checkNextToken("DelayedReadArchive");
                    p.checkNextToken("[");
                    let f:string = p.getNextToken();
                    console.log("RIB - Reading voxel:\""+f+"\" ...");
                    api.parse(f);
                    p.checkNextToken("]");
                    while (true) {
                        let t:string = p.getNextToken();
                        if (((t == null)
                            || t.equals("TransformEnd"))) {
                            done = true;
                            break;
                        }
                        else if (t.equals("Procedural")) {
                            break;
                        }

                    }

                }

                return true;
            }

            let cubic:boolean = false;
            if (p.peekNextToken("Basis")) {
                cubic = true;
                //  u basis
                p.checkNextToken("catmull-rom");
                p.checkNextToken("1");
                //  v basis
                p.checkNextToken("catmull-rom");
                p.checkNextToken("1");
            }

            while (p.peekNextToken("Declare")) {
                p.getNextToken();
                //  name
                p.getNextToken();
                //  interpolation & type
            }

            let index:number = 0;
            let done:boolean = false;
            p.checkNextToken("Curves");
            for (
                ; !done;
            ) {
                if (cubic) {
                    p.checkNextToken("cubic");
                }
                else {
                    p.checkNextToken("linear");
                }

                let nverts:number[] = this.parseIntArray(p);
                for (let i:number = 1; (i < nverts.length); i++) {
                    if ((nverts[0] != nverts[i])) {
                        console.error(Module.USER, "RIB - Found variable number of hair segments");
                        return false;
                    }

                }

                let nhairs:number = nverts.length;
                console.log("RIB - Parsed %d hair curves", nhairs);
                api.parameter("segments", (nverts[0] - 1));
                p.checkNextToken("nonperiodic");
                p.checkNextToken("P");
                let points:number[] = this.parseFloatArray(p);
                if ((points.length != (3
                    * (nhairs * nverts[0])))) {
                    console.error(Module.USER, "RIB - Invalid number of points - expecting %d - found %d", (nhairs * nverts[0]), (points.length / 3));
                    return false;
                }

                api.parameter("points", "point", "vertex", points);
                console.log("RIB - Parsed %d hair vertices", (points.length / 3));
                p.checkNextToken("width");
                let w:number[] = this.parseFloatArray(p);
                if ((w.length
                    != (nhairs * nverts[0]))) {
                    console.error(Module.USER, "RIB - Invalid number of hair widths - expecting %d - found %d", (nhairs * nverts[0]), w.length);
                    return false;
                }

                api.parameter("widths", "float", "vertex", w);
                console.log("RIB - Parsed %d hair widths", w.length);
                let name:string = String.format("%s[%d]", filename, index);
                console.log("RIB - Creating hair object \""+name+"\"")
                api.geometry(name, new Hair());
                api.instance((name + ".instance"), name);
                console.log("RIB - Searching for next curve group ...");
                while (true) {
                    let t:string = p.getNextToken();
                    if (((t == null)
                        || t.equals("TransformEnd"))) {
                        done = true;
                        break;
                    }
                    else if (t.equals("Curves")) {
                        break;
                    }

                }

                index++;
            }

            console.log("RIB - Finished reading rib file");
        }
        catch (e) {
            //console.error("RIB - File not found:%s", filename);
            console.error("RIB - Parser exception");
            console.error(e);
            return false;
        }

        return true;
    }

    private parseIntArray(p:Parser):number[] {
        let array:IntArray = new IntArray();
        let done:boolean = false;
        for (
            ; !done;
        ) {
            let s:string = p.getNextToken();
            if (s.startsWith("[")) {
                s = s.substring(1);
            }

            if (s.endsWith("]")) {
                s = s.substring(0, (s.length() - 1));
                done = true;
            }

            array.add(Integer.parseInt(s));
        }

        return array.trim();
    }

    private parseFloatArray(p:Parser):number[] {
        let array:FloatArray = new FloatArray();
        let done:boolean = false;
        for (
            ; !done;
        ) {
            let s:string = p.getNextToken();
            if (s.startsWith("[")) {
                s = s.substring(1);
            }

            if (s.endsWith("]")) {
                s = s.substring(0, (s.length() - 1));
                done = true;
            }

            array.add(Float.parseFloat(s));
        }

        return array.trim();
    }
}