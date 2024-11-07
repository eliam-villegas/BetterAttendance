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

function saveTableContent() {
    const rows = document.querySelectorAll('#log-table tbody tr');
    const updatedData = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const tipoEvento = cells[0].innerText;
        const rutEncriptado = cells[1].innerText;
        const hora = cells[2].innerText;
        const fecha = cells[3].innerText;

        updatedData.push({
            tipoEvento,
            rutEncriptado,
            hora,
            fecha
        });
    });

    console.log("Contenido actualizado de la tabla:", updatedData);
    // Aquí podrías agregar lógica adicional para descargar estos datos o enviarlos a un servidor
}
