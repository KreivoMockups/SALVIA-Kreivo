// ==========================================
// VARIABLES GLOBALES
// ==========================================
let sumaCorrectaReporte = 0;
let sumaCorrectaLogin = 0;
let sumaCorrectaVictima = 0; // NUEVO CAPTCHA
let rolActual = 'tercero';
let asistenteVozActivo = false;
let inputActivo = null;
let vistaActualGlobal = 'Portal Público (Inicio)';

// ==========================================
// 1. RUTEO PÚBLICO
// ==========================================
function navPublic(viewId) {
    document.querySelectorAll('#public-app main > section').forEach(el => el.classList.add('hidden-view'));
    document.getElementById(viewId).classList.remove('hidden-view');
    const btnLogin = document.getElementById('btn-nav-login');
    if(viewId === 'home-view') btnLogin.style.display = 'block';
    else btnLogin.style.display = 'none';

    // RASTREADOR ACTUALIZADO PARA GOOGLE FORMS
    if(viewId === 'home-view') vistaActualGlobal = 'Portal Público (Inicio)';
    // Si entra al reporte siendo víctima, lo marcamos como Registro, si no, como Tercero
    else if(viewId === 'reporte-view') vistaActualGlobal = (rolActual === 'victima') ? 'Portal de Mujeres (Registro)' : 'Formulario de Reporte (Ciudadano/Tercero)';
    else if(viewId === 'login-view' || viewId === 'intermedio-funcionario-view') vistaActualGlobal = 'Login / Acceso de Funcionarios';
    else if(viewId === 'login-victima-view') vistaActualGlobal = 'Portal de Mujeres (Login/Trazabilidad)';
    else if(viewId === 'trazabilidad-view') vistaActualGlobal = 'Trazabilidad de mi caso'; // Nuevo nombre exacto
}

// ==========================================
// 2. FORMULARIO DINÁMICO (NUEVO V2.0)
// ==========================================
function prepararFormulario(rol) {
    rolActual = rol;
    const titulo = document.getElementById('form-dynamic-title');
    const instruccion = document.getElementById('form-dynamic-instruction');
    const btnSubmit = document.querySelector('#form-reporte button[type="submit"]');
    const cajaCredenciales = document.getElementById('campos-credenciales'); 

    if (rol === 'tercero') {
        titulo.innerText = "Reporte por Terceros (Familiar / Conocido)";
        instruccion.innerHTML = "<strong>Orientación:</strong> Los datos a continuación deben ser <strong>exclusivamente los de la víctima</strong> para que podamos contactarla. El campo de teléfono es el único obligatorio.";
        btnSubmit.innerText = "Enviar Reporte a la Línea 155";
        if(cajaCredenciales) cajaCredenciales.classList.add('hidden'); 
    } else if (rol === 'victima') {
        titulo.innerText = "Mi Registro Personal";
        instruccion.innerHTML = "<strong>Orientación:</strong> Por favor complete sus datos personales y cree un usuario y contraseña para poder hacer seguimiento a su caso.";
        btnSubmit.innerText = "Registrarme y Crear Cuenta";
        if(cajaCredenciales) cajaCredenciales.classList.remove('hidden'); 
    } else if (rol === 'funcionario') {
        titulo.innerText = "Registro de Caso Entrante (Operador)";
        instruccion.innerHTML = "<strong>Orientación Operador:</strong> Diligencie los datos proporcionados por la ciudadana en la llamada. Verifique el número de contacto.";
        btnSubmit.innerText = "Radicar Caso en el Sistema";
        if(cajaCredenciales) cajaCredenciales.classList.add('hidden'); 
    } else if (rol === 'kobo') {
        titulo.innerText = "Seguimiento de Casos (Kobo)";
        instruccion.innerHTML = "<strong>Orientación:</strong> Diligencie este esquema de seguimiento para el registro de acciones de Riesgo Extremo, Alto y General.";
        btnSubmit.innerText = "Guardar Seguimiento";
        if(cajaCredenciales) cajaCredenciales.classList.add('hidden'); // Ocultamos la caja de contraseñas
    }
    
    generarCaptchas();

    // ---> ESTA ES LA LÍNEA NUEVA QUE DEBES AGREGAR <---
    renderizarFormularioDinamico('eav-public-container'); 

    navPublic('reporte-view');
    if(asistenteVozActivo) leerTexto("Formulario abierto. " + titulo.innerText + ". " + instruccion.innerText.replace('Orientación:', 'Orientación. '));
}

// ==========================================
// 3. MOTOR DE DATOS Y CACHÉ (LOCALSTORAGE)
// ==========================================
function enviarReporte(event) {
    event.preventDefault(); 
    const contenedor = document.getElementById('eav-public-container');
    const inputs = contenedor.querySelectorAll('input, select, textarea');
    
    const idCaso = 'CASO-' + Math.floor(Math.random() * 100000);
    const paqueteDatos = {
        metadata: {
            id_simulacion: idCaso,
            fecha_registro: new Date().toISOString(),
            fecha_humana: new Date().toLocaleString(), // <-- Fecha para la tabla
            rol_usuario: rolActual,
            estado: 'Borrador / En Progreso' // <-- Estado inicial
        },
        respuestas_valores: {} 
    };

    inputs.forEach(input => {
        const wrapper = input.closest('div[id^="wrapper_"]');
        if (wrapper && wrapper.classList.contains('hidden')) return; 

        const codigoPregunta = input.id.split('_').slice(1).join('_');
        if (input.multiple) {
            const seleccionados = Array.from(input.selectedOptions).map(opt => opt.value);
            if (seleccionados.length > 0 && seleccionados[0] !== "Seleccione...") {
                paqueteDatos.respuestas_valores[codigoPregunta] = seleccionados;
            }
        } else if (input.value && input.value !== "Seleccione...") {
            paqueteDatos.respuestas_valores[codigoPregunta] = input.value;
        }
    });

    // === NUEVO: GUARDAR EN BANDEJA DE ENTRADA (LocalStorage) ===
    let historialCasos = JSON.parse(localStorage.getItem('salvia_casos') || '[]');
    historialCasos.push(paqueteDatos);
    localStorage.setItem('salvia_casos', JSON.stringify(historialCasos));
    // ==========================================================

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(paqueteDatos, null, 4));
    const botonDescargaOculto = document.createElement('a');
    botonDescargaOculto.setAttribute("href", dataStr);
    botonDescargaOculto.setAttribute("download", `SALVIA_${idCaso}.json`);
    document.body.appendChild(botonDescargaOculto); 
    botonDescargaOculto.click();
    botonDescargaOculto.remove();

    alert(`¡Datos guardados!\n\nEl caso ${idCaso} se ha guardado en la Bandeja de Seguimiento para ser retomado más tarde.`);
}

function inyectarFilaTabla(caso) {
    const tbody = document.getElementById('tabla-seguimiento');
    if(!tbody) return;
    
    const newRow = `<tr>
        <td class="px-6 py-4 font-mono text-xs">${caso.id}</td>
        <td class="px-6 py-4 font-medium">Ciudadana (Tel: ${caso.tel})</td>
        <td class="px-6 py-4"><span class="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">${caso.rol === 'funcionario' ? 'Radicado OP' : 'Primer Contacto'}</span></td>
        <td class="px-6 py-4">${caso.fecha}</td>
        <td class="px-6 py-4"><button class="bg-[#380E44] text-white px-3 py-1 rounded shadow hover:bg-purple-900 text-xs font-bold">INICIAR RUTA</button></td>
    </tr>`;
    tbody.insertAdjacentHTML('afterbegin', newRow);
}

function actualizarMetricas() {
    let casosEnCache = JSON.parse(localStorage.getItem('casosSalvia')) || [];
    const metricElement = document.getElementById('metric-nuevo');
    if(metricElement) metricElement.innerText = (1240 + casosEnCache.length).toLocaleString();
}

function cargarCacheAlInicio() {
    let casosEnCache = JSON.parse(localStorage.getItem('casosSalvia')) || [];
    casosEnCache.forEach(caso => inyectarFilaTabla(caso));
    actualizarMetricas();
}

