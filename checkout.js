/**
 * CHECKOUT.JS - Gestión de Pedidos y Generación de PDF
 * Versión Mejorada 2026
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Elementos de la Interfaz
    const tipoCompraRadios = document.querySelectorAll('input[name="tipo-compra"]');
    const tiendaDiv = document.getElementById("tienda");
    const deliveryDiv = document.getElementById("delivery");
    const generarPDFBtn = document.getElementById("generarPDF");
    const totalCompraDisplay = document.getElementById('totalCompra');

    // 2. Datos del Carrito
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const subtotalProductos = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    // 3. Inicialización de la Interfaz
    if (totalCompraDisplay) {
        totalCompraDisplay.textContent = subtotalProductos.toFixed(2);
    }

    // 4. Lógica de Cambio de Tipo de Compra
    tipoCompraRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const esDelivery = e.target.value === "delivery";
            const costoEnvio = 8.00;

            if (esDelivery) {
                tiendaDiv.style.display = "none";
                deliveryDiv.style.display = "block";
                if (totalCompraDisplay) {
                    totalCompraDisplay.textContent = (subtotalProductos + costoEnvio).toFixed(2);
                }
            } else {
                tiendaDiv.style.display = "block";
                deliveryDiv.style.display = "none";
                if (totalCompraDisplay) {
                    totalCompraDisplay.textContent = subtotalProductos.toFixed(2);
                }
            }
        });
    });

    // 5. Gestión del Botón PDF
    generarPDFBtn.addEventListener("click", () => {
        if (!window.jspdf) {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            script.onload = ejecutarGeneracionPDF;
            document.body.appendChild(script);
        } else {
            ejecutarGeneracionPDF();
        }
    });

    // 6. Función Principal: Generar y Descargar PDF
    function ejecutarGeneracionPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;

        const tipoSeleccionado = document.querySelector('input[name="tipo-compra"]:checked');
        if (!tipoSeleccionado) {
            alert("⚠️ Por favor, selecciona si deseas Recojo en Tienda o Delivery.");
            return;
        }

        // --- ENCABEZADO ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("RESUMEN DE COMPRA", 105, y, { align: "center" });
        
        y += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha: ${new Date().toLocaleDateString()} | Hora: ${new Date().toLocaleTimeString()}`, 10, y);
        
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(10, y, 200, y);
        y += 10;

        // --- LISTADO DE PRODUCTOS ---
        doc.setFont("helvetica", "bold");
        doc.text("Descripción del Pedido", 10, y);
        y += 8;
        doc.setFont("helvetica", "normal");

        carrito.forEach(item => {
            const subtotalItem = item.precio * item.cantidad;
            doc.text(`${item.nombre}`, 10, y);
            doc.text(`x${item.cantidad}`, 110, y);
            doc.text(`S/ ${subtotalItem.toFixed(2)}`, 190, y, { align: "right" });
            y += 7;
        });

        y += 5;
        doc.line(10, y, 200, y);
        y += 10;

        // --- DATOS DE ENTREGA Y COSTOS ---
        let costoFinalEnvio = 0;

        if (tipoSeleccionado.value === "tienda") {
            const localRadio = document.querySelector('input[name="local"]:checked');
            if (!localRadio) {
                alert("❌ Selecciona un local para el recojo.");
                return;
            }
            const labelVinculado = document.querySelector(`label[for="${localRadio.id}"]`);
            const nombreLocal = labelVinculado.querySelector('strong').innerText;
            const direccionDetallada = labelVinculado.querySelector('p').innerText;

            doc.setFont("helvetica", "bold");
            doc.text("Método: Recojo en Local", 10, y);
            y += 7;
            doc.setFont("helvetica", "normal");
            doc.text(`Local: ${nombreLocal}`, 10, y); 
            y += 6;
            doc.text(`Dir: ${direccionDetallada}`, 10, y); 
            y += 10;
        } else {
            // --- SECCIÓN DE DELIVERY CORREGIDA ---
            const nombreCli = document.querySelector('input[placeholder="Nombre completo"]').value;
            const direccionCli = document.querySelector('input[placeholder="Dirección exacta"]').value;
            const telefonoCli = document.querySelector('input[placeholder="Número celular"]').value;

            if (!nombreCli || !direccionCli || !telefonoCli) {
                alert("❌ Por favor, completa todos los datos de envío.");
                return;
            }

            costoFinalEnvio = 5.90;

            doc.setFont("helvetica", "bold");
            doc.text("Método: Delivery a Domicilio", 10, y);
            y += 7;
            doc.setFont("helvetica", "normal");
            doc.text(`Cliente: ${nombreCli}`, 10, y); y += 6;
            doc.text(`Dirección: ${direccionCli}`, 10, y); y += 6;
            doc.text(`Teléfono: ${telefonoCli}`, 10, y); y += 6;
            doc.text(`Costo de Envío: S/ ${costoFinalEnvio.toFixed(2)}`, 10, y);
            y += 10;
        }

        // --- TOTAL FINAL ---
        const totalFinal = subtotalProductos + costoFinalEnvio;
        
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y, 190, 12, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`TOTAL A PAGAR: S/ ${totalFinal.toFixed(2)}`, 15, y + 8);

        // --- PIE DE PÁGINA ---
        y += 30;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text("Instrucciones: Envía este PDF junto a tu captura de Yape/Plin", 105, y, { align: "center" });
        doc.text("al WhatsApp: 912886670 para confirmar tu pedido.", 105, y + 5, { align: "center" });

        const nombreArchivo = `Pedido_Ecommerce_${Date.now()}.pdf`;
        doc.save(nombreArchivo);
        alert("✅ PDF generado con éxito.");
    }
});

// 7. Lógica para el botón de WhatsApp
// --- LÓGICA PARA EL BOTÓN DE WHATSAPP (CORREGIDO PARA MÓVILES) ---
const btnWhatsapp = document.getElementById("btnWhatsapp");

if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", () => {
        const tipoSeleccionado = document.querySelector('input[name="tipo-compra"]:checked');
        
        if (!tipoSeleccionado) {
            alert("⚠️ Por favor, selecciona primero si es Recojo o Delivery.");
            return;
        }

        const numeroTelefono = "51912886670"; // Prefijo 51 para Perú
        const total = document.getElementById('totalCompra').textContent;
        const metodo = tipoSeleccionado.value === 'tienda' ? 'Recojo en Local' : 'Delivery';

        // Creamos el mensaje con saltos de línea (%0A)
        let mensaje = `*PEDIDO NUEVO - LA BOTELLA BORRACHA*%0A`;
        mensaje += `--------------------------%0A`;
        mensaje += `*Total:* S/ ${total}%0A`;
        mensaje += `*Método:* ${metodo}%0A%0A`;
        mensaje += `_Hola, adjunto mi resumen en PDF y mi captura de pago._`;

        // Usamos wa.me que es el estándar universal para móvil y PC
        const url = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
        
        // Abrir en una pestaña nueva
        window.open(url, '_blank');
    });
}







function copiarNumero() {
    const numero = document.getElementById("numeroYape").innerText;
    const mensaje = document.getElementById("copiadoMsg");

    navigator.clipboard.writeText(numero);

    // Mostrar mensaje
    mensaje.style.opacity = "1";

    setTimeout(() => {
        mensaje.style.opacity = "0";
    }, 1500);
}