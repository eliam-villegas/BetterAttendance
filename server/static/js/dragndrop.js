document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const fileSelectedMessage = document.getElementById('file-selected');
    const fileNameDisplay = document.getElementById('selected-file-name');

    // Evitar comportamientos predeterminados en drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropzone.addEventListener(event, e => e.preventDefault());
        dropzone.addEventListener(event, e => e.stopPropagation());
    });

    // Estilo al arrastrar
    ['dragenter', 'dragover'].forEach(event => {
        dropzone.addEventListener(event, () => dropzone.classList.add('dragging'));
    });

    // Quitar estilo al salir
    ['dragleave', 'drop'].forEach(event => {
        dropzone.addEventListener(event, () => dropzone.classList.remove('dragging'));
    });

    // Manejar el archivo arrastrado
    dropzone.addEventListener('drop', async (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = e.dataTransfer.files; // Actualizar manualmente fileInput
            await handleFile(); // Procesar el archivo
        }
    });

    // Manejar el archivo seleccionado por clic
    fileInput.addEventListener('change', async () => {
        if (fileInput.files.length > 0) {
            await handleFile(); // Procesar el archivo
        }
    });

    // Función para manejar el archivo seleccionado o arrastrado
    async function handleFile() {
        try {
            const file = fileInput.files[0];
            if (!file) {
                showNotification('Por favor, selecciona un archivo.');
                return;
            }

            // Mostrar el nombre del archivo seleccionado
            fileNameDisplay.textContent = file.name;
            fileSelectedMessage.classList.remove('d-none');

            // Subir el archivo
            await loadFileContent();

            // Enviar la fecha y el nombre del archivo
            await sendDateAndFileName(file.name);

            // Notificación de éxito
            showNotification('Archivo procesado correctamente.');
        } catch (error) {
            // Notificación de error si algo falla
            showNotification('Error al procesar el archivo. Por favor, intenta de nuevo.');
            console.error(error); // Para depuración
        } finally {
            // Reiniciar el input para permitir nuevas selecciones
            fileInput.value = '';
        }
    }
});
