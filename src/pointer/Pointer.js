System.register(["./ByteArrayBase"], function(exports_1) {
    var ByteArrayBase_1;
    var Pointer;
    function sizeof(ptr) {
        return ptr.size;
    }
    exports_1("sizeof", sizeof);
    return {
        setters:[
            function (ByteArrayBase_1_1) {
                ByteArrayBase_1 = ByteArrayBase_1_1;
            }],
        execute: function() {
            Pointer = (function () {
                function Pointer(reference) {
                    this.reference = reference;
                    if (!Pointer.heap) {
                        Pointer.init();
                    }
                    this.beginLocation = Pointer.offset;
                    this.currentLocation = Pointer.offset;
                    Pointer.offset = reference.write(Pointer.memory, Pointer.offset);
                }
                Pointer.init = function () {
                    var maxMemory = 512 * 1024 * 1024;
                    Pointer.heap = new Uint8Array(new SharedArrayBuffer(maxMemory));
                    Pointer.memory = new ByteArrayBase_1.ByteArrayBase(Pointer.heap.buffer);
                };
                Pointer.prototype.read = function () {
                    Pointer.offset = this.reference.read(Pointer.memory, Pointer.offset);
                    return this.reference;
                };
                return Pointer;
            })();
            exports_1("Pointer", Pointer);
        }
    }
});
//# sourceMappingURL=Pointer.js.map