// FUNCIONES REPARADAS DEL DASHBOARD
function toggleDesignControls() {
    const panel = document.getElementById('design-controls');
    if (panel.classList.contains('translate-x-full')) {
        panel.classList.remove('translate-x-full');
    } else {
        panel.classList.add('translate-x-full');
    }
}

function submitFeedback() {
    alert("Comentario de diseño registrado en la bitácora.");
    document.getElementById('feedback-text').value = '';
    toggleDesignControls();
}

// ==========================================
// 4. LÓGICA DE LOGIN Y CIERRE DE SESIÓN
// ==========================================
function ingresarDashboard(e) {
    e.preventDefault();
    const captchaValor = document.getElementById('login-captcha').value;
    if (captchaValor !== sumaCorrectaLogin.toString()) {
        alert("Suma de seguridad incorrecta. Intente de nuevo.");
        generarCaptchas();
        return;
    }
    cerrarTeclado();
    // V2.0: Va a la vista intermedia en lugar de ir directo al dashboard
    navPublic('intermedio-funcionario-view');
    e.target.reset();
}

function ingresarDashboardFinal() {
    document.getElementById('public-app').classList.add('hidden-view');
    document.getElementById('dashboard-app').classList.remove('hidden-view');
    switchDashView('dashboard');
}

function cerrarSesion() {
    document.getElementById('dashboard-app').classList.add('hidden-view');
    document.getElementById('public-app').classList.remove('hidden-view');
    navPublic('home-view');
}

// ==========================================
// FLUJO PORTAL DE MUJERES
// ==========================================
function ingresarVictima(e) {
    e.preventDefault();
    const captchaValor = document.getElementById('victima-captcha').value;
    if (captchaValor !== sumaCorrectaVictima.toString()) {
        alert("Suma de seguridad incorrecta. Intente de nuevo.");
        if (asistenteVozActivo) leerTexto("Error. Suma de seguridad incorrecta.");
        generarCaptchas();
        return;
    }
    cerrarTeclado();
    navPublic('trazabilidad-view');
    e.target.reset();
}

// ==========================================
// 5. NAVEGACIÓN DEL DASHBOARD Y BOTONES INFO
// ==========================================
function switchDashView(viewId) {
    const views = ['dashboard', 'seguimiento', 'tamizaje', 'masp', 'lgbtiq', 'builder', 'arquitectura'];
    
    // Ocultar todas las vistas de forma segura
    views.forEach(v => {
        const viewEl = document.getElementById(`view-${v}`);
        const navEl = document.getElementById(`nav-${v}`);
        if(viewEl) viewEl.classList.add('hidden');
        if(navEl) navEl.classList.remove('sidebar-active');
    });

    // Mostrar la vista seleccionada de forma segura
    const activeView = document.getElementById(`view-${viewId}`);
    const activeNav = document.getElementById(`nav-${viewId}`);
    if(activeView) activeView.classList.remove('hidden');
    if(activeNav) activeNav.classList.add('sidebar-active');

    // DICCIONARIO ACTUALIZADO (¡Aquí faltaba el builder!)
    const viewConfig = {
        'dashboard':   { title: 'Panel de Control Estratégico', storyKey: 'panel_control' },
        'seguimiento': { title: 'Monitoreo de Rutas y Barreras', storyKey: 'seguimiento_casos' },
        'tamizaje':    { title: 'Valoración Técnica de Riesgo de Feminicidio', storyKey: 'tamizaje_riesgo' },
        'masp':        { title: 'Mockup Aplicativo MASP', storyKey: 'modulo_masp' },
        'lgbtiq':      { title: 'Enfoque Diferencial de Género', storyKey: 'modulo_lgbtiq' },
        'builder':     { title: 'Motor de Formularios (EAV)', storyKey: 'motor_formularios' }, // <--- SOLUCIÓN
        'arquitectura':{ title: 'Arquitectura ERD', storyKey: 'arquitectura' } // <--- SOLUCIÓN
    };

    const config = viewConfig[viewId];
    
    // Paracaídas de seguridad: Solo cambia el título si existe la configuración
    if (config) {
        document.getElementById('view-title').innerHTML = `
            ${config.title}
            <button onclick="abrirModalHistoria('${config.storyKey}')" class="ml-4 text-gray-400 hover:text-[#FCCC3C] transition-colors align-middle" title="Ver Historia de Usuario">
                <i class="fa-solid fa-circle-info text-2xl drop-shadow-sm"></i>
            </button>
        `;
    }

    // Actualizar el rastreador para el Google Form
    if(viewId === 'dashboard') vistaActualGlobal = 'Dashboard - Panel de Control';
    else if(viewId === 'seguimiento') vistaActualGlobal = 'Dashboard - Bandeja de Seguimiento';
    else if(viewId === 'tamizaje') vistaActualGlobal = 'Dashboard - Tamizaje de Riesgo';
    else if(viewId === 'masp' || viewId === 'lgbtiq') vistaActualGlobal = 'Dashboard - Módulo MASP / LGBTIQ+';
    else if(viewId === 'builder') vistaActualGlobal = 'Dashboard - Constructor Dinámico';
    else if(viewId === 'arquitectura') vistaActualGlobal = 'Dashboard - Arquitectura EAV'; // Nueva vista
    
    if(viewId === 'dashboard') vistaActualGlobal = 'Dashboard - Panel de Control';
    else if(viewId === 'seguimiento') {
        vistaActualGlobal = 'Dashboard - Bandeja de Seguimiento';
        // ---> NUEVA LÍNEA: Actualizar la tabla al entrar a la vista <---
        cargarBandejaSeguimiento(); 
    }
    else if(viewId === 'tamizaje') vistaActualGlobal = 'Dashboard - Tamizaje de Riesgo';
    
    // Update the Mermaid initialization:
    setTimeout(() => {
        if (typeof mermaid !== 'undefined') {
            // Only select mermaid blocks inside the currently visible view
            // and ignore those that have already been processed
            const activeMermaid = document.querySelectorAll(`#view-${viewId} .mermaid:not([data-processed="true"])`);
            
            if (activeMermaid.length > 0) {
                mermaid.init(undefined, activeMermaid);
            }
        }
    }, 50);
}

// ==========================================
// 6. TECLADO VIRTUAL
// ==========================================
const teclado = document.getElementById('virtual-keypad');
document.addEventListener('click', function(e) {
    if(e.target.classList.contains('numpad-trigger')) {
        inputActivo = e.target;
        document.querySelectorAll('.numpad-trigger').forEach(t => t.classList.remove('ring-2', 'ring-[#380E44]'));
        inputActivo.classList.add('ring-2', 'ring-[#380E44]');
        teclado.classList.add('show');
    }
});
document.querySelectorAll('.keypad-btn').forEach(btn => {
    btn.addEventListener('click', function() { if(inputActivo) inputActivo.value += this.innerText; });
});
function borrarUltimo() { if(inputActivo) inputActivo.value = inputActivo.value.slice(0, -1); }
function limpiarInput() { if(inputActivo) inputActivo.value = ''; }
function cerrarTeclado() { 
    if(teclado) teclado.classList.remove('show'); 
    if(inputActivo) inputActivo.classList.remove('ring-2', 'ring-[#380E44]'); 
}

