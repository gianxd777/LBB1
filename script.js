// ========================
// Toggle del menú hamburguesa
// ========================
const toggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (toggle && mobileMenu) {
  toggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
  });
}

// ========================
// Intercambio de menú principal y categorías (CORREGIDO)
// ========================
const botonesCategorias = document.querySelectorAll(".productos-btn"); // Selecciona AMBOS botones
const volverBtns = document.querySelectorAll(".volver-btn"); // Selecciona AMBOS botones de volver
const menusCategorias = document.querySelectorAll(".menu-categorias"); // Selecciona AMBOS bloques de categorías
const menuPrincipal = document.querySelector(".menu-principal");

if (botonesCategorias.length > 0 && menuPrincipal) {
  
  // Lógica para abrir
  botonesCategorias.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      menuPrincipal.classList.add("hide");
      // Abrimos el menú de categorías que corresponde a la posición del botón
      menusCategorias[index].classList.add("active");
    });
  });

  // Lógica para volver
  volverBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Quitamos el active de todos los menús de categorías
      menusCategorias.forEach(menu => menu.classList.remove("active"));
      menuPrincipal.classList.remove("hide");
    });
  });
}

// ========================
// Carrito lateral
// ========================
const carritoIcon = document.querySelectorAll('a[aria-label="Carrito"]');
const carritoSidebar = document.getElementById("carritoSidebar");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const carritoItems = document.querySelector(".carrito-items");
const carritoTotal = document.getElementById("carritoTotal");

// Recuperar carrito guardado o iniciar vacío
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Abrir carrito
carritoIcon.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    e.preventDefault();
    carritoSidebar.classList.add("open");
  });
});

// Cerrar carrito
if (cerrarCarrito) {
  cerrarCarrito.addEventListener("click", () => {
    carritoSidebar.classList.remove("open");
  });
}

// ========================
// Agregar producto al carrito
// ========================
const botonesAgregar = document.querySelectorAll("button[aria-label^='Agregar']");

botonesAgregar.forEach((btn) => {
  btn.addEventListener("click", () => {
    const articulo = btn.closest("article");
    const id = articulo.dataset.productoId || Math.random().toString(36).substr(2, 9);
    const nombre = articulo.querySelector("h3").textContent;
    const precioText = articulo.querySelector("strong")
      ? articulo.querySelector("strong").textContent
      : articulo.querySelector(".precio-nuevo").textContent;
    const precio = parseFloat(precioText.replace("S/", "").trim().replace(",", "."));

    const img = articulo.querySelector("img").src;

    const itemExistente = carrito.find((p) => p.id === id);

    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      carrito.push({ id, nombre, precio, img, cantidad: 1 });
    }

    renderCarrito();
    carritoSidebar.classList.add("open");
  });
});

// ========================
// Renderizar carrito
// ========================
function renderCarrito() {
  carritoItems.innerHTML = "";
  let total = 0;

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const div = document.createElement("div");
    div.classList.add("carrito-item");

    div.innerHTML = `
      <img src="${item.img}" alt="${item.nombre}">
      <div class="item-info">
        <h4>${item.nombre}</h4>
        <p>Precio: S/ ${item.precio.toFixed(2)}</p>
        <p>Subtotal: S/ ${subtotal.toFixed(2)}</p>
      </div>
      <div class="cantidad">
        <button class="menos" data-id="${item.id}">-</button>
        <span class="cantidad-text">${item.cantidad}</span>
        <button class="mas" data-id="${item.id}">+</button>
      </div>
      <button class="eliminar" data-id="${item.id}">❌</button>
    `;

    carritoItems.appendChild(div);
  });

  // Guardar carrito actualizado
  localStorage.setItem('carrito', JSON.stringify(carrito));

  // Actualizar total en el HTML
  if (carritoTotal) {
    carritoTotal.textContent = total.toFixed(2);
  }

  // Eventos para +, -, eliminar
  document.querySelectorAll(".menos").forEach((btn) => {
    btn.addEventListener("click", () => cambiarCantidad(btn.dataset.id, -1));
  });

  document.querySelectorAll(".mas").forEach((btn) => {
    btn.addEventListener("click", () => cambiarCantidad(btn.dataset.id, 1));
  });

  document.querySelectorAll(".eliminar").forEach((btn) => {
    btn.addEventListener("click", () => eliminarItem(btn.dataset.id));
  });
}


// ========================
// Cambiar cantidad
// ========================
function cambiarCantidad(id, delta) {
  const item = carrito.find((p) => p.id === id);
  if (item) {
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      carrito = carrito.filter((p) => p.id !== id);
    }
  }
  renderCarrito();
}

// ========================
// Eliminar producto
// ========================
function eliminarItem(id) {
  carrito = carrito.filter((p) => p.id !== id);
  renderCarrito();
}
// Renderizar carrito al cargar la página
renderCarrito();

















const btnFinalizar = document.getElementById("finalizarCompra");

