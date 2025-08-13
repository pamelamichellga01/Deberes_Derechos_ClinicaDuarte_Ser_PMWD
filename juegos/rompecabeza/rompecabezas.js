const FIT_MODE = "contain";

const gameConfig = {
    canvas: null,
    ctx: null,
    filas: 4,
    columnas: 4,
    // Mapeo tablero -> origen: board[y][x] = { sx, sy }
    board: [],
    // Imagenes
    imagenes: [
        'IMG/imagen (1).jpg',
        'IMG/imagen (2).png',
        'IMG/imagen (1).png'
    ],
    imagenSeleccionada: 0,
    imagen: null,

    // Geometría destino
    piezaAncho: 0,
    piezaAlto: 0,
    destOffsetX: 0,
    destOffsetY: 0,
    destTileW: 0,
    destTileH: 0,

    // Geometría fuente (solo para "cover")
    srcX: 0, srcY: 0, srcW: 0, srcH: 0,

    // Juego
    movimientos: 0,
    tiempo: 0,
    puntuacion: 0,
    progreso: 0,
    temporizador: null,
    juegoIniciado: false,
    pausado: false,

    // Selección
    seleccionado: null // {x, y} en tablero
};

function volverAlDashboard() {
    window.location.href = "dashboard.html";
}

window.onload = function () {
    gameConfig.canvas = document.getElementById('puzzleCanvas');
    gameConfig.ctx = gameConfig.canvas.getContext('2d');

    // Click para seleccionar e intercambiar
    gameConfig.canvas.addEventListener('click', manejarClick);

    // Botones de imagen ya existen en tu HTML
    seleccionarImagen(0); // carga imagen y arranca desarmado
};

// ---------- Imagen / configuración ----------
function seleccionarImagen(index) {
    gameConfig.imagenSeleccionada = index;
    const src = gameConfig.imagenes[index];
    const prev = document.getElementById('imagePreview');
    if (prev) prev.src = src;

    // Active state en botones
    const btns = document.querySelectorAll('.image-btn');
    btns.forEach((b, i) => b.classList.toggle('active', i === index));

    cargarImagen(src);
}

function cargarImagen(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        gameConfig.imagen = img;
        reiniciarJuego(); // crea tablero y mezcla
    };
}

function cambiarDificultad() {
    const val = parseInt(document.getElementById('dificultad').value);
    gameConfig.filas = val;
    gameConfig.columnas = val;
    reiniciarJuego();
}

// ---------- Inicialización / mezcla ----------
function reiniciarJuego() {
    detenerTemporizador();
    gameConfig.movimientos = 0;
    gameConfig.tiempo = 0;
    gameConfig.puntuacion = 1000; // Puntuación inicial
    gameConfig.progreso = 0;
    gameConfig.juegoIniciado = false;
    gameConfig.pausado = false;
    gameConfig.seleccionado = null;
    actualizarStats();

    const cw = gameConfig.canvas.width;
    const ch = gameConfig.canvas.height;

    // Tamaño de cada celda del tablero (canvas completo)
    gameConfig.piezaAncho = cw / gameConfig.columnas;
    gameConfig.piezaAlto  = ch / gameConfig.filas;

    // Calcular encaje de imagen
    const img = gameConfig.imagen;
    const imgAspect = img.width / img.height;
    const canvasAspect = cw / ch;

    if (FIT_MODE === "cover") {
        if (imgAspect > canvasAspect) {
            gameConfig.srcH = img.height;
            gameConfig.srcW = img.height * canvasAspect;
            gameConfig.srcY = 0;
            gameConfig.srcX = (img.width - gameConfig.srcW) / 2;
        } else {
            gameConfig.srcW = img.width;
            gameConfig.srcH = img.width / canvasAspect;
            gameConfig.srcX = 0;
            gameConfig.srcY = (img.height - gameConfig.srcH) / 2;
        }
        gameConfig.destOffsetX = 0;
        gameConfig.destOffsetY = 0;
        gameConfig.destTileW = cw / gameConfig.columnas;
        gameConfig.destTileH = ch / gameConfig.filas;
    } else {
        // contain
        gameConfig.srcX = 0; gameConfig.srcY = 0;
        gameConfig.srcW = img.width;
        gameConfig.srcH = img.height;

        const scale = Math.min(cw / img.width, ch / img.height);
        const newW = img.width * scale;
        const newH = img.height * scale;

        gameConfig.destOffsetX = (cw - newW) / 2;
        gameConfig.destOffsetY = (ch - newH) / 2;
        gameConfig.destTileW = newW / gameConfig.columnas;
        gameConfig.destTileH = newH / gameConfig.filas;
    }

    // Tablero identidad
    gameConfig.board = [];
    for (let y = 0; y < gameConfig.filas; y++) {
        const row = [];
        for (let x = 0; x < gameConfig.columnas; x++) {
            row.push({ sx: x, sy: y });
        }
        gameConfig.board.push(row);
    }

    mezclarTablero();   // desarma
    dibujarCanvas();    // muestra desarmado
    calcularProgreso(); // calcula progreso inicial
}