// ==========================================
// 7. GENERADOR DE CAPTCHAS DINÁMICOS
// ==========================================
function generarCaptchas() {
    const num1R = Math.floor(Math.random() * 10) + 1;
    const num2R = Math.floor(Math.random() * 10) + 1;
    sumaCorrectaReporte = num1R + num2R;
    const textoReporte = document.getElementById('captcha-text');
    if (textoReporte) textoReporte.innerText = `Verificación: ${num1R} + ${num2R} =`;
    const inputReporte = document.getElementById('reporte-captcha');
    if (inputReporte) inputReporte.value = '';

    const num1L = Math.floor(Math.random() * 10) + 1;
    const num2L = Math.floor(Math.random() * 10) + 1;
    sumaCorrectaLogin = num1L + num2L;
    const textoLogin = document.getElementById('login-captcha-text');
    if (textoLogin) textoLogin.innerText = `Seguridad: ${num1L} + ${num2L} =`;
    const inputLogin = document.getElementById('login-captcha');
    if (inputLogin) inputLogin.value = '';

    // --- 3. CAPTCHA PARA MUJERES VÍCTIMAS ---
    const num1V = Math.floor(Math.random() * 10) + 1;
    const num2V = Math.floor(Math.random() * 10) + 1;
    sumaCorrectaVictima = num1V + num2V;
    const textoVictima = document.getElementById('victima-captcha-text');
    if (textoVictima) textoVictima.innerText = `Seguridad: ${num1V} + ${num2V} =`;
    const inputVictima = document.getElementById('victima-captcha');
    if (inputVictima) inputVictima.value = '';
}

// ==========================================
// 8. ACCESIBILIDAD AVANZADA (AUDIO)
// ==========================================
function toggleAsistenteVoz() {
    asistenteVozActivo = !asistenteVozActivo;
    const btn1 = document.getElementById('btn-audio'); // Botón público
    const btn2 = document.getElementById('btn-audio-dash'); // Botón dashboard
    
    if (asistenteVozActivo) {
        if(btn1) { btn1.classList.add('bg-green-500'); btn1.classList.remove('bg-white/20'); }
        if(btn2) { btn2.classList.add('bg-green-500', 'text-white'); btn2.classList.remove('bg-indigo-50', 'text-indigo-700'); }
        leerTexto("Asistente de voz activado. Navegue por la página usando la tecla Tabulador.");
    } else {
        if(btn1) { btn1.classList.remove('bg-green-500'); btn1.classList.add('bg-white/20'); }
        if(btn2) { btn2.classList.remove('bg-green-500', 'text-white'); btn2.classList.add('bg-indigo-50', 'text-indigo-700'); }
        window.speechSynthesis.cancel();
    }
}

function leerTexto(texto) {
    if (!asistenteVozActivo) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-CO'; 
    utterance.rate = 1.05; // Un poco más natural
    window.speechSynthesis.speak(utterance);
}

// Escuchador global de teclado (Tabulador)
document.addEventListener('focusin', function(e) {
    if (!asistenteVozActivo) return;
    const elemento = e.target;
    
    // 1. SI ES UN CAMPO DE FORMULARIO
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(elemento.tagName)) {
        let textoALeer = "";
        
        // --- LÓGICA MEJORADA PARA LEER TAMIZAJES (RADIO BUTTONS + PREGUNTA) ---
        if (elemento.type === 'radio') {
            const labelPadre = elemento.closest('label');
            
            // Buscamos el div contenedor de la pregunta (que tiene la clase p-4)
            const contenedorPregunta = elemento.closest('.p-4'); 
            let textoPregunta = "";

            if (contenedorPregunta) {
                // Extraemos todos los textos de los párrafos (<p>) dentro de ese cuadro
                const parrafos = contenedorPregunta.querySelectorAll('p');
                parrafos.forEach(p => {
                    textoPregunta += p.innerText + ". ";
                });
            }

            if (labelPadre) {
                textoALeer = textoPregunta + " Opción actual: " + labelPadre.innerText.trim() + ". Presione la barra espaciadora para seleccionar.";
            }
        } 
        // --- FIN DE LÓGICA DE RADIO BUTTONS ---
        else {
            textoALeer = "Campo. ";
            const label = elemento.previousElementSibling;
            
            if (label && label.tagName === 'LABEL') {
                textoALeer += label.innerText + ". ";
            }
            
            if (elemento.tagName === 'SELECT') {
                const opcionActual = elemento.options[elemento.selectedIndex].text;
                textoALeer += "Lista desplegable. Use flechas arriba y abajo. Opción actual: " + opcionActual;
            } else if (elemento.id === 'reporte-captcha') {
                const sumaTexto = document.getElementById('captcha-text').innerText;
                textoALeer = "Seguridad. Escriba el resultado de: " + sumaTexto;
            } else if (elemento.id === 'login-captcha') {
                const sumaTexto = document.getElementById('login-captcha-text').innerText;
                textoALeer = "Seguridad. Escriba el resultado de: " + sumaTexto;
            } else if (elemento.id === 'victima-captcha') {
                const sumaTexto = document.getElementById('victima-captcha-text').innerText;
                textoALeer = "Seguridad. Escriba el resultado de: " + sumaTexto;
            } else {
                if (elemento.placeholder && elemento.placeholder !== '?') textoALeer += elemento.placeholder;
            }
        }
        
        leerTexto(textoALeer);
    } 
    // 2. SI ES UN BOTÓN
    else if (elemento.tagName === 'BUTTON') {
        let textoBoton = elemento.innerText.trim() || elemento.title || "sin texto";
        if(textoBoton !== "") leerTexto("Botón: " + textoBoton);
    } 
    // 3. SI ES UN ENLACE
    else if (elemento.tagName === 'A') {
        let textoEnlace = elemento.innerText.trim();
        if(textoEnlace !== "") leerTexto("Enlace: " + textoEnlace);
    }
    // 4. SI ES EL PANEL DE RESULTADOS (NUEVO)
    else if (elemento.tagName === 'DIV' && (elemento.id === 'panel-resultado-psico' || elemento.id === 'panel-resultado-lgb')) {
        let titulo = elemento.querySelector('p').innerText;
        // Buscamos el texto del número y el texto del globo de alerta
        let puntaje = elemento.querySelector('[id^="risk-score"]').innerText;
        let nivel = elemento.querySelector('[id^="risk-badge"]').innerText;
        
        leerTexto("Resultado del tamizaje. " + titulo + ": " + puntaje + " puntos. Nivel de alerta: " + nivel);
    }
});

// Leer cuando el usuario cambia una opción en un Select con las flechas
document.addEventListener('change', function(e) {
    if (!asistenteVozActivo) return;
    if (e.target.tagName === 'SELECT') {
        const nuevaOpcion = e.target.options[e.target.selectedIndex].text;
        leerTexto("Seleccionado: " + nuevaOpcion);
    }
});

