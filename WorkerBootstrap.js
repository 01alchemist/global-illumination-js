importScripts(
    "node_modules/systemjs/dist/system.src.js"
);

System.config({
    packages: {
        "src/engine": {
            format: 'register',
            defaultExtension: 'js'
        }
    }
});
System.import('src/engine/renderer/worker/TraceWorker').then(null, console.error.bind(console));