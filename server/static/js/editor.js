let firstColumnValues = []; // Array para almacenar los primeros valores de cada línea
let currentData = []; // Almacena los datos completos del archivo
let currentPage = 1; // Página actual
const rowsPerPage = 50; // Número de filas por página

// Función para dividir datos en páginas
function paginate(data, page = 1) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
}

// Función para actualizar la tabla según la página actual
function updateTable(data) {
    const tbody = document.getElementById('log-table').querySelector('tbody');
    tbody.innerHTML = ''; // Limpiar la tabla

    const paginatedData = paginate(data, currentPage);
    paginatedData.forEach(row => {
        const tr = document.createElement('tr');

        // Crear las celdas para los datos
        const tipoEventoTd = document.createElement('td');
        tipoEventoTd.textContent = row.tipo_evento;
        tr.appendChild(tipoEventoTd);

        const rutTd = document.createElement('td');
        rutTd.textContent = row.rut_encriptado;

        // Resaltar en amarillo si es duplicado
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

    updatePaginationControls(data.length);
}

function updatePaginationControls(totalRows) {
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Limpia los controles existentes

    const maxVisibleButtons = 5; // Máximo número de botones visibles
    const startPage = Math.max(currentPage - Math.floor(maxVisibleButtons / 2), 1);
    const endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

    // Botón "Anterior"
    if (currentPage > 1) {
        const prevButton = document.createElement('div');
        prevButton.textContent = 'Anterior';
        prevButton.className = 'pagination-button';
        prevButton.onclick = () => {
            currentPage--;
            updateTable(currentData);
        };
        paginationControls.appendChild(prevButton);
    }

    // Botones numerados
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('div');
        button.textContent = i;
        button.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
        button.onclick = () => {
            currentPage = i;
            updateTable(currentData);
        };
        paginationControls.appendChild(button);
    }

    // Botón "Siguiente"
    if (currentPage < totalPages) {
        const nextButton = document.createElement('div');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'pagination-button';
        nextButton.onclick = () => {
            currentPage++;
            updateTable(currentData);
        };
        paginationControls.appendChild(nextButton);
    }
}


// Llama a updateTable después de cargar un archivo
function loadFileContent(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        currentData = lines.map(line => {
            const columns = line.split(',');
            return {
                tipo_evento: columns[2] === '01' ? 'Entrada' : columns[2] === '03' ? 'Salida' : 'Desconocido',
                rut_encriptado: columns[3],
                hora: `${columns[5]}:${columns[6]}`,
                fecha: `${columns[8]}/${columns[7]}/${columns[9]}`
            };
        });
        currentPage = 1; // Reinicia la página actual
        updateTable(currentData); // Mostrar la tabla inicial
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
    if (!currentData.length) {
        showNotification('Por favor, cargue un archivo primero.');
        return;
    }

    const response = await fetch('/find-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentData })
    });

    const result = await response.json();
    if (result.message) {
        showNotification(result.message);
        currentData = result.resultados; // Actualizar datos globales
        updateTable(currentData); // Refrescar la tabla y resaltar duplicados

        // Verificar si hay duplicados
        const hasDuplicates = currentData.some(row => row.estado === "DUPLICADO");
        if (!hasDuplicates) {
            showNotification('No se encontraron duplicados.');
        }
    }
}

function populateTable(data) {
    const tbody = document.getElementById('log-table').querySelector('tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de añadir nuevas filas

    data.forEach(row => {
        const tr = document.createElement('tr');

        // Crear las celdas para los datos
        const tipoEventoTd = document.createElement('td');
        tipoEventoTd.textContent = row.tipo_evento;
        tr.appendChild(tipoEventoTd);

        const rutTd = document.createElement('td');
        rutTd.textContent = row.rut_encriptado;

        // Resaltar en amarillo si es duplicado
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

// Modificar removeDuplicates para trabajar con el archivo completo
async function removeDuplicates() {
    if (!currentData.length) {
        showNotification('Por favor, cargue un archivo primero.');
        return;
    }

    const response = await fetch('/remove-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentData })
    });

    const result = await response.json();
    if (result.message) {
        showNotification(result.message);
        currentData = result.resultados; // Actualizar datos globales
        updateTable(currentData); // Refrescar la tabla
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
