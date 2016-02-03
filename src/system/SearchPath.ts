/**
 * Created by Nidin Vinayakan on 3/2/2016.
 */
export class SearchPath {

    private searchPath:string[];
    private type:string;

    public constructor(type:string) {
        this.type = type;
        this.searchPath = [];
    }

    resetSearchPath() {
        this.searchPath.clear();
    }

    addSearchPath(path:string) {
        var f:HttpFile = new HttpFile(path, true);

        f.exists().then(function () {

        }).catch(function (e) {
            console.error("Invalid " + type + " search path specification: \"" + path + "\" - invalid directory");
        })

        if (&&
        f.isDirectory()
    )
        {
            try {

                if (this.searchPath.indexOf(path) == -1) {
                    console.log("Adding " + type + " search path: \"" + path + "\"");
                    this.searchPath.push(path);
                }

            } catch (e) {
                console.error("Invalid " + type + " search path specification: \"" + path + "\"");
                console.log(e);
            }
        }
    else

    }

    resolvePath(filename:string):string {
        // account for relative naming schemes from 3rd party softwares
        if (filename.startsWith("//")) {
            filename = filename.substring(2);
        }
        console.log("Resolving " + type + " path \"" + filename + "\" ...");
        var f:HttpFile = new HttpFile(filename);
        if (!f.isAbsolute()) {

            searchPath.forEach(function (prefix:string) {
                console.log("  * searching: \"" + prefix + "\" ...");
                if (prefix.endsWith(File.separator) || filename.startsWith(File.separator))
                    f = new HttpFile(prefix + filename);
                else
                    f = new HttpFile(prefix + File.separator + filename);
                if (f.exists()) {
                    // suggested path exists - try it
                    return f.getAbsolutePath();
                }
            });
        }
        // file was not found in the search paths - return the filename itself
        return filename;
    }
}