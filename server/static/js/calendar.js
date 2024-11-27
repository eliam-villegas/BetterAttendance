const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date(); // Fecha actual

const monthYearDisplay = document.getElementById("month-year");
const calendarDays = document.getElementById("calendar-days");
const selectedDateDisplay = document.getElementById("selected-date");
const fileNameDisplay = document.getElementById("file-name-display"); // Elemento para mostrar el archivo asociado

// Selecciona el elemento de entrada de archivo
const fileInput = document.getElementById('fileInput');
const form = document.getElementById('uploadForm');

// Agrega un evento para detectar cuando se selecciona un archivo
fileInput.addEventListener('change', function () {
    // Verifica si hay un archivo seleccionado
    if (fileInput.files.length > 0) {
        // Envía automáticamente el formulario
        form.submit();
    }
});

let selectedDate = null; // Variable para guardar la fecha seleccionada
let fileData = {}; // Objeto para almacenar las fechas y archivos del JSON

function renderCalendar(month, year) {
    calendarDays.innerHTML = "";
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("day", "inactive");
        calendarDays.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = day;

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            dayElement.classList.add("current-day");
        }

        // Generar la fecha en el formato esperado por el JSON: d/m/yyyy
        const dateKey = `${day}/${month + 1}/${year}`;

        // Marcar si hay un archivo asociado a esta fecha
        if (fileData[dateKey]) {
            dayElement.classList.add("has-file");
            dayElement.setAttribute("data-file", fileData[dateKey]); // Guardar el archivo asociado
        }

        // Evento para seleccionar un día
        dayElement.addEventListener("click", () => {
            document.querySelectorAll(".day.selected").forEach(el => el.classList.remove("selected"));
            dayElement.classList.add("selected");

            selectedDate = dateKey; // Almacena la fecha seleccionada como d/m/yyyy
            selectedDateDisplay.textContent = `Día seleccionado: ${selectedDate}`;

            // Mostrar el archivo asociado si existe
            const fileName = dayElement.getAttribute("data-file");
            const editorButton = document.querySelector(".btn-primary");

            if (fileName) {
                fileNameDisplay.textContent = `Archivo: ${fileName}`;
                editorButton.href = `/editor?file=${encodeURIComponent(fileName)}`; // Actualiza el enlace dinámicamente
                editorButton.classList.remove("disabled"); // Habilita el botón
            } else {
                fileNameDisplay.textContent = "Archivo: Ninguno";
                editorButton.href = "#"; // Desactiva el enlace
                editorButton.classList.add("disabled"); // Deshabilita el botón
            }
        });

        calendarDays.appendChild(dayElement);
    }
}

function loadFileData() {
    fetch('/uploads/metadata.json') // Ruta al archivo JSON
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Validar formato del JSON
            if (!Array.isArray(data)) {
                throw new Error('El archivo JSON no tiene el formato esperado.');
            }

            // Convertir los datos en un objeto para acceso rápido
            fileData = data.reduce((acc, entry) => {
                if (!entry.date || !entry.file) {
                    console.warn('Entrada inválida en el archivo JSON:', entry);
                    return acc;
                }
                acc[entry.date] = entry.file; // Usa la fecha directamente como clave
                return acc;
            }, {});

            renderCalendar(currentMonth, currentYear); // Renderiza el calendario con los datos cargados
        })
        .catch(error => {
            console.error('Error al cargar los datos del archivo:', error);
        });
}


function loadFileContent(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Por favor, seleccione un archivo válido.");
        return;
    }

    if (!selectedDate) {
        alert("Por favor, selecciona una fecha en el calendario.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', selectedDate); // Enviar la fecha seleccionada en formato dd/mm/yy

    fetch('/upload_file', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Archivo cargado correctamente. Ahora puedes ir al editor.');
            fileData[selectedDate] = file.name; // Actualiza localmente el archivo asociado
            renderCalendar(currentMonth, currentYear); // Re-renderiza el calendario
        } else {
            alert('Error al cargar el archivo: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al subir el archivo:', error);
        alert('Ocurrió un error al intentar cargar el archivo.');
    });
}


// Navegación entre meses
document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', () => {
    loadFileData(); // Cargar el archivo JSON
    renderCalendar(currentMonth, currentYear); // Renderizar el calendario
});
