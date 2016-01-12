System.register(["../scene/shapes/Mesh", "../scene/shapes/Triangle", "../utils/MapUtils"], function(exports_1) {
    var Mesh_1, Triangle_1, MapUtils_1;
    var RayLXOLoader;
    return {
        setters:[
            function (Mesh_1_1) {
                Mesh_1 = Mesh_1_1;
            },
            function (Triangle_1_1) {
                Triangle_1 = Triangle_1_1;
            },
            function (MapUtils_1_1) {
                MapUtils_1 = MapUtils_1_1;
            }],
        execute: function() {
            RayLXOLoader = (function () {
                function RayLXOLoader() {
                }
                RayLXOLoader.prototype.load = function (url, onLoad) {
                    console.log("Loading LXO:" + url);
                    var self = this;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.onload = function () {
                        self.lastMesh = self.loadLXOData(xhr.response);
                        if (onLoad) {
                            onLoad(self.lastMesh);
                        }
                    };
                    xhr.send(null);
                    return null;
                };
                RayLXOLoader.parseIndex = function (value, length) {
                    var n = parseInt(value);
                    if (n < 0) {
                        n += length;
                    }
                    return n;
                };
                RayLXOLoader.getEntry = function (line) {
                    var _str = line.match(/^(\S+)\s(.*)/).slice(1);
                    return {
                        keyword: _str[0],
                        value: _str[1].split(/ {1,}/)
                    };
                };
                RayLXOLoader.parseFloats = function (fs) {
                    var floats = [];
                    fs.forEach(function (f) {
                        floats.push(parseFloat(f));
                    });
                    return floats;
                };
                RayLXOLoader.prototype.loadLXOData = function (data) {
                };
                RayLXOLoader.prototype.loadLXO = function (data) {
                    var vs = [null];
                    var vts = [null];
                    var vns = [null];
                    var triangles;
                    var materials = new Map();
                    var material = this.parentMaterial;
                    for (var i = 1; i < fvs.length - 1; i++) {
                        var i1 = 0;
                        var i2 = i;
                        var i3 = i + 1;
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
                    return Mesh_1.Mesh.newMesh(triangles);
                };
                RayLXOLoader.prototype.loadMTL = function (url, parent, materials) {
                    console.log("Loading MTL:" + url);
                };
                return RayLXOLoader;
            })();
            exports_1("RayLXOLoader", RayLXOLoader);
        }
    }
});
//# sourceMappingURL=RayLXOLoader.js.map