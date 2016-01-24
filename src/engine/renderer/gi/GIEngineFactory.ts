/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class GIEngineFactory {

    static create(options:Options):GIEngine {
        let type:string = options.getString("gi.engine", null);
        if (((type == null)
            || (type.equals("null") || type.equals("none")))) {
            return null;
        }
        else if (type.equals("ambocc")) {
            return new AmbientOcclusionGIEngine(options);
        }
        else if (type.equals("fake")) {
            return new FakeGIEngine(options);
        }
        else if (type.equals("igi")) {
            return new InstantGI(options);
        }
        else if (type.equals("irr-cache")) {
            return new IrradianceCacheGIEngine(options);
        }
        else if (type.equals("path")) {
            return new PathTracingGIEngine(options);
        }
        else {
            console.log("Unrecognized GI engine type "+type+" - ignoring");
            return null;
        }

    }
}