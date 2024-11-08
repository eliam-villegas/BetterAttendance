function loadFileContent(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        const tbody = document.getElementById('log-table').getElementsByTagName('tbody')[0];
        tbody.innerHTML = ''; // Limpiar la tabla antes de añadir nuevas filas

        lines.forEach(line => {
            const columns = line.split(',');
            if (columns.length < 10) return; // Saltar líneas incompletas

            // Extracción de datos según lo especificado
            const tipoEvento = columns[2] === '01' ? 'Entrada' : columns[2] === '03' ? 'Salida' : 'Desconocido';
            const rutEncriptado = columns[3];
            const hora = `${columns[5]}:${columns[6]}`;
            const fecha = `${columns[8]}/${columns[7]}/${columns[9]}`;

            // Crear una fila y añadir las celdas de datos con contenteditable
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

// Función auxiliar para formatear a dos dígitos (e.g., '6' => '06')
function formatTwoDigits(value) {
    return value.toString().padStart(2, '0');
}

function saveTableContent() {
    const rows = document.querySelectorAll('#log-table tbody tr');
    const logLines = [];

    // Iterar sobre cada fila de la tabla
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        
        // Extraer datos editados de la tabla
        const tipoEvento = cells[0].innerText === 'Entrada' ? '01' : '03';
        const rutEncriptado = cells[1].innerText;
        
        // Obtener y formatear hora y minuto
        const hora = formatTwoDigits(cells[2].innerText.split(':')[0]);
        const minuto = formatTwoDigits(cells[2].innerText.split(':')[1]);
        
        // Obtener y formatear mes, día y año
        const fechaParts = cells[3].innerText.split('/');
        const dia = formatTwoDigits(fechaParts[0]);
        const mes = formatTwoDigits(fechaParts[1]);
        const anio = formatTwoDigits(fechaParts[2].slice(-2));  // Solo últimos dos dígitos del año

        // Construir la línea en el formato original del archivo .log
        const logLine = `001,${tipoEvento},01,${rutEncriptado},0000000000,${hora},${minuto},${mes},${dia},${anio},00,00,00,00,00,0000000000,0000000000,    0.00,    0.00`;

        // Agregar la línea a la lista de líneas
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