function mezclarTablero() {
    // Lista de todas las posiciones de origen
    const piezas = [];
    for (let y = 0; y < gameConfig.filas; y++) {
        for (let x = 0; x < gameConfig.columnas; x++) {
            piezas.push({ sx: x, sy: y });
        }
    }
    // Mezclar
    for (let i = piezas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [piezas[i], piezas[j]] = [piezas[j], piezas[i]];
    }
    // Evitar estado resuelto por accidente
    let esIdentidad = true;
    for (let i = 0; i < piezas.length; i++) {
        const sx = i % gameConfig.columnas;
        const sy = Math.floor(i / gameConfig.columnas);
        if (piezas[i].sx !== sx || piezas[i].sy !== sy) { esIdentidad = false; break; }
    }
    if (esIdentidad && piezas.length > 1) {
        // Intercambia dos piezas para asegurar desorden
        [piezas[0], piezas[1]] = [piezas[1], piezas[0]];
    }
    // Volcar al tablero (en orden de filas/columnas del canvas)
    let k = 0;
    for (let y = 0; y < gameConfig.filas; y++) {
        for (let x = 0; x < gameConfig.columnas; x++) {
            gameConfig.board[y][x] = piezas[k++];
        }
    }
}

// Función específica para el botón "Mezclar" (agregada)
function mezclarPiezas() {
    if (!gameConfig.imagen) return;
    
    mezclarTablero();
    dibujarCanvas();
    calcularProgreso();
    actualizarStats();
    
    // Si el juego no había empezado, lo iniciamos
    if (!gameConfig.juegoIniciado) {
        gameConfig.juegoIniciado = true;
        iniciarTemporizador();
    }
}

// Función específica para el botón "Nuevo Juego" (corregida)
function iniciarJuego() {
    reiniciarJuego();
    gameConfig.juegoIniciado = true;
    iniciarTemporizador();
}

// ---------- Cálculo de progreso ----------
function calcularProgreso() {
    let piezasCorrectas = 0;
    const totalPiezas = gameConfig.filas * gameConfig.columnas;
    
    for (let y = 0; y < gameConfig.filas; y++) {
        for (let x = 0; x < gameConfig.columnas; x++) {
            const tile = gameConfig.board[y][x];
            if (tile.sx === x && tile.sy === y) {
                piezasCorrectas++;
            }
        }
    }
    
    gameConfig.progreso = Math.round((piezasCorrectas / totalPiezas) * 100);
    return piezasCorrectas === totalPiezas; // devuelve true si está completo
}

// ---------- Sistema de puntuación ----------
function calcularPuntuacion() {
    // Puntuación base según dificultad
    const puntosPorDificultad = {
        3: 500,  // Fácil
        4: 1000, // Medio
        5: 1500  // Difícil
    };
    
    let puntuacionBase = puntosPorDificultad[gameConfig.filas] || 1000;
    
    // Bonus por tiempo (menos tiempo = más puntos)
    let bonusTiempo = Math.max(0, 300 - gameConfig.tiempo); // 300 segundos como referencia
    
    // Penalización por movimientos excesivos
    const movimientosOptimos = gameConfig.filas * gameConfig.columnas * 2;
    let penalizacionMovimientos = Math.max(0, (gameConfig.movimientos - movimientosOptimos) * 5);
    
    // Bonus por progreso actual
    let bonusProgreso = Math.round(puntuacionBase * (gameConfig.progreso / 100) * 0.5);
    
    gameConfig.puntuacion = Math.max(0, puntuacionBase + bonusTiempo + bonusProgreso - penalizacionMovimientos);
}

// ---------- Dibujo ----------
function dibujarCanvas() {
    const ctx = gameConfig.ctx;
    const img = gameConfig.imagen;
    const cw = gameConfig.canvas.width;
    const ch = gameConfig.canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    const srcTileW = gameConfig.srcW / gameConfig.columnas;
    const srcTileH = gameConfig.srcH / gameConfig.filas;

    for (let y = 0; y < gameConfig.filas; y++) {
        for (let x = 0; x < gameConfig.columnas; x++) {
            const tile = gameConfig.board[y][x]; // {sx, sy}

            ctx.drawImage(
                img,
                gameConfig.srcX + tile.sx * srcTileW,
                gameConfig.srcY + tile.sy * srcTileH,
                srcTileW,
                srcTileH,
                gameConfig.destOffsetX + x * gameConfig.destTileW,
                gameConfig.destOffsetY + y * gameConfig.destTileH,
                gameConfig.destTileW,
                gameConfig.destTileH
            );

            // Borde de la celda
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                gameConfig.destOffsetX + x * gameConfig.destTileW,
                gameConfig.destOffsetY + y * gameConfig.destTileH,
                gameConfig.destTileW,
                gameConfig.destTileH
            );
        }
    }

    // Resaltar selección
    if (gameConfig.seleccionado) {
        const { x, y } = gameConfig.seleccionado;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0051ff";
        ctx.strokeRect(
            gameConfig.destOffsetX + x * gameConfig.destTileW,
            gameConfig.destOffsetY + y * gameConfig.destTileH,
            gameConfig.destTileW,
            gameConfig.destTileH
        );
    }
}

