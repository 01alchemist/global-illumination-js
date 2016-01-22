/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class RA3Parser implements SceneParser {

    public parse(filename: String, api: SunflowAPI): boolean {
        try {
            UI.printInfo(Module.USER, "RA3 - Reading geometry: \""%s\"" ...", filename);
            let file: File = new File(filename);
            let stream: FileInputStream = new FileInputStream(filename);
            let map: MappedByteBuffer = stream.getChannel().map(FileChannel.MapMode.READ_ONLY, 0, file.length());
            map.order(ByteOrder.LITTLE_ENDIAN);
            let ints: IntBuffer = map.asIntBuffer();
            let buffer: FloatBuffer = map.asFloatBuffer();
            let numVerts: number = ints.get(0);
            let numTris: number = ints.get(1);
            UI.printInfo(Module.USER, "RA3 -   * Reading %d vertices ...", numVerts);
            let verts: number[] = new Array((3 * numVerts));
            for (let i: number = 0; (i < verts.length); i++) {
                verts[i] = buffer.get((2 + i));
            }

            UI.printInfo(Module.USER, "RA3 -   * Reading %d triangles ...", numTris);
            let tris: number[] = new Array((3 * numTris));
            for (let i: number = 0; (i < tris.length); i++) {
                tris[i] = ints.get((2
                + (verts.length + i)));
            }

            stream.close();
            UI.printInfo(Module.USER, "RA3 -   * Creating mesh ...");
            //  create geometry
            api.parameter("triangles", tris);
            api.parameter("points", "point", "vertex", verts);
            api.geometry(filename, new TriangleMesh());
            //  create shader
            let s: Shader = api.lookupShader("ra3shader");
            if ((s == null)) {
                //  create default shader
                api.shader((filename + ".shader"), new SimpleShader());
                api.parameter("shaders", (filename + ".shader"));
            }
            else {
                //  reuse existing shader
                api.parameter("shaders", "ra3shader");
            }

            //  create instance
            api.instance((filename + ".instance"), filename);
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