if (btnFinalizar) {
  btnFinalizar.addEventListener("click", () => {
    // Guardar el carrito en localStorage para la página checkout
    localStorage.setItem("carritoFinal", JSON.stringify(carrito));
    // Redirigir a la página de checkout
    window.location.href = "checkout.html";
  });
}










// ==========================================================
// BUSCADOR GLOBAL - La Botella Borracha
// ==========================================================
// Este buscador NO usa una lista fija de productos escrita a mano.
// En vez de eso, lee (fetch) cada página de categoría y saca los
// productos directamente de su HTML (cada <article data-producto-id>).
//
// Ventaja: si en el futuro agregas más productos (o páginas nuevas),
// solo tienes que sumarlas al arreglo PAGINAS_A_INDEXAR de abajo y
// el buscador las va a encontrar solo, sin tener que tocar nada más
// de esta lógica.
// ==========================================================

// 👉 Cuando agregues una categoría/página nueva con productos,
//    agrégala aquí (nombre del archivo + nombre bonito para mostrar).
const PAGINAS_A_INDEXAR = [
  { archivo: "index.html", nombre: "Inicio" },
  { archivo: "Whisky.html", nombre: "Whisky" },
  { archivo: "ron.html", nombre: "Ron" },
  { archivo: "vodka.html", nombre: "Vodka" },
  { archivo: "vinos.html", nombre: "Vinos" },
  { archivo: "cervezas.html", nombre: "Cervezas" },
  { archivo: "gasificadas.html", nombre: "Gasificadas con alcohol" },
  { archivo: "mineral.html", nombre: "Agua Mineral" },
  { archivo: "energizantes.html", nombre: "Energizantes" },
  { archivo: "gaseosas.html", nombre: "Gaseosas" },
  { archivo: "vapes.html", nombre: "Vapes" },
  { archivo: "snacks.html", nombre: "Snacks" },
  { archivo: "frugos.html", nombre: "Frugos" },
  { archivo: "combos.html", nombre: "Combos" },
  { archivo: "ofertas.html", nombre: "Ofertas" },
];

const CLAVE_CACHE = "lbb_indice_busqueda_v1";

let indiceProductos = null; // arreglo con todos los productos de todas las páginas
let construyendoIndice = null; // promesa en curso (para no duplicar fetch)

// ----------------------------------------------------------
// Quita tildes y pasa a minúsculas para comparar sin importar
// mayúsculas ni acentos ("Cerveza" === "cerveza" === "cérveza")
// ----------------------------------------------------------
function normalizar(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ----------------------------------------------------------
// Saca los productos (<article data-producto-id>) del HTML
// de una página ya descargada.
// ----------------------------------------------------------
function extraerProductosDeHTML(html, archivo, nombreCategoria) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const articulos = doc.querySelectorAll("article[data-producto-id]");
  const productos = [];

  articulos.forEach((articulo) => {
    const id = articulo.dataset.productoId;
    const h3 = articulo.querySelector("h3");
    if (!id || !h3) return;

    const nombre = h3.textContent.replace(/\s+/g, " ").trim();
    if (!nombre) return;

    const img = articulo.querySelector("img");
    const imgSrc = img ? img.getAttribute("src") : "";

    const strong = articulo.querySelector("strong");
    const precioTexto = strong ? strong.textContent.trim() : "";

    productos.push({
      id,
      nombre,
      nombreNormalizado: normalizar(nombre),
      img: imgSrc,
      precio: precioTexto,
      archivo,
      categoria: nombreCategoria,
    });
  });

  return productos;
}

// ----------------------------------------------------------
// Descarga todas las páginas de PAGINAS_A_INDEXAR y arma el
// índice de productos. Se guarda en sessionStorage para no
// tener que volver a descargar todo en cada búsqueda (solo se
// vuelve a armar una vez por pestaña/sesión, así si agregas
// productos y el usuario abre una pestaña nueva, ve lo último).
// ----------------------------------------------------------
async function construirIndice() {
  const cacheada = sessionStorage.getItem(CLAVE_CACHE);
  if (cacheada) {
    try {
      return JSON.parse(cacheada);
    } catch (e) {
      // si el cache está corrupto, lo ignoramos y reconstruimos
    }
  }

  const resultados = await Promise.all(
    PAGINAS_A_INDEXAR.map(async ({ archivo, nombre }) => {
      try {
        const resp = await fetch(archivo, { cache: "no-store" });
        if (!resp.ok) return [];
        const html = await resp.text();
        return extraerProductosDeHTML(html, archivo, nombre);
      } catch (e) {
        console.warn("No se pudo leer", archivo, e);
        return [];
      }
    })
  );

  const productos = resultados.flat();

  try {
    sessionStorage.setItem(CLAVE_CACHE, JSON.stringify(productos));
  } catch (e) {
    // si sessionStorage falla (modo incógnito estricto, etc.) no pasa nada,
    // simplemente no cacheamos
  }

  return productos;
}

