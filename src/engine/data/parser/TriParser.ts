/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class TriParser implements SceneParser {

    parse(filename:string, api:GlobalIlluminationAPI):boolean {
        try {
            UI.printInfo(Module.USER, "TRI - Reading geometry:\""%s\"" ...", filename);
            let p:Parser = new Parser(filename);
            let verts:number[] = new Array((3 * p.getNextInt()));
            for (let v:number = 0; (v < verts.length); v += 3) {
                verts[(v + 0)] = p.getNextFloat();
                verts[(v + 1)] = p.getNextFloat();
                verts[(v + 2)] = p.getNextFloat();
                p.getNextToken();
                p.getNextToken();
            }

            let triangles:number[] = new Array((p.getNextInt() * 3));
            for (let t:number = 0; (t < triangles.length); t += 3) {
                triangles[(t + 0)] = p.getNextInt();
                triangles[(t + 1)] = p.getNextInt();
                triangles[(t + 2)] = p.getNextInt();
            }

            //  create geometry
            api.parameter("triangles", triangles);
            api.parameter("points", "point", "vertex", verts);
            api.geometry(filename, new TriangleMesh());
            //  create shader
            api.shader((filename + ".shader"), new SimpleShader());
            api.parameter("shaders", (filename + ".shader"));
            //  create instance
            api.instance((filename + ".instance"), filename);
            p.close();
            //  output to ra3 format
            let stream:RandomAccessFile = new RandomAccessFile(filename.replace(".tri", ".ra3"), "rw");
            let map:MappedByteBuffer = stream.getChannel().map(MapMode.READ_WRITE, 0, (8 + (4
            * (verts.length + triangles.length))));
            map.order(ByteOrder.LITTLE_ENDIAN);
            let ints:IntBuffer = map.asIntBuffer();
            let floats:FloatBuffer = map.asFloatBuffer();
            ints.put(0, (verts.length / 3));
            ints.put(1, (triangles.length / 3));
            for (let i:number = 0; (i < verts.length); i++) {
                floats.put((2 + i), verts[i]);
            }

            for (let i:number = 0; (i < triangles.length); i++) {
                ints.put((2
                + (verts.length + i)), triangles[i]);
            }

            stream.close();
        }
        catch (e /*:FileNotFoundException*/) {
            e.printStackTrace();
            return false;
        }
        catch (e /*:IOException*/) {
            e.printStackTrace();
            return false;
        }

        return true;
    }
}