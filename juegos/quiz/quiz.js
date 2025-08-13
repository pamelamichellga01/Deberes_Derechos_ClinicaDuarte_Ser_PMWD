const preguntas = [
    { texto: "¿Cuál de estos es un deber fundamental para mantener el orden en la clínica?", opciones: ["Mantener el buen orden y aseo en la institución", "Ignorar las señales", "Correr por los pasillos"], correcta: 0 },
    { texto: "Si te sientes mal, ¿cuál es tu derecho como paciente?", opciones: ["No decir nada", "Recibir atención requerida de acuerdo a sus necesidades", "Atenderte a ti mismo"], correcta: 1 },
    { texto: "¿Qué debes hacer si tienes una cita médica?", opciones: ["Llegar tarde intencionalmente", "Cancelar sin avisar", "Cumplir las citas y requerimientos del personal de salud"], correcta: 2 },
    { texto: "¿Qué derecho tienes sobre la información de tu salud?", opciones: ["Que te oculten información", "Conocer toda la información sobre la enfermedad, procedimientos y tratamientos", "Solo conocer lo básico"], correcta: 1 },
    { texto: "¿Cuál de estos es un deber relacionado con tu comportamiento hacia el personal?", opciones: ["Gritarles", "Ignorarlos", "Respetar al personal de salud y a los usuarios"], correcta: 2 },
    { texto: "Si no entiendes una prescripción, ¿cuál es tu derecho?", opciones: ["Asumir lo que dice", "Pedir a otro paciente que te explique", "Recibir prescripción de medicamentos y explicación de vías de administración"], correcta: 2 },
    { texto: "¿Qué deber tienes sobre la información que brindas a la clínica?", opciones: ["Exponer claramente su estado de salud y la causa de su visita", "Dar información falsa", "No decir toda la verdad"], correcta: 0 },
    { texto: "Si quieres rechazar un procedimiento, ¿qué derecho tienes?", opciones: ["Hacerlo sin avisar", "Aceptar o rechazar procedimientos dejando constancia escrita", "No tener opción"], correcta: 1 },
    { texto: "¿Cuál es tu deber si ves algo que daña la clínica?", opciones: ["Informar de todo acto que afecte a la clínica", "No decir nada", "Unirte al daño"], correcta: 0 },
    { texto: "¿Qué derecho tienes sobre el trato que recibes del personal?", opciones: ["Recibir un trato grosero", "Recibir un trato amable, cortés y humano por parte de todo el personal", "Ser ignorado"], correcta: 1 }
];

let preguntaActual = 0;
let respuestasCorrectas = 0;
let feedbackTimeout;

function actualizarProgreso() {
    const porcentaje = ((preguntaActual + 1) / preguntas.length) * 100;
    document.getElementById('progresoFill').style.width = porcentaje + '%';
    document.getElementById('progresoTexto').textContent = `Pregunta ${preguntaActual + 1} de ${preguntas.length}`;
}

function mostrarPregunta() {
    clearTimeout(feedbackTimeout);
    const feedbackMessage = document.getElementById('feedbackMessage');
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback-message';

    const pregunta = preguntas[preguntaActual];
    document.getElementById('preguntaTexto').textContent = pregunta.texto;

    const opcionesContainer = document.getElementById('opcionesContainer');
    opcionesContainer.innerHTML = '';

    pregunta.opciones.forEach((opcion, index) => {
        const boton = document.createElement('button');
        boton.textContent = opcion;
        boton.className = 'opcion-btn';
        boton.onclick = () => validarRespuesta(index);
        opcionesContainer.appendChild(boton);
    });

    document.getElementById('siguienteBtn').disabled = true;
    actualizarProgreso();
}

function validarRespuesta(opcionSeleccionada) {
    const pregunta = preguntas[preguntaActual];
    const opciones = document.querySelectorAll('.opcion-btn');
    const feedbackMessage = document.getElementById('feedbackMessage');

    opciones.forEach(opcion => opcion.disabled = true);

    if (opcionSeleccionada === pregunta.correcta) {
        respuestasCorrectas++;
        opciones[opcionSeleccionada].className = 'opcion-btn opcion-correcta';
        feedbackMessage.textContent = '🎉 ¡Correcto! Excelente conocimiento.';
        feedbackMessage.className = 'feedback-message feedback-correct';
    } else {
        opciones[opcionSeleccionada].className = 'opcion-btn opcion-incorrecta';
        opciones[pregunta.correcta].className = 'opcion-btn opcion-correcta';
        feedbackMessage.textContent = '❌ Incorrecto. La respuesta correcta está destacada.';
        feedbackMessage.className = 'feedback-message feedback-incorrect';
    }

    document.getElementById('siguienteBtn').disabled = false;
    feedbackTimeout = setTimeout(siguientePregunta, 3000);
}

function siguientePregunta() {
    clearTimeout(feedbackTimeout);
    preguntaActual++;
    if (preguntaActual < preguntas.length) {
        mostrarPregunta();
    } else {
        mostrarResultadoFinal();
    }
}

function mostrarResultadoFinal() {
    const porcentaje = (respuestasCorrectas / preguntas.length) * 100;
    const emoji = porcentaje >= 80 ? '🏆' : porcentaje >= 60 ? '🎯' : '📚';
    const titulo = porcentaje >= 80 ? '¡Excelente!' : porcentaje >= 60 ? '¡Bien hecho!' : '¡Sigue aprendiendo!';
    const mensaje = porcentaje >= 80 ? 
        'Dominas perfectamente tus derechos y deberes como paciente.' :
        porcentaje >= 60 ?
        'Tienes buen conocimiento, pero siempre se puede mejorar.' :
        'Es importante seguir aprendiendo sobre tus derechos y deberes.';

    document.getElementById('preguntaCard').innerHTML = `
        <div class="final-container">
            <div class="final-emoji">${emoji}</div>
            <h2 class="final-titulo">${titulo}</h2>
            <div class="puntuacion">
                Puntuación: ${respuestasCorrectas}/${preguntas.length} (${Math.round(porcentaje)}%)
            </div>
            <p class="final-mensaje">${mensaje}</p>
            <div class="acciones-finales">
                <button class="accion-btn" onclick="reiniciarQuiz()">
                    <i class="bx bx-refresh"></i> Intentar de nuevo
                </button>
                <a href="dashboard.html" class="accion-btn secundario">
                    <i class="bx bx-home"></i> Volver al Dashboard
                </a>
            </div>
        </div>
    `;
}

function reiniciarQuiz() {
    preguntaActual = 0;
    respuestasCorrectas = 0;
    document.getElementById('preguntaCard').innerHTML = `
        <div class="pregunta-icono">❓</div>
        <div class="pregunta-texto" id="preguntaTexto"></div>
        <div class="opciones-container" id="opcionesContainer"></div>
        <div class="feedback-message" id="feedbackMessage"></div>
        <button class="siguiente-btn" id="siguienteBtn" disabled>
            Siguiente <i class="bx bx-right-arrow-alt"></i>
        </button>
    `;
    mostrarPregunta();
}

document.getElementById('siguienteBtn').addEventListener('click', siguientePregunta);

window.addEventListener('DOMContentLoaded', mostrarPregunta);