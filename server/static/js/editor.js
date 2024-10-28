// static/js/editor.js

console.log("Cargando Monaco Editor...");
require.config({ paths: { 'vs': '/node_modules/monaco-editor/dev/vs' } });

require(['vs/editor/editor.main'], function() {
    console.log("Editor cargado");
    monaco.editor.create(document.getElementById('container'), {
        value: "// Tu código inicial aquí\n",
        language: "javascript",
        theme: "vs"
    });
});
