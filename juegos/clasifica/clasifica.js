const gameData = {
  derechos: [
    "Recibir atención digna y respetuosa",
    "Privacidad y confidencialidad médica",
    "Información clara sobre tratamientos",
    "Aceptar o rechazar procedimientos",
    "Trato amable por parte del personal",
    "Atención por personal capacitado",
    "Conocer costos y trámites",
    "Recibir medicamentos prescritos"
  ],
  deberes: [
    "Cumplir indicaciones médicas",
    "Tratar con respeto al personal",
    "Cuidar las instalaciones",
    "Proporcionar información veraz",
    "Cumplir con citas programadas",
    "Mantener orden y aseo",
    "Seguir normas de la clínica",
    "Reportar efectos adversos"
  ]
};

let gameState = {
  score: 0,
  correctCount: 0,
  totalAttempts: 0,
  cardsPlaced: 0
};

function inicializarJuego() {
  crearCartas();
  actualizarEstadisticas();
  aplicarAnimacionesDeEntrada();
}

function crearCartas() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';

  const todas = [
    ...gameData.derechos.map(texto => ({ texto, tipo: 'derechos' })),
    ...gameData.deberes.map(texto => ({ texto, tipo: 'deberes' }))
  ];

  todas.sort(() => Math.random() - 0.5);

  todas.forEach((item, index) => {
    const carta = document.createElement('div');
    carta.className = 'card fade-in';
    carta.style.animationDelay = `${index * 0.1}s`;
    carta.textContent = item.texto;
    carta.draggable = true;
    carta.dataset.tipo = item.tipo;
    carta.dataset.id = `card-${index}`;

    carta.addEventListener('dragstart', manejarDragStart);
    carta.addEventListener('dragend', manejarDragEnd);
    carta.addEventListener('touchstart', manejarTouchStart, { passive: false });
    carta.addEventListener('touchmove', manejarTouchMove, { passive: false });
    carta.addEventListener('touchend', manejarTouchEnd, { passive: false });

    container.appendChild(carta);
  });
}

function manejarDragStart(e) {
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', JSON.stringify({
    id: e.target.dataset.id,
    tipo: e.target.dataset.tipo,
    texto: e.target.textContent
  }));
}

function manejarDragEnd(e) {
  e.target.classList.remove('dragging');
}

function configurarZonasDeposito() {
  document.querySelectorAll('.drop-zone').forEach(zona => {
    zona.addEventListener('dragover', e => {
      e.preventDefault();
      zona.classList.add('drag-over');
    });
    zona.addEventListener('dragleave', e => {
      if (!zona.contains(e.relatedTarget)) {
        zona.classList.remove('drag-over');
      }
    });
    zona.addEventListener('drop', manejarDrop);
  });
}

function manejarDrop(e) {
  e.preventDefault();
  const zona = e.currentTarget;
  zona.classList.remove('drag-over');
  try {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const carta = document.querySelector(`[data-id="${data.id}"]`);
    if (carta) colocarCartaEnZona(carta, zona, data);
  } catch (error) {
    console.error('Error al procesar drop:', error);
  }
}

function colocarCartaEnZona(carta, zona, data) {
  const tipoZona = zona.dataset.type;
  const esCorrecta = data.tipo === tipoZona;
  carta.remove();

  const nuevaCarta = document.createElement('div');
  nuevaCarta.className = `card ${esCorrecta ? 'correct' : 'incorrect'}`;
  nuevaCarta.textContent = data.texto;
  nuevaCarta.dataset.tipo = data.tipo;

  (zona.querySelector('.dropped-cards') || zona).appendChild(nuevaCarta);

  gameState.totalAttempts++;
  gameState.cardsPlaced++;

  if (esCorrecta) {
    gameState.correctCount++;
    gameState.score += 10;
    mostrarEfectoCorrecta(nuevaCarta);
  } else {
    gameState.score = Math.max(0, gameState.score - 5);
    mostrarEfectoIncorrecta(nuevaCarta);
  }

  actualizarEstadisticas();

  if (gameState.cardsPlaced === 16) {
    setTimeout(mostrarResultadosFinales, 1000);
  }
}

function mostrarEfectoCorrecta(carta) {
  crearParticulas(carta, '#28a745');
}

