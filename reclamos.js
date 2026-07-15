/**
 * RECLAMOS.JS - Libro de Reclamaciones
 * Botón 1: descarga toda la info del formulario en PDF (jsPDF, igual que checkout.js)
 * Botón 2: envía el reclamo por WhatsApp
 */

const NUMERO_WHATSAPP_RECLAMOS = "51912886670"; // mismo número que usas en checkout.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formReclamo");
  const btnPDF = document.getElementById("btnDescargarPDF");

  const inputFecha = document.getElementById("fechaHecho");
  if (inputFecha) inputFecha.max = new Date().toISOString().split("T")[0];

  function leerDatos() {
    if (!form.checkValidity()) {
      form.reportValidity();
      return null;
    }
    return {
      tipo: document.querySelector('input[name="tipo"]:checked').value,
      nombre: document.getElementById("nombre").value.trim(),
      documento: document.getElementById("documento").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      email: document.getElementById("email").value.trim(),
      domicilio: document.getElementById("domicilio").value.trim(),
      producto: document.getElementById("producto").value.trim(),
      monto: document.getElementById("monto").value.trim(),
      fechaHecho: document.getElementById("fechaHecho").value,
      descripcion: document.getElementById("descripcion").value.trim(),
      pedido: document.getElementById("pedido").value.trim(),
    };
  }

  // ---------------- Enviar por WhatsApp ----------------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = leerDatos();
    if (!datos) return;

    let mensaje = `*${datos.tipo.toUpperCase()}*\n`;
    mensaje += `--------------------------\n`;
    mensaje += `*Consumidor:* ${datos.nombre}\n`;
    mensaje += `*Doc:* ${datos.documento}\n`;
    mensaje += `*Teléfono:* ${datos.telefono}\n`;
    mensaje += `*Email:* ${datos.email}\n`;
    mensaje += `*Domicilio:* ${datos.domicilio}\n\n`;
    mensaje += `*Producto/servicio:* ${datos.producto}\n`;
    if (datos.monto) mensaje += `*Monto reclamado:* S/ ${datos.monto}\n`;
    mensaje += `*Fecha del hecho:* ${datos.fechaHecho}\n\n`;
    mensaje += `*Descripción:*\n${datos.descripcion}\n\n`;
    mensaje += `*Solución solicitada:*\n${datos.pedido}`;

    const url = `https://wa.me/${NUMERO_WHATSAPP_RECLAMOS}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  });

  // ---------------- Descargar PDF ----------------
  btnPDF.addEventListener("click", () => {
    const datos = leerDatos();
    if (!datos) return;

    if (!window.jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => generarPDF(datos);
      document.body.appendChild(script);
    } else {
      generarPDF(datos);
    }
  });

  function generarPDF(datos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("LIBRO DE RECLAMACIONES", 105, y, { align: "center" });

    y += 8;
    doc.setFontSize(11);
    doc.text(datos.tipo.toUpperCase(), 105, y, { align: "center" });

    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de registro: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, y);

    y += 6;
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Datos del consumidor", 10, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${datos.nombre}`, 10, y); y += 6;
    doc.text(`Documento: ${datos.documento}`, 10, y); y += 6;
    doc.text(`Teléfono: ${datos.telefono}`, 10, y); y += 6;
    doc.text(`Email: ${datos.email}`, 10, y); y += 6;
    doc.text(`Domicilio: ${datos.domicilio}`, 10, y);

    y += 10;
    doc.line(10, y, 200, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Detalle de la reclamación", 10, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`Producto/servicio: ${datos.producto}`, 10, y); y += 6;
    if (datos.monto) {
      doc.text(`Monto reclamado: S/ ${datos.monto}`, 10, y);
      y += 6;
    }
    doc.text(`Fecha del hecho: ${datos.fechaHecho}`, 10, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Descripción:", 10, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const descLineas = doc.splitTextToSize(datos.descripcion, 190);
    doc.text(descLineas, 10, y);
    y += descLineas.length * 5 + 5;

    doc.setFont("helvetica", "bold");
    doc.text("Solución solicitada:", 10, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const pedidoLineas = doc.splitTextToSize(datos.pedido, 190);
    doc.text(pedidoLineas, 10, y);
    y += pedidoLineas.length * 5 + 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    const pie = doc.splitTextToSize(
      "El proveedor debe dar respuesta en un plazo no mayor a 15 días hábiles. Guarda esta constancia como comprobante.",
      190
    );
    doc.text(pie, 105, y, { align: "center" });

    doc.save(`Libro_Reclamaciones_${Date.now()}.pdf`);
  }
});