// ==========================================
// 9. GESTOR DE HISTORIAS DE USUARIO (MODAL)
// ==========================================
const userStories = {
    'versiones': { 
        title: 'KREIVO: Actualizaciones', 
        role: 'Equipo Desarrollador', 
        content: `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">Versión 4.1 (16/3/2026)</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Tres formularios independientes por rol (Víctima / Funcionarios / Terceros).</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Activación <i>voice audio</i> (Text-to-Speech) para accesibilidad en formularios.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Botón de tickets integrado para recopilación de <i>feedback</i> contextual.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Acceso a Módulo MASP - App Mobil SALVIA.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Constructor SuperAdmin</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">6</span> 
                        <span>Front similar al original</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">6</span> 
                        <span>Interactividad y relacionamiento de preguntas, esquema de la base de datos optimizada</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">7</span> 
                        <span>Arquitectura por medio de EAV (Entity-Attribute-Value)</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">8</span> 
                        <span>Simulador KOBO</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">9</span> 
                        <span>Un JSON que se guarda como pequeña DB para recargar los datos</span>
                    </li>
                </ul>
            </div>
        ` 
    },
    'glosario': { 
        title: 'Glosario SALVIA', 
        role: 'MinIgualdad', 
        // Nota el uso de la comilla invertida al inicio y al final
        content: `
            <div class="overflow-x-auto rounded-lg shadow border border-gray-200 mt-2">
                <table class="min-w-full text-left text-sm text-gray-700">
                    <thead class="bg-[#380E44] text-white">
                        <tr>
                            <th class="px-4 py-3 font-bold uppercase tracking-wider text-xs">Término / Sigla</th>
                            <th class="px-4 py-3 font-bold uppercase tracking-wider text-xs">Definición</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr class="bg-white hover:bg-gray-50"><td class="px-4 py-3 font-bold text-[#380E44]">SALVIA</td><td class="px-4 py-3">Sistema de información y protocolo operativo para la atención de víctimas de VBG/VPP.</td></tr>
                        <tr class="bg-gray-50 hover:bg-gray-100"><td class="px-4 py-3 font-bold text-[#380E44]">VBG</td><td class="px-4 py-3">Violencia Basada en Género.</td></tr>
                        <tr class="bg-white hover:bg-gray-50"><td class="px-4 py-3 font-bold text-[#380E44]">VPP</td><td class="px-4 py-3">Violencia contra la Pareja y en el ámbito familiar.</td></tr>
                        <tr class="bg-gray-50 hover:bg-gray-100"><td class="px-4 py-3 font-bold text-[#380E44]">NNA</td><td class="px-4 py-3">Niños, Niñas y Adolescentes.</td></tr>
                        <tr class="bg-white hover:bg-gray-50"><td class="px-4 py-3 font-bold text-[#380E44]">ASP</td><td class="px-4 py-3">Agente Social de Protección (equipo en territorio).</td></tr>
                        <tr class="bg-gray-50 hover:bg-gray-100"><td class="px-4 py-3 font-bold text-[#380E44]">PQRS</td><td class="px-4 py-3">Peticiones, Quejas, Reclamos y Sugerencias.</td></tr>
                        <tr class="bg-white hover:bg-gray-50"><td class="px-4 py-3 font-bold text-[#380E44]">Enrutamiento</td><td class="px-4 py-3">Proceso de referir a la víctima a las instituciones o servicios que corresponden.</td></tr>
                        <tr class="bg-gray-50 hover:bg-gray-100"><td class="px-4 py-3 font-bold text-[#380E44]">Mec. Articulador</td><td class="px-4 py-3">Instancia de coordinación que facilita la respuesta institucional.</td></tr>
                        <tr class="bg-white hover:bg-gray-50"><td class="px-4 py-3 font-bold text-[#380E44]">Medidas Emergencia</td><td class="px-4 py-3">Apoyos inmediatos (alojamiento, transporte) para proteger a la víctima.</td></tr>
                        <tr class="bg-gray-50 hover:bg-gray-100"><td class="px-4 py-3 font-bold text-[#380E44]">Riesgo Feminicida</td><td class="px-4 py-3">Valoración del peligro para la vida (extremo, alto, moderado, bajo, sin riesgo).</td></tr>
                        <tr class="bg-gray-50 hover:bg-gray-100"><td class="px-4 py-3 font-bold text-[#380E44]">EAIF</td><td class="px-4 py-3">Equipo de Abordaje Integral del Feminicidio</td></tr>
                    </tbody>
                </table>
            </div>
        ` 
    },
    'reporte_terceros': { title: 'Registro de Contacto indirecto', role: 'Profesional de M asculinidades / Familiar / Amigo / Vecino / + Equipo Territorial / ASP', 
        content: 
        `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">Como allegado de una ciudadana en situación de riesgo, quiero poder registrar sus datos demográficos básicos y una descripción de los hechos en un formulario seguro, para que el sistema por medio del Profesional de Masculinidades active una alerta temprana y la Línea 155 pueda contactarla. Profesional de Masculinidades: Formación en Psicología, Trabajo Social, Sociología o Estudios de Género. Inter viene en las raíces simbólicas y sociales de la violencia.</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Diseñar e implementar procesos de sensibilización sobre mascuinidades no violentas</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Trabajar con hombres vinculados a casos del sistema</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Contribuir a estrategias de prevención secundaria y terciaria</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Aportar análisis estructural sobre dinámicas patriarcales en los casos</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Articular con el equipo psicosocial y EAIF cuando el caso lo requiera</span>
                    </li>
                </ul>
            </div>
        `
    },
    'registro_victima': { title: 'Registro de Contacto directo', role: 'Víctima', content: '"Como ciudadana en situación de riesgo, quiero poder registrar mis datos demográficos básicos y una descripción de los hechos en un formulario seguro que valide mi identidad, para que el sistema active una alerta temprana y la Línea 155 pueda contactarme. Y quiero poder hacer seguimiento a mi caso una vez ya registrado"' },
    'registro_funcionarios': { title: 'Acceso de Funcionarios', role: 'Agente Integral', 
        content: 
        `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">Primer contacto con la víctima. Crea el registro SALVIA, realiza la valoración de riesgo inicial y enruta el caso. Como operador de la Línea 155, necesito un portal de acceso seguro que valide mi identidad, para poder ingresar al sistema y visualizar los casos reportados por las ciudadanas manteniendo la confidencialidad.</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Recepción y aper tura de la atención</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Validación de condiciones de seguridad inmediata</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Verificación de antecedentes en SALVIA y evitar duplicidad</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Registro literal del relato de forma fiel y cronológica</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Caracterización interseccional (variables sociodemográficas)</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">6</span> 
                        <span>Valoración del riesgo con herramienta técnica del sistema</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">7</span> 
                        <span>Activación de alertas tempranas y medidas urgentes</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">8</span> 
                        <span>Enrutamiento sectorial a la entidad competente</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">9</span> 
                        <span>Información clara a la ciudadana sobre rutas y tiempos</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">10</span> 
                        <span>Cierre de la inter vención inicial y escalamiento</span>
                    </li>
                </ul>
            </div>
        `
    },
    'panel_control': { title: 'Panel de Control Estratégico', role: 'Gestora de Caso / Supervisor(a) ', 
        content: 
        `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">Como supervisor, necesito visualizar métricas en tiempo real sobre los casos reportados, niveles de riesgo y tiempos de respuesta, para tomar decisiones informadas y asignar recursos eficientemente en la red de atención. Rol técnico estratégico de calidad metodológica y cumplimiento normativo. Verifica la correcta aplicación del ciclo operativo completo y del enfoque interseccional.</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Verificar la correcta aplicación de cada etapa del ciclo operativo</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Revisar muestras de casos evaluando calidad del registro y trazabilidad</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Supervisar que la valoración del riesgo incorpore el análisis interseccional</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Identificar omisiones e inconsistencias y ordenar ajustes técnicos</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Asegurar que la gestión de barreras incluya acciones concretas</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">6</span> 
                        <span>Verificar confidencialidad y tratamiento de datos personales</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">7</span> 
                        <span>Garantizar que los cierres técnicos estén debidamente motivados</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">8</span> 
                        <span>Elaborar reportes periódicos de calidad y recomendar mejoras</span>
                    </li>
                </ul>
            </div>
        `
    },
    'seguimiento_casos': { title: 'Monitoreo de Rutas', role: 'Gestora de Caso / Agente Integral / Territorial / SALVIA Nacional', 
        content: 
        `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">Como operador, quiero ver una bandeja de entrada con los casos recién reportados, ordenados por urgencia y semaforizados, para poder iniciar el contacto de manera prioritaria y activar la ruta institucional. Realiza el monitoreo técnico, continuo y especializado de los casos una vez activadas las rutas. Garantiza que la respuesta institucional no se limite a la remisión.</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Recepción del caso y verificación de la información registrada</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Contacto seguro y verificación de condiciones actuales</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Verificación de la respuesta institucional por entidad</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Identificación, análisis y gestión de barreras institucionales</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Evaluación de persistencia de barreras y activación de Alertas</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">6</span> 
                        <span>Actualización de la valoración del riesgo</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">7</span> 
                        <span>Orientación en derechos con enfoque de género</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">8</span> 
                        <span>Registro y trazabilidad de cada contacto realizado</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">9</span> 
                        <span>Determinación de continuidad o cierre técnico del caso</span>
                    </li>
                </ul>
            <h4 class="font-bold text-[#B53D75] mb-3">Equipo de Notificación SALVIA: 5 profesionales en áreas sociales o afines. Especializados en gestión documental, radicación y comunicaciones institucionales. M anejan el correo salvia.pqrsd.</h4>    
                <ul>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Primera verificación de notificaciones y salida de comunicaciones de alertas / barreras</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Revisión de casos ingresados por salvia.pqrsd</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Validación formal de oficios proyectados por equipos técnicos</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Radicación de oficios y comunicaciones en los sistemas establecidos</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Registro de respuestas institucionales para agentes y equipos</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Comunicación operativa con enlaces territoriales para radicación y confirmación</span>
                    </li>
                </ul>
            </div>
        `
    },
    'tamizaje_riesgo': { title: 'Valoración Técnica de Riesgo', role: 'Equipo Psicosocial / Comisaría', 
        content: 
        `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">Como profesional en la ruta, necesito aplicar un cuestionario estandarizado que calcule automáticamente el riesgo de feminicidio, para clasificar el nivel de alerta (Extremo, Moderado, Bajo) y justificar medidas de protección. Equipo de Abordaje Integral del Feminicidio (EAIF)</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Activar y articular medidas de emergencia (Policía, Fiscalía, comisarías)</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Seguimiento intensivo y continuo a casos de riesgo alto / extremo</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Articulación interinstitucional integral (psicosocial, estabilización, barreras)</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Documentación rigurosa y trazabilidad de todas las actuaciones</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Identificación de patrones y fallas en la activación de rutas</span>
                    </li>
                </ul>
            </div>
        `
    },
    'modulo_masp': { title: 'Módulo MASP', role: 'Mujeres en Actividades Sexuales Pagas', content: '"Como usuaria del ecosistema MASP, necesito contar con un botón de pánico y un canal de reporte discreto que me permita alertar a las autoridades si me encuentro en una situación de violencia en mi entorno laboral."' },
    'modulo_lgbtiq': { title: 'Enfoque Diferencial de Género', role: 'Analista de Casos', 
        content: `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">Como analista, necesito visualizar indicadores y variables específicas de identidad de género y orientación sexual, para garantizar que la atención cumpla con el enfoque diferencial y no revictimice a la población diversa. Formación en Psicología, Trabajo Social u otras ciencias sociales. Garantiza que la atención incorpore el bienestar emocional y la autonomía subjetiva de la víctima.</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>Atención psicosocial inicial y de seguimiento</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>Estabilización emocional en situaciones de crisis</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>Identificación de factores protectores y factores de riesgo</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>Acompañamiento en la activación de rutas desde una perspectiva de cuidado</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>Articulación con el equipo EAIF cuando se detecten señales de alerta</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">6</span> 
                        <span>Registro técnico de la intervención en la plataforma</span>
                    </li>
                </ul>
            </div>
        `},
    'motor_formularios': { title: 'Dinamismo a preguntas relacionadas', role: 'Superuser', content: '"Como super usuario, quiero crear un diccionario dinámico donde pueda definir: la pregunta, el tipo (texto, select, radio) y las reglas de dependencia entre pregunas"' },
    'arquitectura': { title: 'ERD ', role: 'Kreivo', 
        content: `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                <h4 class="font-bold text-[#B53D75] mb-3">El resumen técnico discute la eficiencia de la arquitectura EAV + DAG.</h4>
                <ul class="space-y-3">
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span> 
                        <span>El problema con el diseño de la tabla plana (ERD tradicional) es que requiere ALTER TABLE para agregar nuevas variables, lo que conduce a la ineficiencia del espacio y a la rigidez operativa.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span> 
                        <span>La solución propuesta es el modelo EAV (Entity-Attribute-Value), que crece hacia abajo (filas) en lugar de hacia los lados (columnas).</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span> 
                        <span>El modelo EAV elimina los valores nulos al guardar solo filas para las preguntas que se respondieron, lo que resulta en un ahorro de espacio y una mejor eficiencia operativa.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span> 
                        <span>El modelo EAV también aborda el problema de la rigidez operativa en lenguajes de backend como Go (Golang) al eliminar la necesidad de punteros complejos.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">5</span> 
                        <span>El Catalogo_Preguntas es una tabla donde se almacenan todas las preguntas.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">6</span> 
                        <span>Para agregar una nueva pregunta, solo se necesita insertar una nueva fila en la tabla.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">7</span> 
                        <span>No es necesario modificar el código del servidor o las tablas existentes.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">8</span> 
                        <span>El Grafo Acíclico Dirigido (DAG) gestiona la lógica de negocio y la experiencia de usuario.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">9</span> 
                        <span>El DAG permite dependencias dinámicas, lo que significa que las preguntas solo se pueden mostrar en función de las respuestas anteriores.</span>
                    </li>
                    <li class="flex items-start">
                        <span class="bg-[#B53D75] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">10</span> 
                        <span>El DAG evita ciclos, asegurando que el formulario nunca quede atascado en una serie de preguntas.</span>
                    </li>
                </ul>
            </div>
        `},
}; 

