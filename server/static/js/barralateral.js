let sidebarOpen = false; // Estado de la barra lateral

        function toggleSidebar() {
            const sidebar = document.getElementById("mySidebar");
            const editorContainer = document.getElementById("editor-container");
            const toggleButton = document.getElementById("toggleButton");
            
            if (sidebarOpen) {
                sidebar.style.width = "0";
                editorContainer.style.marginRight = "0";
                toggleButton.style.right = "0"; // Coloca el botón de nuevo a la derecha
            } else {
                sidebar.style.width = "250px";
                editorContainer.style.marginRight = "250px";
                toggleButton.style.right = "250px"; // Mueve el botón junto con la barra lateral
            }
            sidebarOpen = !sidebarOpen; // Alterna el estado
        }

        // Ejemplos de funciones que se pueden ejecutar al hacer clic en los botones
        function funcion1() {
            alert("Función 1 ejecutada");
        }

        function funcion2() {
            alert("Función 2 ejecutada");
        }

        function funcion3() {
            alert("Función 3 ejecutada");
        }