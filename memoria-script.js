const totalCards = 20;
const derechos = [
   "Conocer todos los trámites administrativos",
   "Ser informado de todo lo relacionado con su atención",
   "Recibir atención que salvaguarde su dignidad personal y respete sus valores",
   "Respetar su privacidad y confidencialidad",
   "Recibir un trato amable y cortés",
   "Conocer sobre la enfermedad y tratamientos",
   "Ser atendido por personal capacitado",
   "Recibir prescripción de medicamentos y explicación",
   "Aceptar o rechazar procedimientos",
   "Recibir atención según necesidades"
];

const deberes = [
   "Mantener el orden y aseo en la institución",
   "Cumplir las normas y actuar de buena fe",
   "Exponer su estado de salud y motivo de visita",
   "Seguir las recomendaciones médicas",
   "No solicitar servicios con información engañosa",
   "Brindar información para un buen servicio",
   "Informar actos que afecten a la clínica",
   "Cumplir citas y requerimientos",
   "Respetar al personal y a los usuarios",
   "Brindar un trato amable y digno"
];

let cards = [];
let selectedCards = [];
let valuesUsed = [];
let currentMove = 0;
let currentAttempts = 0;
let ultimoTipo = null;

let cardTemplate = '<div class="card"><div class="back"></div><div class="face"></div></div>';

function activate(e) {
   if (currentMove < 2) {
      if ((!selectedCards[0] || selectedCards[0] !== e.target) && !e.target.classList.contains('active') ) {
         e.target.classList.add('active');
         selectedCards.push(e.target);

         if (++currentMove == 2) {
            currentAttempts++;
            document.querySelector('#stats').innerHTML = currentAttempts + ' intentos';

            if (selectedCards[0].querySelectorAll('.face')[0].innerHTML == selectedCards[1].querySelectorAll('.face')[0].innerHTML) {
               selectedCards = [];
               currentMove = 0;
               
               // Verificar si el juego está completo
               setTimeout(() => {
                  const activeCards = document.querySelectorAll('.card.active');
                  if (activeCards.length === totalCards) {
                     mostrarFelicitacion();
                  }
               }, 500);
            }
            else {
               setTimeout(() => {
                  selectedCards[0].classList.remove('active');
                  selectedCards[1].classList.remove('active');
                  selectedCards = [];
                  currentMove = 0;
               }, 600);
            }
         }
      }
   }
}

function mostrarFelicitacion() {
   const felicitacion = document.createElement('div');
   felicitacion.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #0051ff, #43a5eb);
      color: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      animation: aparecer 0.5s ease-out;
   `;
   
   felicitacion.innerHTML = `
      <h2 style="margin: 0 0 20px 0; font-size: 2em;">🎉 ¡Felicitaciones! 🎉</h2>
      <p style="margin: 0 0 20px 0; font-size: 1.2em;">Completaste el juego en ${currentAttempts} intentos</p>
      <button onclick="this.parentElement.remove()" style="
         background: white;
         color: #0051ff;
         border: none;
         padding: 10px 20px;
         border-radius: 25px;
         font-weight: bold;
         cursor: pointer;
         transition: all 0.3s ease;
      ">¡Genial!</button>
   `;
   
   document.body.appendChild(felicitacion);
}

function startGame(tipo) {
    ultimoTipo = tipo;
    document.querySelector('#game').innerHTML = '';
    cards = [];
    selectedCards = [];
    valuesUsed = [];
    currentMove = 0;
    currentAttempts = 0;
    document.querySelector('#stats').innerHTML = '0 intentos';

    const base = tipo === 'derechos' ? derechos : deberes;

    // Duplicar y mezclar
    const duplicated = [...base, ...base];
    const shuffled = duplicated.sort(() => 0.5 - Math.random());

    shuffled.forEach((text, index) => {
        let div = document.createElement('div');
        div.innerHTML = cardTemplate;
        div.querySelector('.face').textContent = text;
        const card = div.querySelector('.card');
        card.addEventListener('click', activate);

        // Agregar animación con delay escalonado
        card.classList.add('animar');
        card.style.animationDelay = `${index * 0.1}s`;

        cards.push(div);
        document.querySelector('#game').appendChild(div);
    });
}

// Lógica para el botón de reinicio
document.getElementById('btn-reiniciar').onclick = function() {
    if (ultimoTipo) {
        startGame(ultimoTipo);
    } else {
        alert('Primero selecciona un modo de juego.');
    }
};

// Agregar efectos de sonido (opcional)
function playCardSound() {
    // Aquí podrías agregar efectos de sonido si lo deseas
    // const audio = new Audio('card-flip.mp3');
    // audio.play();
}

// Mejorar la experiencia de usuario
document.addEventListener('DOMContentLoaded', function() {
    // Agregar instrucciones iniciales
    const instrucciones = document.createElement('div');
    instrucciones.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-size: 0.9em;
        max-width: 300px;
        z-index: 1000;
    `;
    instrucciones.innerHTML = `
        <strong>Instrucciones:</strong><br>
        • Selecciona "Derechos" o "Deberes"<br>
        • Encuentra las parejas iguales<br>
        • Haz clic en las tarjetas para voltearlas
    `;
    
    document.body.appendChild(instrucciones);
    
    // Remover instrucciones después de 10 segundos
    setTimeout(() => {
        if (instrucciones.parentElement) {
            instrucciones.remove();
        }
    }, 10000);
}); 