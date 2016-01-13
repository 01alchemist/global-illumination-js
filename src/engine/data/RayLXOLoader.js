System.register([], function(exports_1) {
    var RayLXOLoader;
    return {
        setters:[],
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
                    return null;
                };
                RayLXOLoader.prototype.loadLXO = function (data) {
                    return null;
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