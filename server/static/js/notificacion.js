// Función para mostrar la notificación con el mensaje proporcionado
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    
    // Asegurarse de que la posición inicial se aplica antes de la transición
    notification.classList.remove('show');
    
    // Usar un pequeño retardo antes de añadir la clase 'show'
    setTimeout(() => {
        notification.classList.add('show'); // Añade la clase 'show' para activar la animación
    }, 10); // Retardo de 10ms para dar tiempo al navegador

    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show'); // Quita la clase 'show' para ocultar
    }, 3000);
}