const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const today = new Date(); // Fecha actual

const monthYearDisplay = document.getElementById("month-year");
const calendarDays = document.getElementById("calendar-days");
const selectedDateDisplay = document.getElementById("selected-date");

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

        // Resaltar el número del día actual
        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            dayElement.classList.add("current-day"); // Nueva clase para el día actual
        }

        // Evento para seleccionar un día
        dayElement.addEventListener("click", () => {
            // Elimina la clase "selected" de cualquier otro día seleccionado
            document.querySelectorAll(".day.selected").forEach(el => el.classList.remove("selected"));
            // Añade la clase "selected" al día clicado
            dayElement.classList.add("selected");

            const selectedDate = new Date(year, month, day);
            selectedDateDisplay.textContent = `Día seleccionado: ${selectedDate.toLocaleDateString("es-ES")}`;
        });

        calendarDays.appendChild(dayElement);
    }
}

function loadFileContent(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Por favor, seleccione un archivo válido.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload_file', { // Ruta del servidor para subir el archivo
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Archivo cargado correctamente. Ahora puedes ir al editor.');
        } else {
            alert('Error al cargar el archivo: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al subir el archivo:', error);
        alert('Ocurrió un error al intentar cargar el archivo.');
    });
}

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

// Renderiza el calendario inicial
renderCalendar(currentMonth, currentYear);