function abrirModalHistoria(storyKey) {
    const story = userStories[storyKey];
    if (!story) return;
    document.getElementById('story-title').innerHTML = `<i class="fa-solid fa-book-open mr-2"></i> ${story.title}`;
    document.getElementById('story-role').innerText = `Rol: ${story.role}`;
    document.getElementById('story-content').innerHTML = story.content;
    document.getElementById('story-modal').classList.remove('hidden');
}
function cerrarModalHistoria() { document.getElementById('story-modal').classList.add('hidden'); }

// ==========================================
// 10. MENÚ MÓVIL Y MOTOR DE RIESGO
// ==========================================
function toggleMenuMovil() { document.getElementById('menu-movil').classList.toggle('hidden'); }

document.querySelectorAll('.risk-calc').forEach(radio => {
    radio.addEventListener('change', () => {
        let totalScore = 0;
        document.querySelectorAll('.risk-calc:checked').forEach(c => totalScore += parseInt(c.value));
        const scoreDisplay = document.getElementById('risk-score');
        const badge = document.getElementById('risk-badge');
        scoreDisplay.innerText = totalScore;
        if(totalScore >= 15) {
            scoreDisplay.className = "text-6xl font-black text-red-600 transition-colors";
            badge.innerText = "ALERTA VITAL - RIESGO EXTREMO";
            badge.className = "mt-4 inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-600 font-bold text-sm animate-bounce";
        } else if(totalScore >= 5) {
            scoreDisplay.className = "text-6xl font-black text-amber-500 transition-colors";
            badge.innerText = "RIESGO MODERADO - SEGUIMIENTO";
            badge.className = "mt-4 inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-600 font-bold text-sm";
        } else {
            scoreDisplay.className = "text-6xl font-black text-slate-800 transition-colors";
            badge.innerText = "RIESGO BAJO";
            badge.className = "mt-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-sm";
        }
    });
});

// ==========================================
// CALCULADOR DE RIESGO LGBTIQ+ (PREJUICIO)
// ==========================================
document.querySelectorAll('.risk-calc-lgb').forEach(radio => {
    radio.addEventListener('change', () => {
        let totalScore = 0;
        // Sumar solo los radios seleccionados de la clase lgb
        document.querySelectorAll('.risk-calc-lgb:checked').forEach(c => totalScore += parseInt(c.value));
        
        const scoreDisplay = document.getElementById('risk-score-lgb');
        const badge = document.getElementById('risk-badge-lgb');
        
        scoreDisplay.innerText = totalScore;
        
        // Reglas de negocio para LGBTIQ+
        if(totalScore >= 12) {
            scoreDisplay.className = "text-6xl font-black text-red-600 transition-colors";
            badge.innerText = "ALERTA CRÍTICA - RIESGO DE VIDA";
            badge.className = "mt-4 inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-600 font-bold text-sm animate-bounce";
        } else if(totalScore >= 6) {
            scoreDisplay.className = "text-6xl font-black text-orange-500 transition-colors";
            badge.innerText = "VULNERABILIDAD ALTA - AISLAMIENTO";
            badge.className = "mt-4 inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-sm";
        } else if(totalScore >= 3) {
            scoreDisplay.className = "text-6xl font-black text-amber-500 transition-colors";
            badge.innerText = "VULNERABILIDAD MODERADA";
            badge.className = "mt-4 inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-600 font-bold text-sm";
        } else {
            scoreDisplay.className = "text-6xl font-black text-slate-800 transition-colors";
            badge.innerText = "BAJA VULNERABILIDAD";
            badge.className = "mt-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-sm";
        }
    });
});

