const socket = io.connect('http://localhost:5000');

socket.on('connect', () => {
    console.log('Conexión establecida con el servidor.');
});

socket.on('disconnect', () => {
    console.log('Conexión con el servidor perdida.');
});

function sendRequest(scriptFile, logFile) {
    const message = JSON.stringify({
        script_file: scriptFile,
        log_file: logFile
    });
    socket.emit('message', message);
}

socket.on('response', (response) => {
    const data = JSON.parse(response);
    if (data.status === "success") {
        alert(`Contenido del Log:\n${data.log_content}\n\nSalida del Script:\n${data.script_output}`);
    } else {
        alert(`Error: ${data.message}`);
    }
});

function del_dupli() {
    console.log('del_dupli exec');
    sendRequest('remove_duplicates_log.py', 'prueba.log');
}

function prueba() {
    console.log('prueba exec');
    sendRequest('prueba.py', 'pruab1.log');
}