async function obtenerIndice() {
  if (indiceProductos) return indiceProductos;
  if (!construyendoIndice) {
    construyendoIndice = construirIndice().then((productos) => {
      indiceProductos = productos;
      return productos;
    });
  }
  return construyendoIndice;
}

// ----------------------------------------------------------
// Busca coincidencias en el índice ya armado
// ----------------------------------------------------------
function buscarEnIndice(productos, consulta) {
  const q = normalizar(consulta);
  if (!q) return [];

  const coincidencias = productos.filter((p) =>
    p.nombreNormalizado.includes(q)
  );

  // Los que empiezan con lo que escribiste van primero
  coincidencias.sort((a, b) => {
    const aEmpieza = a.nombreNormalizado.startsWith(q) ? 0 : 1;
    const bEmpieza = b.nombreNormalizado.startsWith(q) ? 0 : 1;
    return aEmpieza - bEmpieza;
  });

  return coincidencias.slice(0, 10);
}

// ----------------------------------------------------------
// Pinta el dropdown de resultados
// ----------------------------------------------------------
function renderResultados(contenedor, productos, consulta) {
  contenedor.innerHTML = "";

  if (!consulta.trim()) {
    contenedor.classList.remove("activo");
    return;
  }

  if (productos.length === 0) {
    contenedor.innerHTML = `<div class="resultado-vacio">Sin resultados para "${consulta}"</div>`;
    contenedor.classList.add("activo");
    return;
  }

  productos.forEach((p) => {
    const item = document.createElement("a");
    item.href = `${p.archivo}#producto-${p.id}`;
    item.className = "resultado-item";
    item.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <div class="resultado-info">
        <span class="resultado-nombre">${p.nombre}</span>
        <span class="resultado-categoria">${p.categoria}</span>
      </div>
      <span class="resultado-precio">${p.precio}</span>
    `;
    item.addEventListener("click", (e) => {
      // Si el resultado es de la MISMA página en la que ya estamos,
      // no recargamos: solo hacemos scroll y resaltamos.
      const archivoActual = location.pathname.split("/").pop() || "index.html";
      if (p.archivo === archivoActual) {
        e.preventDefault();
        history.replaceState(null, "", `#producto-${p.id}`);
        irAlProducto(p.id);
        contenedor.classList.remove("activo");
        const input = document.getElementById("buscadorGlobal");
        if (input) input.blur();
      }
    });
    contenedor.appendChild(item);
  });

  contenedor.classList.add("activo");
}

// ----------------------------------------------------------
// Busca el <article data-producto-id="X"> en la página actual,
// le hace scroll y lo resalta un momento.
// ----------------------------------------------------------
function irAlProducto(id) {
  const articulo = document.querySelector(`article[data-producto-id="${id}"]`);
  if (!articulo) return;

  articulo.scrollIntoView({ behavior: "smooth", block: "center" });
  articulo.classList.add("producto-destacado");
  setTimeout(() => articulo.classList.remove("producto-destacado"), 2500);
}

// ----------------------------------------------------------
// Debounce sencillo para no buscar en cada tecla sin parar
// ----------------------------------------------------------
function debounce(fn, espera) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

// ----------------------------------------------------------
// Inicialización
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("buscadorGlobal");
  const contenedorResultados = document.getElementById("resultadosBuscador");
  const btnLimpiar = document.getElementById("limpiarBusqueda");

  // Si en algún producto que ya vino en la URL (#producto-a17), lo resaltamos
  if (location.hash.startsWith("#producto-")) {
    const id = location.hash.replace("#producto-", "");
    // pequeño delay para asegurarnos que el resto de imágenes ya cargó
    setTimeout(() => irAlProducto(id), 300);
  }

  if (!input || !contenedorResultados) return;

  // Empezamos a descargar el índice apenas el usuario toca el buscador,
  // así no cargamos 15 páginas de más si nunca lo usa.
  const precalentarIndice = () => obtenerIndice();
  input.addEventListener("focus", precalentarIndice, { once: true });

  const manejarBusqueda = debounce(async (consulta) => {
    if (!consulta.trim()) {
      renderResultados(contenedorResultados, [], "");
      return;
    }
    contenedorResultados.innerHTML = `<div class="resultado-vacio">Buscando...</div>`;
    contenedorResultados.classList.add("activo");

    const productos = await obtenerIndice();
    const encontrados = buscarEnIndice(productos, consulta);
    renderResultados(contenedorResultados, encontrados, consulta);
  }, 250);

  input.addEventListener("input", (e) => manejarBusqueda(e.target.value));

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      contenedorResultados.classList.remove("activo");
      input.blur();
    }
  });

  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      input.value = "";
      renderResultados(contenedorResultados, [], "");
      input.focus();
    });
  }

  // Cerrar el dropdown si el usuario hace clic afuera
  document.addEventListener("click", (e) => {
    const barra = document.querySelector(".search-bar-global");
    if (barra && !barra.contains(e.target)) {
      contenedorResultados.classList.remove("activo");
    }
  });
});