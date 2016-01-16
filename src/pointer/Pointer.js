System.register(["./ByteArrayBase"], function(exports_1) {
    var ByteArrayBase_1;
    var Pointer;
    return {
        setters:[
            function (ByteArrayBase_1_1) {
                ByteArrayBase_1 = ByteArrayBase_1_1;
            }],
        execute: function() {
            Pointer = (function () {
                function Pointer(obj) {
                    if (!Pointer.heap) {
                        Pointer.init();
                    }
                    Pointer.offset = obj.write(Pointer.memory, Pointer.offset);
                }
                Pointer.init = function () {
                    var maxMemory = 512 * 1024 * 1024;
                    Pointer.heap = new Uint8Array(new SharedArrayBuffer(maxMemory));
                    Pointer.memory = new ByteArrayBase_1.ByteArrayBase(Pointer.heap.buffer);
                };
                return Pointer;
            })();
            exports_1("Pointer", Pointer);
        }
    }
});
//# sourceMappingURL=Pointer.js.map