// ---------- Interacción ----------
function manejarClick(e) {
    const rect = gameConfig.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Fuera del área activa (cuando FIT_MODE = "contain")
    if (
        px < gameConfig.destOffsetX ||
        py < gameConfig.destOffsetY ||
        px > gameConfig.destOffsetX + gameConfig.destTileW * gameConfig.columnas ||
        py > gameConfig.destOffsetY + gameConfig.destTileH * gameConfig.filas
    ) {
        return;
    }

    const x = Math.floor((px - gameConfig.destOffsetX) / gameConfig.destTileW);
    const y = Math.floor((py - gameConfig.destOffsetY) / gameConfig.destTileH);

    if (!gameConfig.juegoIniciado) {
        gameConfig.juegoIniciado = true;
        iniciarTemporizador(); // arranca timer en el primer clic
    }

    if (!gameConfig.seleccionado) {
        gameConfig.seleccionado = { x, y };
        dibujarCanvas();
        return;
    }

    const { x: sx, y: sy } = gameConfig.seleccionado;

    // Intercambio
    const tmp = gameConfig.board[sy][sx];
    gameConfig.board[sy][sx] = gameConfig.board[y][x];
    gameConfig.board[y][x] = tmp;

    gameConfig.movimientos++;
    gameConfig.seleccionado = null;

    dibujarCanvas();
    calcularProgreso();
    calcularPuntuacion();
    actualizarStats();
    verificarVictoria();
}

// ---------- Controles ----------
function pausarJuego() {
    if (gameConfig.pausado) {
        iniciarTemporizador();
        gameConfig.pausado = false;
        const t = document.getElementById('pauseText');
        if (t) t.innerText = "Pausar";
    } else {
        detenerTemporizador();
        gameConfig.pausado = true;
        const t = document.getElementById('pauseText');
        if (t) t.innerText = "Reanudar";
    }
}

function mostrarSolucion() {
    // Volver a identidad (resuelto)
    for (let y = 0; y < gameConfig.filas; y++) {
        for (let x = 0; x < gameConfig.columnas; x++) {
            gameConfig.board[y][x] = { sx: x, sy: y };
        }
    }
    dibujarCanvas();
    calcularProgreso();
    calcularPuntuacion();
    actualizarStats();
    verificarVictoria();
}

// ---------- Stats / Tiempo ----------
function actualizarStats() {
    const m = document.getElementById('movimientos');
    if (m) m.innerText = gameConfig.movimientos;

    const t = document.getElementById('tiempo');
    if (t) t.innerText = formatTime(gameConfig.tiempo);

    const p = document.getElementById('puntuacion');
    if (p) p.innerText = gameConfig.puntuacion;

    const pr = document.getElementById('progreso');
    if (pr) pr.innerText = gameConfig.progreso + "%";
}

function iniciarTemporizador() {
    detenerTemporizador();
    gameConfig.temporizador = setInterval(() => {
        gameConfig.tiempo++;
        calcularPuntuacion(); // Recalcular puntuación cada segundo
        actualizarStats();
    }, 1000);
}

function detenerTemporizador() {
    if (gameConfig.temporizador) {
        clearInterval(gameConfig.temporizador);
        gameConfig.temporizador = null;
    }
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// ---------- Modal ----------
function cerrarModal() {
    document.getElementById('resultModal').classList.remove('show');
}

function verificarVictoria() {
    // Resuelto cuando board[y][x] apunta al mismo (x,y)
    const completado = calcularProgreso();
    
    if (completado) {
        detenerTemporizador();
        
        // Bonus final por completar
        gameConfig.puntuacion += 500;
        actualizarStats();
        
        const title = document.getElementById('modalTitle');
        const msg = document.getElementById('modalMessage');
        if (title) title.innerText = "¡Felicitaciones!";
        if (msg) {
            msg.innerText = `Completaste el rompecabezas en ${formatTime(gameConfig.tiempo)} con ${gameConfig.movimientos} movimientos. Puntuación final: ${gameConfig.puntuacion} puntos.`;
        }
        document.getElementById('resultModal').classList.add('show');
    }
}