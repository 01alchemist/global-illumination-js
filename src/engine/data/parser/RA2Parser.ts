/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class RA2Parser implements SceneParser {

    public parse(filename: String, api: SunflowAPI): boolean {
        try {
            UI.printInfo(Module.USER, "RA2 - Reading geometry: \""%s\"" ...", filename);
            let file: File = new File(filename);
            let stream: FileInputStream = new FileInputStream(filename);
            let map: MappedByteBuffer = stream.getChannel().map(FileChannel.MapMode.READ_ONLY, 0, file.length());
            map.order(ByteOrder.LITTLE_ENDIAN);
            let buffer: FloatBuffer = map.asFloatBuffer();
            let data: number[] = new Array(buffer.capacity());
            for (let i: number = 0; (i < data.length); i++) {
                data[i] = buffer.get(i);
            }

            stream.close();
            api.parameter("points", "point", "vertex", data);
            let triangles: number[] = new Array((3
            * (data.length / 9)));
            for (let i: number = 0; (i < triangles.length); i++) {
                triangles[i] = i;
            }

            //  create geo
            api.parameter("triangles", triangles);
            api.geometry(filename, new TriangleMesh());
            //  create shader
            api.shader((filename + ".shader"), new SimpleShader());
            //  create instance
            api.parameter("shaders", (filename + ".shader"));
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

        try {
            filename = filename.replace(".ra2", ".txt");
            UI.printInfo(Module.USER, "RA2 - Reading camera  : \""%s\"" ...", filename);
            let p: Parser = new Parser(filename);
            let eye: Point3 = new Point3();
            eye.x = p.getNextFloat();
            eye.y = p.getNextFloat();
            eye.z = p.getNextFloat();
            let to: Point3 = new Point3();
            to.x = p.getNextFloat();
            to.y = p.getNextFloat();
            to.z = p.getNextFloat();
            let up: Vector3 = new Vector3();
            switch (p.getNextInt()) {
                case 0:
                    up.set(1, 0, 0);
                    break;
                case 1:
                    up.set(0, 1, 0);
                    break;
                case 2:
                    up.set(0, 0, 1);
                    break;
                default:
                    UI.printWarning(Module.USER, "RA2 - Invalid up vector specification - using Z axis");
                    up.set(0, 0, 1);
                    break;
            }

            api.parameter("eye", eye);
            api.parameter("target", to);
            api.parameter("up", up);
            let name: String = api.getUniqueName("camera");
            api.parameter("fov", 80);
            api.camera(name, new PinholeLens());
            api.parameter("camera", name);
            api.parameter("resolutionX", 1024);
            api.parameter("resolutionY", 1024);
            api.options(SunflowAPI.DEFAULT_OPTIONS);
            p.close();
        }
        catch (e /*:FileNotFoundException*/) {
            UI.printWarning(Module.USER, "RA2 - Camera file not found");
        }
        catch (e /*:IOException*/) {
            e.printStackTrace();
            return false;
        }

        return true;
    }
}