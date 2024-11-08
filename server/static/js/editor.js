let firstColumnValues = []; // Array para almacenar los primeros valores de cada línea

function loadFileContent(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        const tbody = document.getElementById('log-table').querySelector('tbody');
        tbody.innerHTML = ''; // Limpiar la tabla antes de añadir nuevas filas

        firstColumnValues = []; // Reinicia los valores de la primera columna para este archivo

        lines.forEach(line => {
            const columns = line.split(',');
            if (columns.length < 10) return; // Saltar líneas incompletas

            // Almacena el primer valor de la columna
            firstColumnValues.push(columns[0]);

            // Extracción de datos y creación de la fila en la tabla
            const tipoEvento = columns[2] === '01' ? 'Entrada' : columns[2] === '03' ? 'Salida' : 'Desconocido';
            const rutEncriptado = columns[3];
            const hora = `${columns[5]}:${columns[6]}`;
            const fecha = `${columns[8]}/${columns[7]}/${columns[9]}`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td contenteditable="true">${tipoEvento}</td>
                <td contenteditable="true">${rutEncriptado}</td>
                <td contenteditable="true">${hora}</td>
                <td contenteditable="true">${fecha}</td>
            `;
            tbody.appendChild(row);
        });
    };

    reader.readAsText(file);
}

// Obtener el nombre del archivo cargado y enviarlo al servidor
function getFilePath() {
    const fileInput = document.getElementById('file-upload');
    if (!fileInput.files.length) {
        showNotification('Por favor, seleccione un archivo.');
        return null;
    }
    return fileInput.files[0].name;
}

async function findDuplicates() {
    const fileInput = document.getElementById('file-upload');
    if (!fileInput.files.length) {
        showNotification('Por favor, seleccione un archivo.');
        return;
    }

    const formData = new FormData();
    formData.append('log_file', fileInput.files[0]);

    const response = await fetch('/find-duplicates', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();

    if (result.message) {
        showNotification(result.message);  // Llama a la notificación aquí
        populateTable(result.resultados);
    }
}

function populateTable(data) {
    const tbody = document.getElementById('log-table').querySelector('tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de añadir nuevas filas

    data.forEach(row => {
        const tr = document.createElement('tr');

        // Crear las celdas y asignar el estado de fondo según sea DUPLICADO o UNICO
        const tipoEventoTd = document.createElement('td');
        tipoEventoTd.textContent = row.tipo_evento;
        tr.appendChild(tipoEventoTd);

        const rutTd = document.createElement('td');
        rutTd.textContent = row.rut_encriptado;

        // Solo resalta si existe el estado y es DUPLICADO
        if (row.estado === "DUPLICADO") {
            rutTd.style.backgroundColor = 'yellow';
        }
        tr.appendChild(rutTd);

        const horaTd = document.createElement('td');
        horaTd.textContent = row.hora;
        tr.appendChild(horaTd);

        const fechaTd = document.createElement('td');
        fechaTd.textContent = row.fecha;
        tr.appendChild(fechaTd);

        tbody.appendChild(tr);
    });
}

async function removeDuplicates() {
    const fileInput = document.getElementById('file-upload');
    if (!fileInput.files.length) {
        showNotification('Por favor, seleccione un archivo.');
        return;
    }

    const formData = new FormData();
    formData.append('log_file', fileInput.files[0]);

    const response = await fetch('/remove-duplicates', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();

    if (result.message) {
        showNotification(result.message);  // Llama a la notificación aquí
        populateTable(result.resultados);  // Usar populateTable para actualizar la tabla
    }
}

// Función auxiliar para formatear a dos dígitos
function formatTwoDigits(value) {
    return value.toString().padStart(2, '0');
}

// Guardar contenido actualizado, conservando el primer valor de cada fila y respetando el orden de columnas
function saveTableContent() {
    const rows = document.querySelectorAll('#log-table tbody tr');
    const logLines = [];

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');

        // Recuperar el primer valor de la columna original
        const firstValue = firstColumnValues[index] || '001';

        // Convertir 'Entrada' o 'Salida' al código correspondiente
        const tipoEvento = cells[0].innerText === 'Entrada' ? '01' : cells[0].innerText === 'Salida' ? '03' : '00';
        const rutEncriptado = cells[1].innerText;

        // Obtener y formatear hora y minuto
        const hora = formatTwoDigits(cells[2].innerText.split(':')[0]);
        const minuto = formatTwoDigits(cells[2].innerText.split(':')[1]);

        // Obtener y formatear mes, día y año
        const fechaParts = cells[3].innerText.split('/');
        const dia = formatTwoDigits(fechaParts[0]);
        const mes = formatTwoDigits(fechaParts[1]);
        const anio = formatTwoDigits(fechaParts[2].slice(-2));  // Solo últimos dos dígitos del año

        // Reconstruir la línea de salida usando el primer valor y asegurando el orden correcto de los campos
        const logLine = `${firstValue},01,${tipoEvento},${rutEncriptado},0000000000,${hora},${minuto},${mes},${dia},${anio},00,00,00,00,00,0000000000,0000000000,    0.00,    0.00`;

        logLines.push(logLine);
    });

    // Convertir el array de líneas en un contenido de archivo .log
    const logContent = logLines.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Crear un enlace de descarga para el archivo .log
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archivo_modificado.log';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
