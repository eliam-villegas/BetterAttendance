let editor;

// Configuración y creación del editor de Monaco
require.config({ paths: { 'vs': '/node_modules/monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function() {
    // Cargar el tema guardado o establecer el tema claro como predeterminado
    const savedTheme = localStorage.getItem('monacoTheme') || 'vs-light';
    
    // Crear el editor con el tema guardado o el tema claro
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: "// Aquí se mostrará el contenido del archivo .txt cargado\n",
        language: "javascript",
        theme: savedTheme // Usar el tema guardado o claro por defecto
    });

    // Establecer el tema en el menú desplegable según el valor guardado
    document.getElementById('theme-select').value = savedTheme;
});

// Función para cambiar el tema del editor y guardar en Local Storage
function changeEditorTheme(theme) {
    monaco.editor.setTheme(theme);
    localStorage.setItem('monacoTheme', theme); // Guardar el tema seleccionado
}

function updateWorkflowDate() {
    // Obtener la fecha seleccionada
    const dateInput = document.getElementById("calendar").value;
    const formattedDate = new Date(dateInput).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    // Actualizar el texto en la columna de flujo de trabajo
    document.getElementById("selected-date").innerText = `Fecha seleccionada: ${formattedDate}`;
}

function loadFileContent(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            // Insertar el contenido en el editor de Monaco
            editor.setValue(content);
        };
        reader.readAsText(file);
    } else {
        alert("Por favor, seleccione un archivo de texto (.txt).");
    }
}

function backup() {
    alert("Función de copia de seguridad no implementada.");
}