// ==========================================
// 11. SISTEMA DE FEEDBACK CONTEXTUAL (GOOGLE FORMS)
// ==========================================
function abrirFormularioFeedback() {
    // La URL base de tu formulario
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc4qDbw38kp5I5DKDXM8EF-DoH4QcBI8dEdJ3K60aIRsRDLXA/viewform";
    // El ID exacto de la pregunta "Módulo o Vista Actual"
    const entryId = "entry.675421179";
    
    // Convertimos el texto (ej. "Portal Público (Inicio)") a formato URL (ej. Portal%20P%C3%BAblico...)
    const vistaCodificada = encodeURIComponent(vistaActualGlobal);
    
    // Ensamblamos la URL final
    const urlFinal = `${baseUrl}?usp=pp_url&${entryId}=${vistaCodificada}`;
    
    // Abrimos el formulario en una nueva pestaña
    window.open(urlFinal, '_blank');
}

// ==========================================
// 12. MOTOR EAV AVANZADO (GRAFO ACÍCLICO DIRIGIDO - DAG) UNIVERSAL
// ==========================================

// Ahora recibe el ID del contenedor como parámetro
function renderizarFormularioDinamico(containerId) {
    const contenedor = document.getElementById(containerId);
    if (!contenedor) return;
    
    contenedor.className = "grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-5 pb-6";
    contenedor.innerHTML = ''; 
    
    Object.keys(dicPreguntas).forEach(codigo => {
        const campo = dicPreguntas[codigo];
        const div = document.createElement('div');
        // El ID del HTML ahora lleva el nombre del contenedor para evitar colisiones
        div.id = `wrapper_${containerId}_${codigo}`;
        div.className = "slide-in hidden"; 
        
        const colSpanClass = campo.colSpan === 4 ? 'md:col-span-4' : campo.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1';
        div.classList.add(colSpanClass);

        let inputHTML = '';
        if (campo.type === 'section') {
            div.className = "col-span-1 md:col-span-4 client-section-header mt-6";
            div.innerHTML = `<i class="fa-solid ${campo.icon}"></i><h2>${campo.label}</h2>`;
        } else {
            const label = `<label class="client-input-label">${campo.label}</label>`;
            const inputClass = "client-input-field bg-white";
            
            // Inyectamos el evento onchange pasando el containerId
            const onchangeStr = `evaluarDAG('${containerId}')`;

            if (campo.type === 'text' || campo.type === 'number' || campo.type === 'date' || campo.type === 'datetime-local') {
                inputHTML = `<input type="${campo.type}" id="${containerId}_${codigo}" class="${inputClass}" onchange="${onchangeStr}">`;
            } else if (campo.type === 'textarea') {
                inputHTML = `<textarea id="${containerId}_${codigo}" rows="3" class="${inputClass}" onchange="${onchangeStr}"></textarea>`;
            } else if (campo.type === 'boolean') {
                inputHTML = `<select id="${containerId}_${codigo}" onchange="${onchangeStr}" class="${inputClass}">
                    <option value="">Seleccione...</option><option value="true">Sí</option><option value="false">No</option>
                </select>`;
            } else if (campo.type === 'select') {
                let optionsHTML = campo.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                inputHTML = `<select id="${containerId}_${codigo}" onchange="${onchangeStr}" class="${inputClass}">${optionsHTML}</select>`;
            } 
            // ---> EL ÚNICO AJUSTE VISUAL NECESARIO <---
            else if (campo.type === 'multiselect') {
                let optionsHTML = campo.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                // Le agregamos el atributo nativo "multiple" de HTML
                inputHTML = `
                    <select id="${containerId}_${codigo}" multiple size="4" onchange="${onchangeStr}" class="${inputClass} h-auto">
                        ${optionsHTML}
                    </select>
                    <p class="text-[10px] text-gray-500 mt-1 leading-tight">
                        <i class="fa-solid fa-hand-pointer mr-1"></i> Mantenga presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varias opciones.
                    </p>`;
            }
            div.innerHTML = label + inputHTML;
        }
        contenedor.appendChild(div);
    });

    // Solo actualizamos el cuadro negro de JSON si estamos en el Constructor
    if (containerId === 'dynamic-form-preview') {
        const btnContainer = document.createElement('div');
        btnContainer.className = "col-span-1 md:col-span-4 flex justify-center mt-6 border-t pt-4";
        btnContainer.innerHTML = `<button type="button" class="client-btn-success shadow-md text-sm py-3 px-10">Guardar y Continuar</button>`;
        contenedor.appendChild(btnContainer);

        const vistaCodigo = `// DICCIONARIO\n${JSON.stringify(dicPreguntas, null, 2)}\n\n// ÁRBOL DAG\n${JSON.stringify(arbolRelaciones, null, 2)}`;
        const previewBox = document.getElementById('json-preview');
        if(previewBox) previewBox.innerText = vistaCodigo;
    }
    
    evaluarDAG(containerId);
}

function evaluarDAG(containerId) {
    let nodosVisibles = new Set();
    
    // MAGIA: Elegimos la raíz dependiendo de quién está viendo el formulario
    // Si estamos en el Constructor EAV, mostramos el formulario completo (funcionario).
    // Si estamos en la vista pública, usamos el rol que el usuario seleccionó.
    let llaveRaiz = containerId === 'dynamic-form-preview' ? 'raices_funcionario' : `raices_${rolActual}`;

    if(arbolRelaciones[llaveRaiz]) {
        arbolRelaciones[llaveRaiz].forEach(codigo => nodosVisibles.add(codigo));
    }

    let cola = [...nodosVisibles];
    
    while(cola.length > 0) {
        let codigoActual = cola.shift();
        const inputActual = document.getElementById(`${containerId}_${codigoActual}`);
        
        if (arbolRelaciones[codigoActual] && inputActual) {
            const valorActual = inputActual.value; 
            
            if (arbolRelaciones[codigoActual][valorActual]) {
                let hijosAAgregar = arbolRelaciones[codigoActual][valorActual];
                
                hijosAAgregar.forEach(hijo => {
                    nodosVisibles.add(hijo);
                    cola.push(hijo); 
                });
            }
        }
    }

    Object.keys(dicPreguntas).forEach(codigo => {
        const wrapper = document.getElementById(`wrapper_${containerId}_${codigo}`);
        const input = document.getElementById(`${containerId}_${codigo}`);
        
        if (wrapper && input) {
            if (nodosVisibles.has(codigo)) {
                wrapper.classList.remove('hidden');
            } else {
                wrapper.classList.add('hidden');
                if(input.tagName === 'SELECT') input.selectedIndex = 0;
                else input.value = '';
            }
        } else if (wrapper && dicPreguntas[codigo].type === 'section') {
            if (nodosVisibles.has(codigo)) wrapper.classList.remove('hidden');
            else wrapper.classList.add('hidden');
        }
    });
}

// ==========================================
// MÓDULO DE IMPORTACIÓN DE SIMULACIONES
// ==========================================

function cargarJSONSimulacion(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datosParseados = JSON.parse(e.target.result);
            procesarDatosRestauracion(datosParseados);
        } catch (error) {
            alert("Error: El archivo seleccionado no es un JSON válido.");
        }
    };
    // Leemos el archivo localmente sin necesidad de servidores
    reader.readAsText(file);
}

