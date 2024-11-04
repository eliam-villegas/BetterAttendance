// static/js/editor.js

console.log("Cargando Monaco Editor...");
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs/editor/editor.main.min.js' }});

require(['vs/editor/editor.main'], function() {
    console.log("Editor cargado");
    monaco.editor.create(document.getElementById('container'), {
        value: "// Tu código inicial aquí\n",
        language: "javascript",
        theme: "vs"
    });
});