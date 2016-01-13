System.register(["../../math/Color", "./Attenuation"], function(exports_1) {
    var Color_1, Attenuation_1, Attenuation_2;
    var MaterialType, Material;
    return {
        setters:[
            function (Color_1_1) {
                Color_1 = Color_1_1;
            },
            function (Attenuation_1_1) {
                Attenuation_1 = Attenuation_1_1;
                Attenuation_2 = Attenuation_1_1;
            }],
        execute: function() {
            (function (MaterialType) {
                MaterialType[MaterialType["GENERIC"] = 0] = "GENERIC";
                MaterialType[MaterialType["DIFFUSE"] = 1] = "DIFFUSE";
                MaterialType[MaterialType["SPECULAR"] = 2] = "SPECULAR";
                MaterialType[MaterialType["CLEAR"] = 3] = "CLEAR";
                MaterialType[MaterialType["GLOSSY"] = 4] = "GLOSSY";
                MaterialType[MaterialType["EMISSIVE"] = 5] = "EMISSIVE";
            })(MaterialType || (MaterialType = {}));
            exports_1("MaterialType", MaterialType);
            Material = (function () {
                function Material(color, texture, normalTexture, bumpTexture, bumpMultiplier, emittance, attenuation, index, gloss, tint, transparent) {
                    if (color === void 0) { color = new Color_1.Color(); }
                    if (attenuation === void 0) { attenuation = Attenuation_2.NoAttenuation; }
                    this.color = color;
                    this.texture = texture;
                    this.normalTexture = normalTexture;
                    this.bumpTexture = bumpTexture;
                    this.bumpMultiplier = bumpMultiplier;
                    this.emittance = emittance;
                    this.attenuation = attenuation;
                    this.index = index;
                    this.gloss = gloss;
                    this.tint = tint;
                    this.transparent = transparent;
                    this.type = MaterialType.GENERIC;
                    this.materialIndex = Material.map.push(this) - 1;
                }
                Material.prototype.clone = function () {
                    var material = new Material(this.color.clone(), this.texture, this.normalTexture, this.bumpTexture, this.bumpMultiplier, this.emittance, this.attenuation.clone(), this.index, this.gloss, this.tint, this.transparent);
                    material.type = this.type;
                    return material;
                };
                Material.prototype.read = function (memory, offset) {
                    offset = this.color.read(memory, offset);
                    this.bumpMultiplier = memory[offset++];
                    this.emittance = memory[offset++];
                    offset = this.attenuation.read(memory, offset);
                    this.index = memory[offset++];
                    this.gloss = memory[offset++];
                    this.tint = memory[offset++];
                    this.transparent = memory[offset++] == 1;
                    return offset;
                };
                Material.prototype.writeToMemory = function (memory, offset) {
                    offset = this.color.writeToMemory(memory, offset);
                    memory[offset++] = this.bumpMultiplier;
                    memory[offset++] = this.emittance;
                    offset = this.attenuation.writeToMemory(memory, offset);
                    memory[offset++] = this.index;
                    memory[offset++] = this.gloss;
                    memory[offset++] = this.tint;
                    memory[offset++] = this.transparent ? 1 : 0;
                    return offset;
                };
                Object.defineProperty(Material, "estimatedMemory", {
                    get: function () {
                        return Material.SIZE * Material.map.length + 1;
                    },
                    enumerable: true,
                    configurable: true
                });
                ;
                Material.writeToMemory = function (memory, offset) {
                    memory[offset++] = Material.map.length;
                    Material.map.forEach(function (material) {
                        offset = material.writeToMemory(memory, offset);
                    });
                    return offset;
                };
                Material.restore = function (memory, offset) {
                    if (offset === void 0) { offset = 0; }
                    var numMaterials = memory[offset++];
                    for (var i = 0; i < numMaterials; i++) {
                        offset = new Material().read(memory, offset);
                    }
                    return offset;
                };
                Material.SIZE = Color_1.Color.SIZE + Attenuation_1.Attenuation.SIZE + 6;
                Material.map = [];
                return Material;
            })();
            exports_1("Material", Material);
        }
    }
});
//# sourceMappingURL=Material.js.map