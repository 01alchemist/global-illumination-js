System.register(["../scene/shapes/Mesh", "../math/Vector3", "../scene/shapes/Triangle", "../utils/MapUtils"], function(exports_1) {
    var Mesh_1, Vector3_1, Triangle_1, MapUtils_1;
    var OBJLoader;
    return {
        setters:[
            function (Mesh_1_1) {
                Mesh_1 = Mesh_1_1;
            },
            function (Vector3_1_1) {
                Vector3_1 = Vector3_1_1;
            },
            function (Triangle_1_1) {
                Triangle_1 = Triangle_1_1;
            },
            function (MapUtils_1_1) {
                MapUtils_1 = MapUtils_1_1;
            }],
        execute: function() {
            OBJLoader = (function () {
                function OBJLoader() {
                }
                OBJLoader.prototype.load = function (url, onLoad) {
                    console.log("Loading OBJ:" + url);
                    var self = this;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.onload = function () {
                        self.lastMesh = self.loadOBJ(xhr.response);
                        if (onLoad) {
                            onLoad(self.lastMesh);
                        }
                    };
                    xhr.send(null);
                    return null;
                };
                OBJLoader.parseIndex = function (value, length) {
                    var n = parseInt(value);
                    if (n < 0) {
                        n += length;
                    }
                    return n;
                };
                OBJLoader.getEntry = function (line) {
                    var _str = line.match(/^(\S+)\s(.*)/).slice(1);
                    return {
                        keyword: _str[0],
                        value: _str[1].split(/ {1,}/)
                    };
                };
                OBJLoader.parseFloats = function (fs) {
                    var floats = [];
                    fs.forEach(function (f) {
                        floats.push(parseFloat(f));
                    });
                    return floats;
                };
                OBJLoader.prototype.loadOBJ = function (data) {
                    var vs = [null];
                    var vts = [null];
                    var vns = [null];
                    var triangles;
                    var materials = new Map();
                    var material = this.parentMaterial;
                    var lines = data.split("\n");
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        if (line.length == 0) {
                            continue;
                        }
                        var item = OBJLoader.getEntry(line);
                        var f = void 0;
                        var v = void 0;
                        switch (item.keyword) {
                            case "mtllib":
                                var path = item.value[0];
                                this.loadMTL(p, parent, materials);
                                break;
                            case "usemtl":
                                break;
                            case "v":
                                f = OBJLoader.parseFloats(item.value);
                                v = new Vector3_1.Vector3(f[0], f[1], f[2]);
                                vs = MapUtils_1.append(vs, v);
                                break;
                            case "vt":
                                f = OBJLoader.parseFloats(item.value);
                                v = new Vector3_1.Vector3(f[0], f[1], 0);
                                vts = MapUtils_1.append(vts, v);
                                break;
                            case "vn":
                                f = OBJLoader.parseFloats(item.value);
                                v = new Vector3_1.Vector3(f[0], f[1], f[2]);
                                vns = MapUtils_1.append(vns, v);
                                break;
                            case "f":
                                var fvs = [];
                                var fvts = [];
                                var fvns = [];
                                item.value.forEach(function (str, i) {
                                    var vertex = str.split(/\/\/{1,}/);
                                    fvs[i] = OBJLoader.parseIndex(vertex[0], vs.length);
                                    fvts[i] = OBJLoader.parseIndex(vertex[1], vts.length);
                                    fvns[i] = OBJLoader.parseIndex(vertex[2], vns.length);
                                });
                                for (var i_1 = 1; i_1 < fvs.length - 1; i_1++) {
                                    var i1 = 0;
                                    var i2 = i_1;
                                    var i3 = i_1 + 1;
                                    var t = new Triangle_1.Triangle();
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
                                    triangles = MapUtils_1.append(triangles, t);
                                }
                                break;
                        }
                    }
                    return Mesh_1.Mesh.newMesh(triangles);
                };
                OBJLoader.prototype.loadMTL = function (url, parent, materials) {
                    console.log("Loading MTL:" + url);
                    var self = this;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.onload = function () {
                        self.lastMesh = self.loadOBJ(xhr.response);
                        if (onLoad) {
                            onLoad(self.lastMesh);
                        }
                    };
                    xhr.send(null);
                    return null;
                    file, err;
                    os.Open(path);
                    if (err != nil) {
                        return err;
                    }
                    defer;
                    file.Close();
                    scanner:  = bufio.NewScanner(file);
                    parentCopy:  = parent;
                    material:  =  & parentCopy;
                    for (scanner.Scan(); {
                        line:  = scanner.Text(),
                        fields:  = strings.Fields(line),
                        if: len(fields) == 0 }; {
                        continue: 
                    })
                        keyword:  = fields[0];
                    args:  = fields[1];
                    switch (keyword) {
                        case "newmtl":
                            parentCopy:  = parent;
                            material =  & parentCopy;
                            materials[args[0]] = material;
                        case "Kd":
                            c:  = ParseFloats(args);
                            material.Color = Color;
                            {
                                c[0], c[1], c[2];
                            }
                        case "map_Kd":
                            p:  = RelativePath(path, args[0]);
                            material.Texture = GetTexture(p);
                    }
                };
                return OBJLoader;
            })();
            exports_1("OBJLoader", OBJLoader);
            return scanner.Err();
        }
    }
});
//# sourceMappingURL=OBJLoader.js.map