function mostrarEfectoIncorrecta(carta) {
  crearParticulas(carta, '#dc3545');
}

function crearParticulas(elemento, color) {
  for (let i = 0; i < 8; i++) {
    const particula = document.createElement('div');
    particula.className = 'particle';
    particula.style.cssText = `
      background: ${color};
      width: 6px;
      height: 6px;
      position: absolute;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 2}s;
    `;
    elemento.style.position = 'relative';
    elemento.appendChild(particula);
    setTimeout(() => particula.remove(), 3000);
  }
}

function actualizarEstadisticas() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('correctCount').textContent = gameState.correctCount;
  const accuracy = gameState.totalAttempts > 0
    ? Math.round((gameState.correctCount / gameState.totalAttempts) * 100)
    : 0;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
}

function verificarResultados() {
  const todasCartas = document.querySelectorAll('.drop-zone .card');
  let mensaje = '';
  if (todasCartas.length === 0) {
    mensaje = 'Aún no has colocado ninguna carta. ¡Comienza a arrastrar los conceptos!';
  } else if (todasCartas.length < 16) {
    mensaje = `Has colocado ${todasCartas.length} de 16 cartas. ¡Sigue adelante!`;
  } else {
    mostrarResultadosFinales();
    return;
  }
  mostrarModal('Estado del Juego', mensaje);
}

function mostrarResultadosFinales() {
  const accuracy = Math.round((gameState.correctCount / 16) * 100);
  let titulo, mensaje;
  if (accuracy >= 90) {
    titulo = '¡Excelente conocimiento!';
    mensaje = `Has demostrado un dominio excepcional... Puntuación: ${gameState.score} puntos (${accuracy}% de precisión).`;
  } else if (accuracy >= 70) {
    titulo = '¡Buen trabajo!';
    mensaje = `Tienes un buen entendimiento... Puntuación: ${gameState.score} puntos (${accuracy}% de precisión). ¡Puedes mejorar aún más!`;
  } else {
    titulo = 'Sigue practicando';
    mensaje = `Te recomendamos revisar nuevamente... Puntuación: ${gameState.score} puntos (${accuracy}% de precisión).`;
  }
  mostrarModal(titulo, mensaje);
}

function mostrarModal(titulo, mensaje) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalMessage').textContent = mensaje;
  document.getElementById('resultModal').classList.add('show');
}

function cerrarModal() {
  document.getElementById('resultModal').classList.remove('show');
}

function reiniciarJuego() {
  gameState = { score: 0, correctCount: 0, totalAttempts: 0, cardsPlaced: 0 };
  document.querySelectorAll('.dropped-cards').forEach(z => z.innerHTML = '');
  crearCartas();
  actualizarEstadisticas();
}

function mostrarAyuda() {
  const mensaje = `
    ¡Te ayudamos a jugar!
    
    • DERECHOS: Son las garantías que tienes como paciente (lo que puedes exigir)
    • DEBERES: Son tus responsabilidades como paciente (lo que debes cumplir)
    
    Arrastra cada concepto a la zona correcta. Ganarás 10 puntos por correcta y perderás 5 por incorrecta.
  `;
  mostrarModal('¿Cómo jugar?', mensaje);
}

function volverAlDashboard() {
  if (confirm('¿Estás seguro de que quieres salir del juego? Se perderá el progreso actual.')) {
    window.history.back();
  }
}

function aplicarAnimacionesDeEntrada() {
  document.querySelectorAll('.fade-in').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.2}s`;
  });
}

// Soporte táctil
let touchStartPos = null, currentTouchCard = null;

function manejarTouchStart(e) {
  e.preventDefault();
  currentTouchCard = e.target;
  touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  currentTouchCard.classList.add('dragging');
}

function manejarTouchMove(e) {
  if (!currentTouchCard) return;
  e.preventDefault();
  const touch = e.touches[0];
  Object.assign(currentTouchCard.style, {
    position: 'fixed',
    left: `${touch.clientX - 50}px`,
    top: `${touch.clientY - 25}px`,
    zIndex: '1000'
  });
}

function manejarTouchEnd(e) {
  if (!currentTouchCard) return;
  e.preventDefault();
  currentTouchCard.classList.remove('dragging');
  currentTouchCard = null;
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarJuego();
  configurarZonasDeposito();
});