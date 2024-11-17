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

    const paginatedData = paginate(data, currentPage); // Obtener datos de la página actual
    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-first-value', row.first_value); // Asignar atributo personalizado

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

    updatePaginationControls(data.length); // Actualizar los controles de paginación
}

function showDuplicatesPopup(duplicates) {
    // Crear una nueva ventana con dimensiones ajustadas
    const popup = window.open('', 'Duplicados', 'width=1000,height=800,scrollbars=yes,resizable=yes');

    // Crear el contenido HTML para la tabla
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Duplicados</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-4">
                <h2 class="text-center">Duplicados Encontrados</h2>
                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Tipo de Evento</th>
                                <th>RUT</th>
                                <th>Hora</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${duplicates.map(row => `
                                <tr>
                                    <td>${row.tipo_evento}</td>
                                    <td>${row.rut_encriptado}</td>
                                    <td>${row.hora}</td>
                                    <td>${row.fecha}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="text-center mt-3">
                    <button class="btn btn-danger" onclick="window.close()">Cerrar</button>
                </div>
            </div>
        </body>
        </html>
    `;

    // Escribir el contenido HTML en la nueva ventana
    popup.document.open();
    popup.document.write(htmlContent);
    popup.document.close();
}

function updatePaginationControls(totalRows) {
    const totalPages = Math.ceil(totalRows / rowsPerPage); // Calcular número total de páginas
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Limpiar controles existentes

    // Crear un contenedor para centrar los controles
    const controlContainer = document.createElement('div');
    controlContainer.style.display = 'flex';
    controlContainer.style.justifyContent = 'center';
    controlContainer.style.alignItems = 'center';
    controlContainer.style.gap = '10px'; // Espaciado entre elementos

    // Botón "Anterior"
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.className = 'btn btn-primary';
        prevButton.style.padding = '5px 10px';
        prevButton.onclick = () => {
            currentPage--;
            updateTable(currentData); // Actualizar la tabla
        };
        controlContainer.appendChild(prevButton);
    }

    // Combobox para selección directa de páginas
    const pageSelect = document.createElement('select');
    pageSelect.style.padding = '5px';
    pageSelect.style.fontSize = '14px';
    pageSelect.style.border = '1px solid #ddd';
    pageSelect.style.borderRadius = '4px';
    pageSelect.onchange = () => {
        currentPage = parseInt(pageSelect.value, 10); // Actualizar la página actual
        updateTable(currentData); // Actualizar la tabla
    };

    // Agregar opciones al combobox
    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Página ${i}`;
        if (i === currentPage) option.selected = true; // Seleccionar la página actual
        pageSelect.appendChild(option);
    }

    controlContainer.appendChild(pageSelect);

    // Botón "Siguiente"
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'btn btn-primary';
        nextButton.style.padding = '5px 10px';
        nextButton.onclick = () => {
            currentPage++;
            updateTable(currentData); // Actualizar la tabla
        };
        controlContainer.appendChild(nextButton);
    }

    paginationControls.appendChild(controlContainer);
}



// Llama a updateTable después de cargar un archivo
function loadFileContent(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split('\n');
        currentData = lines.map((line, index) => {
            const columns = line.split(',');

            // Validar que la línea tenga suficientes columnas
            if (columns.length < 10) return null;

            return {
                index: index, // Índice original
                first_value: columns[0], // Primer valor del archivo original
                tipo_evento: columns[2] === '01' ? 'Entrada' : columns[2] === '03' ? 'Salida' : 'Desconocido',
                rut_encriptado: columns[3],
                hora: `${columns[5]}:${columns[6]}`,
                fecha: `${columns[8]}/${columns[7]}/${columns[9]}`
            };
        }).filter(item => item !== null); // Filtrar líneas nulas o incompletas

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
        currentData = result.resultados; // Actualizar currentData con la respuesta del backend
        updateTable(currentData); // Refrescar la tabla con los datos actualizados

        // Filtrar solo los duplicados
        const duplicates = currentData.filter(row => row.estado === "DUPLICADO");

        // Abrir nueva ventana con los duplicados
        if (duplicates.length > 0) {
            showDuplicatesPopup(duplicates); // Mostrar ventana con duplicados
        } else {
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
    const logLines = currentData.map(row => {
        // Extraer el valor original desde el objeto en currentData
        const firstValue = row.first_value;

        // Convertir 'Entrada' o 'Salida' al código correspondiente
        const tipoEvento = row.tipo_evento === 'Entrada' ? '01' : row.tipo_evento === 'Salida' ? '03' : '00';
        const rutEncriptado = row.rut_encriptado;

        // Obtener y formatear hora y minuto
        const hora = formatTwoDigits(row.hora.split(':')[0]);
        const minuto = formatTwoDigits(row.hora.split(':')[1]);

        // Obtener y formatear mes, día y año
        const fechaParts = row.fecha.split('/');
        const dia = formatTwoDigits(fechaParts[0]);
        const mes = formatTwoDigits(fechaParts[1]);
        const anio = formatTwoDigits(fechaParts[2].slice(-2));

        // Reconstruir la línea de salida
        return `${firstValue},01,${tipoEvento},${rutEncriptado},0000000000,${hora},${minuto},${mes},${dia},${anio},00,00,00,00,00,0000000000,0000000000,    0.00,    0.00`;
    });

    // Generar el archivo .log
    const logContent = logLines.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'archivo_modificado.log';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