function procesarDatosRestauracion(paquete) {
    // 1. Validación de seguridad (¿Es un archivo de nuestro sistema?)
    if (!paquete.metadata || !paquete.respuestas_valores) {
        alert("El archivo JSON no tiene la estructura EAV de SALVIA.");
        return;
    }

    // === EL AJUSTE CLAVE: SALIR DEL DASHBOARD ===
    const dashboardApp = document.getElementById('dashboard-app');
    const publicApp = document.getElementById('public-app');
    if (dashboardApp) dashboardApp.classList.add('hidden-view');
    if (publicApp) publicApp.classList.remove('hidden-view');
    // ============================================

    // 2. Preparar el entorno (Navegar a la vista y cargar el rol correcto)
    const rol = paquete.metadata.rol_usuario || 'tercero';
    navPublic('reporte-view'); 
    prepararFormulario(rol);

    // 3. Pequeña pausa de 100ms para asegurar que el DOM del formulario HTML esté listo
    setTimeout(() => {
        const containerId = 'eav-public-container';
        const respuestas = paquete.respuestas_valores;

        // 4. Inyectar los valores EAV directamente en el HTML
        for (const [codigo, valor] of Object.entries(respuestas)) {
            const input = document.getElementById(`${containerId}_${codigo}`);
            if (input) {
                if (input.multiple && Array.isArray(valor)) {
                    // Magia para Multiselect (Barreras): Iluminamos todas las opciones guardadas
                    Array.from(input.options).forEach(opt => {
                        if (valor.includes(opt.value)) opt.selected = true;
                    });
                } else {
                    // Magia para Inputs normales y Fechas
                    input.value = valor;
                }
            }
        }

        // 5. LA MAGIA DEL GRAFO (DAG): 
        // Le decimos al motor que recalcule la visibilidad usando los datos que acabamos de inyectar
        evaluarDAG(containerId);
        // renderizarFormularioDinamico(containerId); (ELEIMINARLA)

        alert(`¡Simulación restaurada con éxito!\n\nID: ${paquete.metadata.id_simulacion}\nSe ha cargado el formulario completo con sus ramificaciones dinámicas.`);
        
        // Limpiamos el input file para permitir subir el mismo archivo otra vez si se desea
        document.getElementById('file-upload-simulacion').value = '';
    }, 100);
}

function agregarCampoPrueba() {
    alert("¡El DAG ya está operativo! Modifique el archivo salvia_esquema.js para agregar nuevos nodos al árbol.");
}

// ==========================================
// MÓDULO DE BANDEJA DE SEGUIMIENTO (Borradores)
// ==========================================

