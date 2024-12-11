function confirmDelete(userId) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.href = `/delete_user/${userId}`;
    modal.show();
}

document.getElementById('addUserForm').addEventListener('submit', function(event) {
    const password = document.getElementById('password').value;
    if (!password || password.length < 6) {
        event.preventDefault();
        alert('La contraseña debe tener al menos 6 caracteres.');
    }
});
