System.register([], function(exports_1) {
    var DataCache;
    return {
        setters:[],
        execute: function() {
            DataCache = (function () {
                function DataCache() {
                }
                DataCache.getItem = function (url) {
                    return DataCache.cache.get(url);
                };
                DataCache.add = function (url, item) {
                    DataCache.cache.set(url, item);
                    return item;
                };
                DataCache.cache = new Map();
                return DataCache;
            })();
            exports_1("DataCache", DataCache);
        }
    }
});
//# sourceMappingURL=DataCache.js.map