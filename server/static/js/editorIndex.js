let editor; // Declaración de editor global

// Configuración y creación del editor de Monaco
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' }});
require(['vs/editor/editor.main'], function () {
    const savedTheme = localStorage.getItem('monacoTheme') || 'vs-light';
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: "// Aquí se mostrará el contenido del archivo cargado\n",
        language: "plaintext",
        theme: savedTheme,
        minimap: { enabled: false }
    });

    document.getElementById('theme-select').value = savedTheme;

    // Función para añadir color a cada elemento entre comas
    function colorizeCSV() {
        const text = editor.getValue();
        const lines = text.split('\n');
        let decorations = [];

        lines.forEach((line, lineIndex) => {
            const items = line.split(',');
            let position = 0;

            items.forEach((item, index) => {
                const startPos = position;
                const endPos = startPos + item.length;
                position = endPos + 1; // Añadimos 1 para saltar la coma

                // Asignamos un color diferente a cada fragmento basado en su índice
                const colorClass = index % 2 === 0 ? 'color-even' : 'color-odd';
                decorations.push({
                    range: new monaco.Range(lineIndex + 1, startPos + 1, lineIndex + 1, endPos + 1),
                    options: {
                        inlineClassName: colorClass
                    }
                });
            });
        });

        // Aplicamos los decoradores
        editor.deltaDecorations([], decorations);
    }

    // Llamamos a la función de coloreado al cargar el archivo
    colorizeCSV();

    // Agregamos un evento para re-colorear cuando el texto cambie, con retraso de 500ms
    let timeoutId;
    editor.onDidChangeModelContent(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(colorizeCSV, 500); // Espera 500ms después de la última edición
    });
});

// Función para cambiar el tema del editor y guardar en Local Storage
function changeEditorTheme(theme) {
    monaco.editor.setTheme(theme);
    localStorage.setItem('monacoTheme', theme);
}

let originalContent = ""; // Almacenará el contenido original completo
let positionsOfZeros = []; // Almacenará las posiciones de los "0" eliminados

let originalContentSegments = []; // Almacenará segmentos originales del archivo

function loadFileContent(event) {
    const file = event.target.files[0];
    const validExtensions = ['.log'];

    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (file && validExtensions.includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;

            // Dividir el contenido en segmentos que contienen "0000000000", "0.00", y "00"
            originalContentSegments = [];
            let modifiedContent = content.replace(/(\b0{10}\b|\b0\.00\b|(?<=,|\s)00(?=,|\s))/g, (match) => {
                originalContentSegments.push(match); // Guardar el "0" encontrado
                return "__"; // Usar un marcador temporal
            });

            // Mostrar el contenido modificado en el editor de Monaco sin los "0"
            editor.setValue(modifiedContent);
        };
        reader.readAsText(file);
    } else {
        alert("Por favor, seleccione un archivo de texto (.txt o .log).");
    }
}

// Función para descargar el contenido original con los "0000000000"
function downloadOriginalContent() {
    // Usar el contenido original, sin modificaciones, para la descarga
    const blob = new Blob([originalContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'archivo_original.log'; // Nombre del archivo a descargar
    link.click();
}

function downloadModifiedContent() {
    // Obtener el contenido modificado desde el editor de Monaco
    let modifiedContent = editor.getValue();

    // Restaurar los "0" usando los segmentos guardados en originalContentSegments
    let index = 0;
    const restoredContent = modifiedContent.replace(/__/g, () => originalContentSegments[index++]);

    // Crear un blob con el contenido restaurado
    const blob = new Blob([restoredContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'archivo_modificado.log'; // Nombre del archivo a descargar
    link.click();
}

function backup() {
    alert("Función de copia de seguridad no implementada.");
}
