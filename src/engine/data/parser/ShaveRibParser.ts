/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class ShaveRibParser implements SceneParser {

    public parse(filename: String, api: SunflowAPI): boolean {
        try {
            let p: Parser = new Parser(filename);
            p.checkNextToken("version");
            p.checkNextToken("3.04");
            p.checkNextToken("TransformBegin");
            if (p.peekNextToken("Procedural")) {
                //  read procedural shave rib
                let done: boolean = false;
                while (!done) {
                    p.checkNextToken("DelayedReadArchive");
                    p.checkNextToken("[");
                    let f: String = p.getNextToken();
                    UI.printInfo(Module.USER, "RIB - Reading voxel: \""%s\"" ...", f);
                    api.parse(f);
                    p.checkNextToken("]");
                    while (true) {
                        let t: String = p.getNextToken();
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

            let cubic: boolean = false;
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

            let index: number = 0;
            let done: boolean = false;
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

                let nverts: number[] = this.parseIntArray(p);
                for (let i: number = 1; (i < nverts.length); i++) {
                    if ((nverts[0] != nverts[i])) {
                        UI.printError(Module.USER, "RIB - Found variable number of hair segments");
                        return false;
                    }

                }

                let nhairs: number = nverts.length;
                UI.printInfo(Module.USER, "RIB - Parsed %d hair curves", nhairs);
                api.parameter("segments", (nverts[0] - 1));
                p.checkNextToken("nonperiodic");
                p.checkNextToken("P");
                let points: number[] = this.parseFloatArray(p);
                if ((points.length != (3
                    * (nhairs * nverts[0])))) {
                    UI.printError(Module.USER, "RIB - Invalid number of points - expecting %d - found %d", (nhairs * nverts[0]), (points.length / 3));
                    return false;
                }

                api.parameter("points", "point", "vertex", points);
                UI.printInfo(Module.USER, "RIB - Parsed %d hair vertices", (points.length / 3));
                p.checkNextToken("width");
                let w: number[] = this.parseFloatArray(p);
                if ((w.length
                    != (nhairs * nverts[0]))) {
                    UI.printError(Module.USER, "RIB - Invalid number of hair widths - expecting %d - found %d", (nhairs * nverts[0]), w.length);
                    return false;
                }

                api.parameter("widths", "float", "vertex", w);
                UI.printInfo(Module.USER, "RIB - Parsed %d hair widths", w.length);
                let name: String = String.format("%s[%d]", filename, index);
                UI.printInfo(Module.USER, "RIB - Creating hair object \""%s\"""", name)", api.geometry(name, new Hair()));
                api.instance((name + ".instance"), name);
                UI.printInfo(Module.USER, "RIB - Searching for next curve group ...");
                while (true) {
                    let t: String = p.getNextToken();
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

            UI.printInfo(Module.USER, "RIB - Finished reading rib file");
        }
        catch (e /*:FileNotFoundException*/) {
            UI.printError(Module.USER, "RIB - File not found: %s", filename);
            e.printStackTrace();
            return false;
        }
        catch (e /*:ParserException*/) {
            UI.printError(Module.USER, "RIB - Parser exception: %s", e);
            e.printStackTrace();
            return false;
        }
        catch (e /*:IOException*/) {
            UI.printError(Module.USER, "RIB - I/O exception: %s", e);
            e.printStackTrace();
            return false;
        }

        return true;
    }

    private parseIntArray(p: Parser): number[] {
        let array: IntArray = new IntArray();
        let done: boolean = false;
        for (
            ; !done;
        ) {
            let s: String = p.getNextToken();
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

    private parseFloatArray(p: Parser): number[] {
        let array: FloatArray = new FloatArray();
        let done: boolean = false;
        for (
            ; !done;
        ) {
            let s: String = p.getNextToken();
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