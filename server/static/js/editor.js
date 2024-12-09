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
        prevButton.onclick = () => {
            currentPage--; // Retrocede una página
            updateTable(currentData); // Actualizar la tabla
        };
        controlContainer.appendChild(prevButton);
    }

    // Botón "Siguiente"
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'btn btn-primary';
        nextButton.onclick = () => {
            currentPage++; // Avanza una página
            updateTable(currentData); // Actualizar la tabla
        };
        controlContainer.appendChild(nextButton);
    }

    paginationControls.appendChild(controlContainer);
}

document.addEventListener('DOMContentLoaded', () => {
    const fileName = document.body.getAttribute('data-file'); // Obtiene el archivo del atributo data-file
    if (!fileName) {
        alert('No se especificó ningún archivo para cargar.');
        return;
    }

    const filePath = `/uploads/${fileName}`; // Ruta al archivo en el servidor
    renderLogFile(filePath); // Llama a la función para renderizar el archivo
});


function renderLogFile(filepath) {
    fetch(filepath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo: ' + response.statusText);
            }
            return response.text();
        })
        .then(content => {
            const lines = content.split('\n');
            currentData = lines.map(line => {
                const columns = line.split(',');
                if (columns.length < 10) return null;

                return {
                    tipo_evento: columns[2] === '01' ? 'Entrada' : columns[2] === '03' ? 'Salida' : 'Desconocido',
                    rut_encriptado: columns[3],
                    hora: `${columns[5]}:${columns[6]}`,
                    fecha: `${columns[8]}/${columns[7]}/${columns[9]}`
                };
            }).filter(row => row !== null);

            currentPage = 1; // Reiniciar la paginación
            updateTable(currentData); // Actualizar tabla con datos paginados
        })
        .catch(error => {
            console.error('Error al renderizar el archivo:', error);
            alert('No se pudo cargar el archivo. Verifica que haya sido subido correctamente.');
        });
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

function updateTable(data) {
    // Ordenar los datos por fecha y hora
    data.sort((a, b) => {
        const fechaA = a.fecha.split('/').reverse().join('');
        const fechaB = b.fecha.split('/').reverse().join('');
        return fechaA.localeCompare(fechaB) || a.hora.localeCompare(b.hora);
    });

    const tbody = document.getElementById('log-table').querySelector('tbody');
    tbody.innerHTML = ''; // Limpiar la tabla

    const paginatedData = paginate(data, currentPage); // Obtener datos paginados
    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-first-value', row.first_value || ''); // Asignar atributo personalizado

        // Crear celdas
        const tipoEventoTd = document.createElement('td');
        tipoEventoTd.textContent = row.tipo_evento;
        tr.appendChild(tipoEventoTd);

        const rutTd = document.createElement('td');
        rutTd.textContent = row.rut_encriptado;
        tr.appendChild(rutTd);

        const horaTd = document.createElement('td');
        horaTd.textContent = row.hora;
        tr.appendChild(horaTd);

        const fechaTd = document.createElement('td');
        fechaTd.textContent = row.fecha;
        tr.appendChild(fechaTd);

        tbody.appendChild(tr);
    });

    updatePaginationControls(data.length); // Actualizar controles de paginación
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

async function checkEntriesWithoutExits() {
    if (!currentData.length) {
        showNotification('Por favor, cargue un archivo primero.');
        return;
    }

    const response = await fetch('/check-entries-without-exits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentData })
    });

    const result = await response.json();
    if (result.message) {
        showNotification(result.message);
        currentData = result.resultados; // Actualizar datos globales
        updateTable(currentData); // Refrescar la tabla

        // Mostrar las entradas sin salidas en una ventana emergente
        const entriesWithoutExits = currentData.filter(row => row.estado === "SIN_SALIDA");
        if (entriesWithoutExits.length > 0) {
            showEntriesWithoutExitsPopup(entriesWithoutExits);
        } else {
            showNotification('Todas las entradas tienen salidas correspondientes.');
        }
    }
}

function showEntriesWithoutExitsPopup(entries) {
    const popup = window.open('', 'Entradas sin Salidas', 'width=1000,height=800,scrollbars=yes,resizable=yes');
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Entradas sin Salidas</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-4">
                <h2 class="text-center">Entradas sin Salidas Encontradas</h2>
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
                            ${entries.map(row => `
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

    popup.document.open();
    popup.document.write(htmlContent);
    popup.document.close();
}

async function correctConsecutiveEvents() {
    if (!currentData.length) {
        showNotification('Por favor, cargue un archivo primero.');
        return;
    }

    const response = await fetch('/correct-consecutive-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentData })
    });

    const result = await response.json();
    if (result.message) {
        showNotification(result.message);
        currentData = result.resultados; // Actualizar datos globales
        updateTable(currentData); // Refrescar la tabla con los datos corregidos (si aplica)
    }
}

async function insertMissingExits() {
    if (!currentData.length) {
        showNotification('Por favor, cargue un archivo primero.');
        return;
    }

    try {
        const response = await fetch('/insert-missing-exits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: currentData })
        });

        const result = await response.json();
        console.log('Datos recibidos del backend:', result.resultados); // DEBUG

        if (response.ok) {
            showNotification(result.message);
            currentData = result.resultados; // Actualiza los datos
            currentPage = 1;
            updateTable(currentData); // Actualiza la tabla
        } else {
            showNotification('Error al procesar los datos: ' + result.message);
        }
    } catch (error) {
        console.error('Error al insertar salidas faltantes:', error);
        showNotification('Ocurrió un error al procesar los datos.');
    }
}

