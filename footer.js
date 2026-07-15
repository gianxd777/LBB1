// ==========================================================
// FOOTER GLOBAL - La Botella Borracha
// ==========================================================
// Este es EL ÚNICO lugar donde se escribe el footer.
// Todas las páginas solo tienen un <footer id="footer-placeholder"></footer>
// vacío, y este script lo rellena con el HTML de aquí abajo.
//
// 👉 Si quieres cambiar algo del footer (horario, redes, texto,
//    dirección, categorías, métodos de pago, whatsapp, etc.) SOLO
//    edita el HTML de aquí abajo (la plantilla FOOTER_HTML) y se
//    actualiza en TODAS las páginas al mismo tiempo. No toques nada más.
//
// IMPORTANTE: solo se usan clases que YA existen en style.css
// (footer-container, footer-social, reclamos) mas estilos inline
// puntuales, para que se vea profesional sin tener que tocar el CSS.
// ==========================================================

// Mismo número real que ya usas en checkout.js (numeroTelefono)
const WHATSAPP_NUMERO = "51912886670";
const WHATSAPP_MENSAJE = encodeURIComponent("Hola, quisiera hacer una consulta 🍷");
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAJE}`;

const FOOTER_HTML = `
    <div class="footer-container">

        <!-- Sobre nosotros -->
        <section>
            <h3>Sobre nosotros</h3>
            <p>
                Somos <strong>Licorería La Botella Borracha</strong>, especialistas en licores nacionales
                e importados. Calidad y rapidez en cada entrega 🍷.
            </p>
            <p style="opacity:.75; font-size:.8rem; margin-top:.6rem; line-height:1.6;">
                🔒 Compra 100% segura<br>
                🚚 Entrega rápida a domicilio<br>
                ⭐ +500 clientes satisfechos
            </p>
        </section>

        <!-- Categorías rápidas -->
        

            <section>
    <h3>Categorías</h3>
    <ul class="reclamos" style="display:grid; grid-template-columns:1fr 1fr; gap:.4rem .8rem; margin-top:.5rem;">
        <li style="border-bottom:1px solid rgba(255,255,255,.08); padding-bottom:.4rem;">
            <a href="Whisky.html" style="display:flex; align-items:center; gap:.4rem;">🥃 Whisky
        </li>
        <li style="border-bottom:1px solid rgba(255,255,255,.08); padding-bottom:.4rem;">
            <a href="ron.html" style="display:flex; align-items:center; gap:.4rem;">🍹 Ron
        </li>
        <li style="border-bottom:1px solid rgba(255,255,255,.08); padding-bottom:.4rem;">
            <a href="vodka.html" style="display:flex; align-items:center; gap:.4rem;">🍸 Vodka
        </li>
        <li style="border-bottom:1px solid rgba(255,255,255,.08); padding-bottom:.4rem;">
            <a href="cervezas.html" style="display:flex; align-items:center; gap:.4rem;">🍺 Cervezas
        </li>
        <li>
            <a href="vinos.html" style="display:flex; align-items:center; gap:.4rem;">🍷 Vinos
        </li>
        <li>
            <a href="ofertas.html" style="display:flex; align-items:center; gap:.4rem; color:#ff2c2c; font-weight:700;">🔥 Ofertas</a>
        </li>
    </ul>
</section>


        <!-- Contáctanos -->
        <section>
            <h3>Contáctanos</h3>
            <ul class="reclamos">
                <li>📍 Huancayo - cooperativa Santa Isabel - Av. orion Mz S lote 22</li>
                <li><a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer">📱 +51 912 886 670</a></li>
            </ul>
            <h3 style="margin-top:1.2rem;">Horario de atención</h3>
            <p>
                Lunes a Viernes: 9:00 am - 12:00 pm <br>
                Sábados: 10:00 am - 11:00 pm <br>
            </p>
        </section>

        <!-- Redes sociales y métodos de pago -->
        <section>
            <h3>Síguenos</h3>
            <div class="footer-social">
                <a href="https://www.facebook.com/profile.php?id=100066950823371" target="_blank"
                    rel="noopener noreferrer" title="Facebook">
                    <i class="fab fa-facebook"></i>
                </a>
                <a href="https://www.instagram.com/la.botella.borracha/" target="_blank" rel="noopener noreferrer" title="Instagram">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="https://www.tiktok.com/@la.botella.borracha?_t=ZS-8zR1WZFpI5V&_r=1" target="blank"
                    rel="noopener noreferrer" title="TikTok">
                    <i class="fab fa-tiktok"></i>
                </a>
                <a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>
            </div>

            <h3 style="margin-top:1.2rem;">Métodos de pago</h3>

            <div style="display:flex; flex-wrap:wrap; gap:.5rem; margin-top:.4rem;">
                <span style="background:#fff; color:#1a1f71; padding:.25rem .6rem; border-radius:5px; font-size:.75rem; font-weight:700;">VISA</span>
                <span style="background:#fff; color:#eb001b; padding:.25rem .6rem; border-radius:5px; font-size:.75rem; font-weight:700;">MASTERCARD</span>
                <span style="background:#8e2de2; color:#fff; padding:.25rem .6rem; border-radius:5px; font-size:.75rem; font-weight:700;">YAPE</span>
                <span style="background:#00c1e8; color:#fff; padding:.25rem .6rem; border-radius:5px; font-size:.75rem; font-weight:700;">PLIN</span>
                <span style="background:#333; color:#fff; padding:.25rem .6rem; border-radius:5px; font-size:.75rem; font-weight:700;">EFECTIVO</span>
            </div>

            <a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer"
                style="display:flex; align-items:center; justify-content:center; gap:.5rem;
                       background:#25D366; color:#fff; text-decoration:none; font-weight:700;
                       font-size:.85rem; padding:.6rem 1rem; border-radius:10px; margin-top:1.2rem;">
                <i class="fab fa-whatsapp"></i> TRABAJA CON NOSOTROS
            </a>
        </section>

        <!-- Soporte y ayuda -->
        
    </div>

    <!-- Copy -->
    <div class="footer-copy">
    <div class="reclamos" style="margin-bottom:.8rem; display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        
        <!-- Enlace a Términos y Condiciones -->
        <a href="terminos.html" target="_blank" rel="noopener">Términos y condiciones</a>
        <span style="opacity:.4;">|</span>
        
        <!-- Enlace a Política de Privacidad -->
        <a href="politicas.html" target="_blank" rel="noopener">Política de privacidad</a>
        <span style="opacity:.4;">|</span>
        
        <!-- Enlace a Libro de Reclamaciones -->
        <a href="libro-reclamaciones.html" target="_blank" rel="noopener">Libro de reclamaciones</a>
        
    </div>
    
    &copy; 2026 Licorería La Botella Borracha. Todos los derechos reservados.
    <br>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("footer-placeholder");
  if (contenedor) {
    contenedor.innerHTML = FOOTER_HTML;
  }
});