function cargarBandejaSeguimiento() {
    const tbody = document.getElementById('tabla-seguimiento');
    if (!tbody) return;

    // Leer la base de datos simulada
    let historialCasos = JSON.parse(localStorage.getItem('salvia_casos') || '[]');
    
    if (historialCasos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500"><i class="fa-solid fa-folder-open text-3xl mb-3 block text-slate-300"></i>No hay casos en progreso. Llena un formulario Kobo y guárdalo para que aparezca aquí.</td></tr>`;
        return;
    }

    // Dibujar las filas dinámicamente
    tbody.innerHTML = historialCasos.reverse().map(caso => {
        // Intentamos sacar el ID de la víctima, si no lo llenó, mostramos "Dato faltante"
        const idVictima = caso.respuestas_valores['K1_003'] || caso.respuestas_valores['G1_006'] || '<span class="text-red-400 italic">Dato faltante</span>';
        
        return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td class="px-6 py-4 font-mono text-xs font-bold text-indigo-600">${caso.metadata.id_simulacion}</td>
            <td class="px-6 py-4 font-medium text-sm text-slate-700">Doc: ${idVictima}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200"><i class="fa-solid fa-pen-to-square mr-1"></i> Borrador</span>
            </td>
            <td class="px-6 py-4 text-xs text-slate-500">${caso.metadata.fecha_humana}</td>
            <td class="px-6 py-4">
                <button onclick="retomarCaso('${caso.metadata.id_simulacion}')" class="bg-[#B53D75] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#8e2d5a] text-xs font-bold flex items-center transition-colors">
                    <i class="fa-solid fa-folder-open mr-2"></i> Retomar
                </button>
            </td>
        </tr>
        `
    }).join('');
}

function retomarCaso(idCaso) {
    // Buscar el caso en la memoria
    let historialCasos = JSON.parse(localStorage.getItem('salvia_casos') || '[]');
    const casoEncontrado = historialCasos.find(c => c.metadata.id_simulacion === idCaso);
    
    if (casoEncontrado) {
        // Reutilizamos tu magistral función de restauración
        procesarDatosRestauracion(casoEncontrado);
    }
}

// =====================================================================
// MÓDULO V4.0: NAVEGACIÓN DE DIAGRAMA INTERACTIVO Y TAMIZAJE
// =====================================================================

// 1. CONTROLADOR PRINCIPAL DEL DIAGRAMA
function abrirModulo(moduloId) {
    const modal = document.getElementById('salvia-modal');
    const title = document.getElementById('modal-title');
    const container = document.getElementById('eav-form-container');
    const btnSubmit = document.getElementById('modal-submit-btn');

    // Limpiamos el contenedor
    container.innerHTML = '';
    btnSubmit.style.display = 'block';

    // Iluminar el texto explicativo de la izquierda
    sincronizarTextoExplicativo(moduloId);

    // LÓGICA DE RUTEO SEGÚN EL BOTÓN PRESIONADO
    if (moduloId === 'victima' || moduloId === 'tercero' || moduloId === 'agresor') {
        // FORMULARIOS DE REGISTRO
        title.innerHTML = `<i class="fa-solid fa-address-card text-purple-600 mr-2"></i> Registro Inicial: ${moduloId.toUpperCase()}`;
        rolActual = moduloId; 
        
        // Aquí conectamos con tu motor EAV existente
        // Nota: Asegúrate de tener "raices_agresor" en tu salvia_esquema.js, si no, usa una existente para la demo
        let raizCargar = 'raices_' + moduloId;
        if (!arbolRelaciones[raizCargar]) raizCargar = 'raices_tercero'; // Fallback de seguridad
        
        // Re-mapeamos temporalmente la función de renderizado para usar este contenedor y esta raíz
        renderizarEAVPersonalizado(container.id, raizCargar);

    } else if (moduloId === 'funcionario') {
        title.innerHTML = `<i class="fa-solid fa-headset text-indigo-600 mr-2"></i> Atención Línea 155`;
        rolActual = 'funcionario';
        renderizarEAVPersonalizado(container.id, 'raices_funcionario');

    } else if (moduloId === 'kobo') {
        title.innerHTML = `<i class="fa-solid fa-list-check text-pink-600 mr-2"></i> Formulario Kobo (Generación de Caso)`;
        rolActual = 'kobo';
        // Simulamos traer datos previos
        precargarDatosCasoKobo(); 
        renderizarEAVPersonalizado(container.id, 'raices_kobo');

    } else if (moduloId === 'tamizaje') {
        // TAMIZAJE DE RIESGO (Calculadora Custom)
        title.innerHTML = `<i class="fa-solid fa-calculator text-yellow-600 mr-2"></i> Valoración de Riesgo`;
        renderizarTamizajeCustom(container);
        btnSubmit.innerText = "Guardar Puntuación";

    } else if (moduloId.startsWith('repo-')) {
        // REPOSITORIOS DE SEGUIMIENTO (Bandejas)
        const area = moduloId.split('-')[1].toUpperCase();
        title.innerHTML = `<i class="fa-solid fa-folder-tree text-teal-600 mr-2"></i> Repositorio de Asignación: ${area}`;
        btnSubmit.style.display = 'none'; // No hay botón de guardar en la bandeja
        cargarRepositorio(container, area);
    }

    // Finalmente, mostramos el modal con animación
    modal.classList.remove('hidden');
}

function cerrarModulo() {
    document.getElementById('salvia-modal').classList.add('hidden');
}

// 2. SINCRONIZADOR DE TEXTO (El 1/3 de la pantalla)
function sincronizarTextoExplicativo(moduloId) {
    // Apagar todos los textos
    document.querySelectorAll('.text-block').forEach(el => {
        el.classList.remove('active-text', 'opacity-100');
        el.classList.add('opacity-40');
    });

    // Definir qué sección encender según el botón
    let seccionId = '';
    if (['victima', 'tercero', 'agresor'].includes(moduloId)) seccionId = 'registro';
    else if (['funcionario', 'tamizaje'].includes(moduloId)) seccionId = 'funcionario';
    else if (moduloId === 'kobo') seccionId = 'kobo';
    else if (moduloId.startsWith('repo-')) seccionId = 'seguimiento';

    // Encender el texto correcto
    const activa = document.getElementById(`text-section-${seccionId}`);
    if (activa) {
        activa.classList.remove('opacity-40');
        activa.classList.add('active-text', 'opacity-100', 'transition-all', 'duration-500');
    }
}

// 3. MOTOR DEL TAMIZAJE DE RIESGO
function renderizarTamizajeCustom(container) {
    // Generamos una interfaz rápida de 20 preguntas booleanas simuladas para la demostración
    let htmlPreguntas = '';
    for (let i = 1; i <= 20; i++) {
        htmlPreguntas += `
            <div class="p-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center hover:bg-yellow-50 transition-colors">
                <span class="text-sm text-gray-700 font-medium">${i}. Indicador de riesgo psicosocial / físico #${i}</span>
                <div class="flex gap-4">
                    <label class="flex items-center gap-1 cursor-pointer text-sm">
                        <input type="radio" name="tam_${i}" value="1" onchange="calcularTamizaje()" class="w-4 h-4 text-yellow-600"> Sí
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer text-sm">
                        <input type="radio" name="tam_${i}" value="0" onchange="calcularTamizaje()" class="w-4 h-4 text-gray-400" checked> No
                    </label>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-3 h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-300">
                <p class="text-sm text-gray-500 mb-4">Responda las 20 preguntas del protocolo estándar. El sistema calculará el riesgo en tiempo real.</p>
                ${htmlPreguntas}
            </div>
            <div class="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8">
                <h4 class="font-bold text-gray-400 mb-4 uppercase tracking-widest text-xs">Puntaje Automatizado</h4>
                <div id="risk-score" class="text-8xl font-black text-slate-800 transition-colors">0</div>
                <div id="risk-badge" class="mt-6 px-6 py-2 rounded-full font-bold text-sm bg-slate-200 text-slate-600 shadow-sm transition-all">SIN RIESGO EVIDENTE</div>
                
                <div class="mt-8 w-full text-xs text-gray-500 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <ul class="space-y-2">
                        <li><span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>> 15 ptos: Riesgo Extremo (Max 4h)</li>
                        <li><span class="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>11 a 15 ptos: Riesgo Alto (Max 24h)</li>
                        <li><span class="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>5 a 10 ptos: Riesgo Moderado (Max 72h)</li>
                        <li><span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>1 a 4 ptos: Riesgo Bajo</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// 4. LÓGICA DE PUNTUACIÓN (Los rangos que solicitaste)
function calcularTamizaje() {
    let puntos = 0;
    // Sumamos todos los radio buttons marcados con valor "1"
    document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
        puntos += parseInt(input.value);
    });

    const scoreDisplay = document.getElementById('risk-score');
    const badgeDisplay = document.getElementById('risk-badge');

    scoreDisplay.innerText = puntos;
    
    // Semaforización y Rangos
    if (puntos > 15) {
        badgeDisplay.innerText = "RIESGO EXTREMO / INMINENTE";
        badgeDisplay.className = "mt-6 px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all bg-red-100 text-red-800 border border-red-300 animate-pulse";
        scoreDisplay.className = "text-8xl font-black text-red-600 transition-colors";
    } else if (puntos >= 11) {
        badgeDisplay.innerText = "RIESGO ALTO";
        badgeDisplay.className = "mt-6 px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all bg-orange-100 text-orange-800 border border-orange-300";
        scoreDisplay.className = "text-8xl font-black text-orange-500 transition-colors";
    } else if (puntos >= 5) {
        badgeDisplay.innerText = "RIESGO MODERADO";
        badgeDisplay.className = "mt-6 px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all bg-yellow-100 text-yellow-800 border border-yellow-300";
        scoreDisplay.className = "text-8xl font-black text-yellow-500 transition-colors";
    } else if (puntos >= 1) {
        badgeDisplay.innerText = "RIESGO BAJO";
        badgeDisplay.className = "mt-6 px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all bg-green-100 text-green-800 border border-green-300";
        scoreDisplay.className = "text-8xl font-black text-green-500 transition-colors";
    } else {
        badgeDisplay.innerText = "SIN RIESGO EVIDENTE";
        badgeDisplay.className = "mt-6 px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all bg-slate-200 text-slate-600";
        scoreDisplay.className = "text-8xl font-black text-slate-800 transition-colors";
    }
}

// 5. FUNCIONES AUXILIARES PARA EL FLUJO
function renderizarEAVPersonalizado(containerId, raizPrincipal) {
    // 1. La "Impresora": Dibuja todo el catálogo de preguntas en el HTML
    renderizarFormularioDinamico(containerId); 
    
    // 2. LA MAGIA (La "Tijera" del DAG): 
    // Como ya definimos 'rolActual' antes de llamar a esta función, 
    // el DAG sabe exactamente qué secciones (S_004, S_005) debe dejar visibles y cuáles ocultar.
    evaluarDAG(containerId);
}


function precargarDatosCasoKobo() {
    console.log("Simulando extracción de datos de la base EAV previa...");
    // Esta función permite que cuando se abra KOBO, busque en LocalStorage
    // el caso anterior y pre-llene "ID de Víctima", "Tipo Documento", etc.
}

function cargarRepositorio(container, area) {
    // Simulador visual rápido para la bandeja de entrada de un área específica
    container.innerHTML = `
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                        <th class="p-4">ID Caso</th>
                        <th class="p-4">Riesgo</th>
                        <th class="p-4">Tiempo Límite</th>
                        <th class="p-4">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr class="bg-red-50 hover:bg-red-100 transition-colors">
                        <td class="p-4 font-mono font-bold text-red-700">CASO-8821</td>
                        <td class="p-4"><span class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">EXTREMO</span></td>
                        <td class="p-4 font-bold text-red-600"><i class="fa-solid fa-clock mr-1"></i> Quedan 2h 15m</td>
                        <td class="p-4"><button class="text-indigo-600 font-bold hover:underline">Gestionar >></button></td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-4 font-mono font-bold text-gray-600">CASO-3491</td>
                        <td class="p-4"><span class="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">MODERADO</span></td>
                        <td class="p-4 text-gray-500"><i class="fa-solid fa-clock mr-1"></i> Quedan 48h</td>
                        <td class="p-4"><button class="text-indigo-600 font-bold hover:underline">Gestionar >></button></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="mt-6 text-xs text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <i class="fa-solid fa-circle-info text-blue-500 mr-2"></i> 
            Este repositorio recibe casos automáticamente desde el enrutamiento del Formulario Kobo. 
            El contador de tiempo límite se reinicia si el estado cambia (Ej: Intentos fallidos de contacto).
        </div>
    `;
}


// ==========================================
// ==========================================
// INICIALIZADOR GENERAL (V4.0 - DIAGRAMA)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Ya no forzamos la navegación a "home-view" porque ahora todo es un solo lienzo.
    
    // 2. Cargamos configuraciones secundarias si existen
    if(typeof cargarCacheAlInicio === 'function') cargarCacheAlInicio(); 
    if(typeof generarCaptchas === 'function') generarCaptchas();
    
    // 3. Ya no dibujamos el formulario al cargar la página. 
    // Ahora esperamos pacientemente a que el usuario haga clic en un nodo del diagrama
    // para dibujar el formulario dinámicamente dentro del Modal.
    console.log("Simulador de Flujo SALVIA V4.0 inicializado. Esperando interacción.");
});

// Parche de compatibilidad para el botón "Guardar" del Modal
function enviarFormulario(event) {
    // Reutilizamos tu magistral función de enviarReporte que guarda el JSON y en la Bandeja
    if(typeof enviarReporte === 'function') {
        enviarReporte(event);
        cerrarModulo(); // Cerramos la ventana flotante al terminar
    } else {
        alert("Función de guardado en construcción.");
    }
}


