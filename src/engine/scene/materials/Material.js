System.register([], function(exports_1) {
    var MaterialType, Material;
    return {
        setters:[],
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
                }
                return Material;
            })();
            exports_1("Material", Material);
        }
    }
});
//# sourceMappingURL=Material.js.map