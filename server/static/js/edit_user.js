// Mensaje flash automático con tiempo límite
document.addEventListener("DOMContentLoaded", () => {
    const alert = document.querySelector('.alert');
    if (alert) {
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000); // Oculta el mensaje después de 5 segundos
    }
});
