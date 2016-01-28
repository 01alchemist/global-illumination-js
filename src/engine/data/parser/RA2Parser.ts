import {GlobalIlluminationAPI} from "../../GlobalIlluminatiionAPI";
import {SceneParser} from "../../core/SceneParser";
import {TriangleMesh} from "../../primitive/TriangleMesh";
import {SimpleShader} from "../../shader/SimpleShader";
import {Parser} from "angular2/src/core/change_detection/parser/parser";
import {Point3} from "../../math/Point3";
import {Vector3} from "../../math/Vector3";
import {PinholeLens} from "../../camera/PinholeLens";
/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class RA2Parser implements SceneParser {

    parse(filename:string, api:GlobalIlluminationAPI):boolean {
        try {
            console.log("RA2 - Reading geometry:"+filename+" ...");
            let file:File = new File(filename);
            let stream:FileInputStream = new FileInputStream(filename);
            let map:MappedByteBuffer = stream.getChannel().map(FileChannel.MapMode.READ_ONLY, 0, file.length());
            map.order(ByteOrder.LITTLE_ENDIAN);
            let buffer:FloatBuffer = map.asFloatBuffer();
            let data:number[] = new Array(buffer.capacity());
            for (let i:number = 0; (i < data.length); i++) {
                data[i] = buffer.get(i);
            }

            stream.close();
            api.parameter("points", "point", "vertex", data);
            let triangles:number[] = new Array((3
            * (data.length / 9)));
            for (let i:number = 0; (i < triangles.length); i++) {
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
        catch (e) {
            console.log(e);
            return false;
        }

        try {
            filename = filename.replace(".ra2", ".txt");
            console.log("RA2 - Reading camera  :"+filename+" ...");
            let p:Parser = new Parser(filename);
            let eye:Point3 = new Point3();
            eye.x = p.getNextFloat();
            eye.y = p.getNextFloat();
            eye.z = p.getNextFloat();
            let to:Point3 = new Point3();
            to.x = p.getNextFloat();
            to.y = p.getNextFloat();
            to.z = p.getNextFloat();
            let up:Vector3 = new Vector3();
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
                    console.warn(Module.USER, "RA2 - Invalid up vector specification - using Z axis");
                    up.set(0, 0, 1);
                    break;
            }

            api.parameter("eye", eye);
            api.parameter("target", to);
            api.parameter("up", up);
            let name:string = api.getUniqueName("camera");
            api.parameter("fov", 80);
            api.camera(name, new PinholeLens());
            api.parameter("camera", name);
            api.parameter("resolutionX", 1024);
            api.parameter("resolutionY", 1024);
            api.options(GlobalIlluminationAPI.DEFAULT_OPTIONS);
            p.close();
        }
        catch (e) {
            console.warn("RA2 - Camera file not found");
        }

        return true;
    }
}