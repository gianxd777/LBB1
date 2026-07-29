document.addEventListener('DOMContentLoaded', () => {
  const estado = {
    metodo: null,
    local: null,
    dni: '', nombre: '', celular: '',
    distrito: '', sector: '',
    ubicacionUrl: '',
    costoEnvio: 0,
    total: '0.00'
  };

  const NUMERO_WHATSAPP = '51912886670'; // formato internacional sin '+'

  const SECTORES_POR_DISTRITO = {
    'Huancayo': ['Zona Monumental (Centro)', 'San Carlos', 'Palián', 'Torre Torre', 'Chorrillos', 'Ocopilla', 'Cajas Chico', 'La Ribera'],
    'Chilca': ['Azapampa', 'Auquimarca', 'Auray', 'Tanquiscancha'],
    'El Tambo': ['Cochas Grande', 'Cochas Chico', 'Cullpa Alta', 'Cullpa Baja', 'Incho', 'Saños Chico', 'Saños Grande', 'Aza', 'Umuto', 'La Esperanza']
  };

  const COSTO_ENVIO_POR_DISTRITO = { 'Huancayo': 12, 'Chilca': 15, 'El Tambo': 18 };
  const ETIQUETA_SECTOR = { 'Huancayo': 'Sector', 'Chilca': 'Anexo', 'El Tambo': 'Anexo' };

  // ---------- Navegación entre pantallas ----------
  const pantallas = document.querySelectorAll('.pantalla');
  const pasos = document.querySelectorAll('.pasos-indicador .paso');
  const pasoUbicacion = document.getElementById('pasoUbicacion');

  function secuenciaPantallas() {
    return estado.metodo === 'tienda' ? [1, 2, 4] : [1, 2, 3, 4];
  }

  function mostrarPantalla(n) {
    pantallas.forEach(p => p.hidden = true);
    document.getElementById(`pantalla-${n}`).hidden = false;

    const secuencia = secuenciaPantallas();
    pasoUbicacion.classList.toggle('oculto', estado.metodo === 'tienda');

    pasos.forEach(p => {
      const num = Number(p.dataset.paso);
      if (num === 3 && estado.metodo === 'tienda') { p.classList.remove('activo', 'completo'); return; }
      p.classList.toggle('activo', num === n);
      p.classList.toggle('completo', secuencia.includes(num) && secuencia.indexOf(num) < secuencia.indexOf(n));
    });

    if (n === 3) {
      // El contenedor del mapa recién tiene tamaño real cuando la pantalla deja de estar oculta
      requestAnimationFrame(() => inicializarMapaUbicacion());
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function irSiguiente(actual) {
    const secuencia = secuenciaPantallas();
    const idx = secuencia.indexOf(actual);
    mostrarPantalla(secuencia[idx + 1]);
  }

  function irAnterior(actual) {
    const secuencia = secuenciaPantallas();
    const idx = secuencia.indexOf(actual);
    mostrarPantalla(secuencia[idx - 1]);
  }

  // ---------- Carrito (asumido en localStorage) ----------
  function obtenerCarrito() {
    try { return JSON.parse(localStorage.getItem('carrito')) || []; }
    catch { return []; }
  }

  function calcularSubtotal() {
    const carrito = obtenerCarrito();
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  // ================= PANTALLA 1: ENTREGA =================
  const metodoBtns = document.querySelectorAll('.metodo-btn');
  const catalogoTiendas = document.getElementById('catalogoTiendas');
  const localBtns = document.querySelectorAll('.local-btn');
  const errorMetodo = document.getElementById('errorMetodo');
  const btnSiguiente1 = document.getElementById('btnSiguiente1');

  metodoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      metodoBtns.forEach(b => b.classList.remove('seleccionado'));
      btn.classList.add('seleccionado');
      estado.metodo = btn.dataset.metodo;
      errorMetodo.hidden = true;

      if (estado.metodo === 'tienda') {
        catalogoTiendas.hidden = false;
        estado.local = null;
        estado.costoEnvio = 0;
        localBtns.forEach(b => b.classList.remove('seleccionado'));
      } else {
        catalogoTiendas.hidden = true;
        estado.local = null;
      }
      actualizarBoton1();
    });
  });

  localBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      localBtns.forEach(b => b.classList.remove('seleccionado'));
      btn.classList.add('seleccionado');
      estado.local = btn.dataset.local;
      actualizarBoton1();
    });
  });

  function actualizarBoton1() {
    const listo = estado.metodo === 'delivery' || (estado.metodo === 'tienda' && estado.local);
    btnSiguiente1.disabled = !listo;
  }

  btnSiguiente1.addEventListener('click', () => irSiguiente(1));

  // ================= PANTALLA 2: DATOS DEL CLIENTE =================
  const formDatos = document.getElementById('formDatos');
  const btnSiguiente2 = document.getElementById('btnSiguiente2');
  const btnVolver2 = document.getElementById('btnVolver2');

  const inputDni = document.getElementById('cli-dni');
  const inputNombre = document.getElementById('cli-nombre');
  const inputCelular = document.getElementById('cli-celular');

  function mostrarErrorCampo(input) {
    const msg = document.querySelector(`[data-error-for="${input.id}"]`);
    if (!msg) return;
    msg.hidden = input.checkValidity() || input.value === '';
  }

  function validarPantalla2() {
    btnSiguiente2.disabled = !formDatos.checkValidity();
    [inputDni, inputNombre, inputCelular].forEach(mostrarErrorCampo);
  }

  formDatos.addEventListener('input', validarPantalla2);
  btnVolver2.addEventListener('click', () => irAnterior(2));

  btnSiguiente2.addEventListener('click', () => {
    if (!formDatos.checkValidity()) { formDatos.reportValidity(); return; }

    estado.dni = inputDni.value.trim();
    estado.nombre = inputNombre.value.trim();
    estado.celular = inputCelular.value.trim();

    if (estado.metodo === 'delivery') irSiguiente(2);
    else { prepararPantalla4(); irSiguiente(2); }
  });

  // ================= PANTALLA 3: UBICACIÓN (solo delivery) =================
  const formUbicacion = document.getElementById('formUbicacion');
  const btnSiguiente3 = document.getElementById('btnSiguiente3');
  const btnVolver3 = document.getElementById('btnVolver3');

  const selectDistrito = document.getElementById('ubi-distrito');
  const selectSector = document.getElementById('ubi-sector');
  const sectorLabel = document.getElementById('ubi-sector-label');
  const sectorOtroWrap = document.getElementById('sectorOtroWrap');
  const inputSectorOtro = document.getElementById('ubi-sector-otro');

  const envioResumen = document.getElementById('envioResumen');
  const envioMonto = document.getElementById('envioMonto');

  selectDistrito.addEventListener('change', () => {
    const distrito = selectDistrito.value;
    estado.distrito = distrito;
    estado.costoEnvio = COSTO_ENVIO_POR_DISTRITO[distrito] || 0;

    sectorLabel.textContent = ETIQUETA_SECTOR[distrito] || 'Sector / Anexo';
    selectSector.disabled = false;
    selectSector.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>' +
      SECTORES_POR_DISTRITO[distrito].map(s => `<option value="${s}">${s}</option>`).join('') +
      '<option value="Otro">Otro (especificar)</option>';
    estado.sector = '';
    sectorOtroWrap.hidden = true;
    inputSectorOtro.value = '';

    envioMonto.textContent = `S/ ${estado.costoEnvio.toFixed(2)}`;
    envioResumen.hidden = false;

    validarPantalla3();
  });

  selectSector.addEventListener('change', () => {
    const esOtro = selectSector.value === 'Otro';
    sectorOtroWrap.hidden = !esOtro;
    if (!esOtro) inputSectorOtro.value = '';
    estado.sector = esOtro ? '' : selectSector.value;
    validarPantalla3();
  });

  function validarPantalla3() {
    const okDistrito = !!selectDistrito.value;
    const esOtro = selectSector.value === 'Otro';
    const okSector = esOtro
      ? (inputSectorOtro.value.trim().length >= 3)
      : !!selectSector.value;

    document.querySelector('[data-error-for="ubi-distrito"]').hidden = okDistrito;
    document.querySelector('[data-error-for="ubi-sector"]').hidden = !!selectSector.value || selectSector.disabled;
    document.querySelector('[data-error-for="ubi-sector-otro"]').hidden = !esOtro || okSector;

    btnSiguiente3.disabled = !(okDistrito && okSector);
  }

  formUbicacion.addEventListener('input', validarPantalla3);

  btnVolver3.addEventListener('click', () => irAnterior(3));

  btnSiguiente3.addEventListener('click', () => {
    estado.sector = selectSector.value === 'Otro' ? inputSectorOtro.value.trim() : selectSector.value;
    prepararPantalla4();
    irSiguiente(3);
  });

  // ---------- Ubicación GPS + Mapa interactivo con pin arrastrable (dentro de pantalla 3) ----------
  const btnUbicacion = document.getElementById('btnUbicacion');
  const btnUbicacionTexto = document.getElementById('btnUbicacionTexto');
  const ubicacionResultado = document.getElementById('ubicacionResultado');
  const ubicacionCoords = document.getElementById('ubicacionCoords');
  const ubicacionUrlTexto = document.getElementById('ubicacionUrlTexto');
  const ubicacionLink = document.getElementById('ubicacionLink');
  const ubicacionError = document.getElementById('ubicacionError');
  const btnCopiarUbicacion = document.getElementById('btnCopiarUbicacion');
  const ubicacionCopiadoMsg = document.getElementById('ubicacionCopiadoMsg');
  const ubicacionModificadaMsg = document.getElementById('ubicacionModificadaMsg');

  const CENTRO_DEFAULT = [-12.0651, -75.2049]; // Huancayo, Junín
  let mapaUbicacion = null;
  let pinUbicacion = null;

  const iconoPinRojo = () => L.divIcon({
    className: 'pin-rojo-wrap',
    html: '<div class="pin-rojo"></div>',
    iconSize: [26, 34],
    iconAnchor: [13, 32]
  });

  // Se llama recién cuando la pantalla 3 se hace visible (Leaflet necesita medir un contenedor con tamaño real)
  function inicializarMapaUbicacion() {
    if (mapaUbicacion) { mapaUbicacion.invalidateSize(); return; }

    mapaUbicacion = L.map('mapaUbicacion', { zoomControl: true }).setView(CENTRO_DEFAULT, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(mapaUbicacion);

    pinUbicacion = L.marker(CENTRO_DEFAULT, { draggable: true, icon: iconoPinRojo() }).addTo(mapaUbicacion);

    // Arrastrar el pin = control total del usuario sobre su ubicación exacta
    pinUbicacion.on('dragend', () => {
      const { lat, lng } = pinUbicacion.getLatLng();
      guardarUbicacion(lat, lng, { avisar: true });
    });

    // Tocar/clickear el mapa también mueve el pin ahí
    mapaUbicacion.on('click', (e) => {
      pinUbicacion.setLatLng(e.latlng);
      guardarUbicacion(e.latlng.lat, e.latlng.lng, { avisar: true });
    });
  }

  // Guarda la ubicación (coords + link de Google Maps) para que quede lista para copiar/enviar
  function guardarUbicacion(lat, lng, { avisar = false } = {}) {
    const latF = lat.toFixed(6);
    const lngF = lng.toFixed(6);
    estado.ubicacionUrl = `https://www.google.com/maps?q=${latF},${lngF}`;

    ubicacionCoords.textContent = `Ubicación: ${latF}, ${lngF}`;
    ubicacionUrlTexto.textContent = estado.ubicacionUrl;
    ubicacionLink.href = estado.ubicacionUrl;
    ubicacionResultado.hidden = false;
    document.getElementById('ubi-pegar-enlace').value = estado.ubicacionUrl;

    if (avisar) {
      ubicacionModificadaMsg.hidden = false;
      ubicacionModificadaMsg.classList.add('visible');
      clearTimeout(guardarUbicacion._timeout);
      guardarUbicacion._timeout = setTimeout(() => {
        ubicacionModificadaMsg.classList.remove('visible');
      }, 2500);
    }
  }

  btnUbicacion.addEventListener('click', () => {
    ubicacionError.hidden = true;

    if (!navigator.geolocation) {
      ubicacionError.textContent = 'Tu navegador no soporta geolocalización.';
      ubicacionError.hidden = false;
      return;
    }

    btnUbicacion.disabled = true;
    btnUbicacionTexto.textContent = 'Buscando ubicación...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        if (mapaUbicacion && pinUbicacion) {
          pinUbicacion.setLatLng([latitude, longitude]);
          mapaUbicacion.setView([latitude, longitude], 17);
        }
        guardarUbicacion(latitude, longitude, { avisar: false });

        btnUbicacionTexto.textContent = 'Actualizar ubicación';
        btnUbicacion.disabled = false;
      },
      (err) => {
        let msg = 'No se pudo obtener la ubicación.';
        if (err.code === 1) msg = 'Permiso de ubicación denegado.';
        else if (err.code === 2) msg = 'Ubicación no disponible.';
        else if (err.code === 3) msg = 'Tiempo de espera agotado.';

        ubicacionError.textContent = msg;
        ubicacionError.hidden = false;

        btnUbicacionTexto.textContent = 'Usar mi ubicación actual';
        btnUbicacion.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  btnCopiarUbicacion.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(estado.ubicacionUrl);
      ubicacionCopiadoMsg.classList.add('visible');
      setTimeout(() => ubicacionCopiadoMsg.classList.remove('visible'), 2000);
    } catch (e) {
      alert('No se pudo copiar. Enlace: ' + estado.ubicacionUrl);
    }
  });

  // ---------- Pegar enlace de Maps manualmente (alternativa al GPS) ----------
  const inputPegarEnlace = document.getElementById('ubi-pegar-enlace');
  const ubicacionPegarMsg = document.getElementById('ubicacionPegarMsg');

  inputPegarEnlace.addEventListener('input', () => {
    const valor = inputPegarEnlace.value.trim();
    if (valor) {
      estado.ubicacionUrl = valor;
      ubicacionPegarMsg.classList.add('visible');
    } else {
      ubicacionPegarMsg.classList.remove('visible');
    }
  });

  // ================= PANTALLA 4: PAGO =================
  const btnVolver4 = document.getElementById('btnVolver4');
  const aceptaTerminos = document.getElementById('aceptaTerminos');
  const btnPagar = document.getElementById('btnPagar');
  const btnEnviarComprobante = document.getElementById('btnEnviarComprobante');
  const resumenEnvio = document.getElementById('resumenEnvio');

  function prepararPantalla4() {
    const carrito = obtenerCarrito();
    const subtotal = calcularSubtotal();
    const envio = estado.metodo === 'delivery' ? estado.costoEnvio : 0;
    const total = subtotal + envio;
    estado.total = total.toFixed(2);

    const contenedor = document.getElementById('resumenPedido');
    contenedor.innerHTML = carrito.length
      ? carrito.map(item => `<div class="item-fila"><span>${item.cantidad}x ${item.nombre}</span><span>S/ ${(item.precio * item.cantidad).toFixed(2)}</span></div>`).join('')
      : '<p class="error-msg">Tu carrito está vacío.</p>';

    if (envio > 0) {
      resumenEnvio.innerHTML = `<div class="item-fila envio-fila"><span>Envío (${estado.distrito})</span><span>S/ ${envio.toFixed(2)}</span></div>`;
      resumenEnvio.hidden = false;
    } else {
      resumenEnvio.hidden = true;
    }

    document.getElementById('totalCompra').textContent = estado.total;
    document.getElementById('montoBotonPagar').textContent = estado.total;

    actualizarBotonesPago();
  }

  aceptaTerminos.addEventListener('change', actualizarBotonesPago);

  function actualizarBotonesPago() {
    btnPagar.disabled = !aceptaTerminos.checked;
    // el botón de WhatsApp se habilita recién después de pagar (descargar boleta)
  }

  btnVolver4.addEventListener('click', () => irAnterior(4));

  // Copiar número (Yape/Plin o cuenta bancaria)
  document.querySelectorAll('.btn-copiar').forEach(btn => {
    btn.addEventListener('click', () => {
      const numero = btn.dataset.copy;
      navigator.clipboard.writeText(numero).then(() => {
        const msg = document.getElementById('copiadoMsg');
        msg.classList.add('visible');
        setTimeout(() => msg.classList.remove('visible'), 2000);
      }).catch(() => alert('No se pudo copiar. Número: ' + numero));
    });
  });

  // ---------- Generar PDF: Nota de Venta ----------
  const NOMBRE_EMPRESA = 'LICORERÍA LA BOTELLA BORRACHA';
  const RUBRO_EMPRESA = 'Venta al por mayor y menor de licores';
  const LOCAL_EMPRESA = 'Local: Cooperativa Santa Isabel — Mz S Lote 22';
  const IGV_TASA = 0.18;

  btnPagar.addEventListener('click', () => {
    if (!aceptaTerminos.checked) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const anchoPagina = doc.internal.pageSize.getWidth();
    const margen = 14;
    let y = 0;

    // ---- Encabezado / logo de la empresa ----
    doc.setFillColor(200, 30, 58); // acento de marca
    doc.rect(0, 0, anchoPagina, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('LICORERIA LA BOTELLA BORRACHA', anchoPagina / 2, 12, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont(undefined, 'normal');
    doc.text(RUBRO_EMPRESA, anchoPagina / 2, 19, { align: 'center' });
    doc.text(LOCAL_EMPRESA, anchoPagina / 2, 25, { align: 'center' });

    y = 42; // Esto asegura que lo siguiente comience debajo del banner rojo
    doc.setTextColor(20, 16, 14);

    // ---- Título y fecha/hora de emisión ----
    const ahora = new Date();
    const fecha = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()}`;
    const hora = ahora.toLocaleTimeString('es-PE', { hour12: false });

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('NOTA DE VENTA', margen, y);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${fecha} | Hora: ${hora}`, anchoPagina - margen, y, { align: 'right' });
    y += 6;
    doc.setDrawColor(200, 30, 58);
    doc.line(margen, y, anchoPagina - margen, y);
    y += 8;

    // ---- Datos del cliente ----
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Datos del cliente', margen, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`DNI: ${estado.dni}`, margen, y);
    doc.text(`Nombre: ${estado.nombre}`, margen + 70, y);
    y += 6;
    doc.text(`Celular: ${estado.celular}`, margen, y);
    y += 10;

    // ---- Datos de entrega ----
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Entrega', margen, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    if (estado.metodo === 'tienda') {
      doc.text(`Recojo en tienda: ${estado.local}`, margen, y);
      y += 6;
    } else {
      doc.text(`Departamento: Junín  /  Provincia: Huancayo  /  Distrito: ${estado.distrito}`, margen, y);
      y += 6;
      doc.text(`Sector / Anexo: ${estado.sector}`, margen, y);
      y += 6;
      doc.text(`Celular de contacto: ${estado.celular}`, margen, y);
      y += 6;
      if (estado.ubicacionUrl) {
        doc.text(`Ubicación (GPS): ${estado.ubicacionUrl}`, margen, y);
        y += 6;
      }
      doc.text(`Costo de envío: S/ ${estado.costoEnvio.toFixed(2)}`, margen, y);
      y += 6;
    }
    y += 4;

    // ---- Tabla de productos ----
    const carrito = obtenerCarrito();
    const filas = carrito.map(item => {
      const totalItem = item.precio * item.cantidad;
      const baseItem = totalItem / (1 + IGV_TASA);
      const igvItem = totalItem - baseItem;
      return [
        item.cantidad,
        item.nombre,
        `S/ ${item.precio.toFixed(2)}`,
        `S/ ${igvItem.toFixed(2)}`,
        `S/ ${totalItem.toFixed(2)}`
      ];
    });

    doc.autoTable({
      startY: y,
      margin: { left: margen, right: margen },
      head: [['Cant.', 'Descripción', 'P. Unit.', 'IGV (18%)', 'Total']],
      body: filas.length ? filas : [['-', 'Carrito vacío', '-', '-', '-']],
      headStyles: { fillColor: [36, 28, 24], textColor: [245, 239, 230] },
      styles: { fontSize: 9, textColor: [30, 25, 22] },
      columnStyles: { 0: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ---- Totales ----
    const subtotal = calcularSubtotal();
    const envio = estado.metodo === 'delivery' ? estado.costoEnvio : 0;
    const totalFinal = subtotal + envio;
    estado.total = totalFinal.toFixed(2);

    doc.setFontSize(10);
    doc.text('Subtotal productos:', anchoPagina - margen - 60, y);
    doc.text(`S/ ${subtotal.toFixed(2)}`, anchoPagina - margen, y, { align: 'right' });
    y += 6;

    if (envio > 0) {
      doc.text('Costo de envío:', anchoPagina - margen - 60, y);
      doc.text(`S/ ${envio.toFixed(2)}`, anchoPagina - margen, y, { align: 'right' });
      y += 6;
    }

    doc.setDrawColor(200, 30, 58);
    doc.line(anchoPagina - margen - 60, y, anchoPagina - margen, y);
    y += 6;

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL A PAGAR:', anchoPagina - margen - 60, y);
    doc.text(`S/ ${estado.total}`, anchoPagina - margen, y, { align: 'right' });
    y += 14;

    // ---- Instrucciones finales ----
    doc.setFillColor(241, 239, 232);
    doc.roundedRect(margen, y, anchoPagina - margen * 2, 18, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(20, 16, 14);
    doc.text('Instrucciones:', margen + 4, y + 7);
    doc.setFont(undefined, 'normal');
    doc.text('Envía este PDF junto a tu captura de Yape/Plin al WhatsApp: 912886670', margen + 4, y + 13);
    doc.text('para confirmar tu pedido.', margen + 4, y + 17.5);

    doc.save('nota-de-venta.pdf');

    document.getElementById('totalCompra').textContent = estado.total;
    document.getElementById('montoBotonPagar').textContent = estado.total;

    btnEnviarComprobante.disabled = false;
  });

  // ---------- Enviar comprobante por WhatsApp ----------
  btnEnviarComprobante.addEventListener('click', () => {
    let mensaje = `Hola, adjunto mi comprobante de pago.%0ADNI: ${encodeURIComponent(estado.dni)}%0ANombre: ${encodeURIComponent(estado.nombre)}%0ACelular: ${encodeURIComponent(estado.celular)}%0ATotal: S/ ${estado.total}%0A`;

    if (estado.metodo === 'tienda') {
      mensaje += `Recojo en: ${encodeURIComponent(estado.local)}`;
    } else {
      mensaje += `Distrito: ${encodeURIComponent(estado.distrito)} - ${encodeURIComponent(estado.sector)}%0AEnvío: S/ ${estado.costoEnvio.toFixed(2)}`;
      if (estado.ubicacionUrl) {
        mensaje += `%0AUbicación GPS: ${encodeURIComponent(estado.ubicacionUrl)}`;
      }
    }

    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, '_blank');
  });

  // ---------- Init ----------
  mostrarPantalla(1);
});