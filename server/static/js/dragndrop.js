document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const fileSelectedMessage = document.getElementById('file-selected');
    const fileNameDisplay = fileSelectedMessage.querySelector('span');

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
    dropzone.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    // Manejar el archivo seleccionado por clic
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFileSelection(fileInput.files[0]);
        }
    });

    // Función para manejar la selección del archivo
    function handleFileSelection(file) {
        fileNameDisplay.textContent = file.name;
        fileSelectedMessage.classList.remove('d-none');
        document.getElementById('uploadForm').submit();
    }
});
