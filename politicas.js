/**
 * POLITICAS.JS
 * Funcionalidad básica para la página de Políticas de Privacidad
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Establecer la fecha de hoy como fecha de última actualización
    const elementoFecha = document.getElementById("fechaActualizacion");
    if (elementoFecha) {
        const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
        // Esto mostrará por ejemplo: "14 de julio de 2026"
        const fechaHoy = new Date().toLocaleDateString('es-PE', opcionesFecha);
        elementoFecha.textContent = fechaHoy;
    }

    // 2. Funcionalidad para imprimir el documento
    const btnImprimir = document.getElementById("btnImprimir");
    if (btnImprimir) {
        btnImprimir.addEventListener("click", () => {
            window.print();
        });
    }
});