function guardarInfoUsuarioDesdeFormulario() {
  const userData = {
    nombre: document.getElementById('nombreCompleto').value,
    tipoDocumento: document.getElementById('document-type').value,
    numeroDocumento: document.getElementById('numeroDocumento').value,
    habitacion: document.getElementById('habitacion').value,
    servicio: document.getElementById('hospital-services').value,
    recordar: document.getElementById('recordarDatos').checked,
    fechaRegistro: new Date().toISOString()
  };
  sessionStorage.setItem('userData', JSON.stringify(userData));
  if (userData.recordar) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }
}


if (document.getElementById('userRegistrationForm')) {
  document.getElementById('userRegistrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    guardarInfoUsuarioDesdeFormulario();
    window.location.href = 'bienvenida.html';
  });
}


function mostrarBienvenidaUsuario() {
  const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
  if (userData && userData.nombre) {
    // Nombre completo
    if (document.getElementById('nombreUsuario'))
      document.getElementById('nombreUsuario').textContent = userData.nombre;

    // Iniciales
    let iniciales = '';
    const nombres = userData.nombre.trim().split(' ').filter(Boolean);
    if (nombres.length >= 2) {
      iniciales = nombres[0][0] + nombres[1][0];
    } else if (nombres.length === 1 && nombres[0].length > 1) {
      iniciales = nombres[0].slice(0, 2);
    } else {
      iniciales = 'U';
    }
    iniciales = iniciales.toUpperCase();

    if (document.getElementById('inicialesUsuario'))
      document.getElementById('inicialesUsuario').textContent = iniciales;
  }
}


if (document.getElementById('nombreUsuario') && document.getElementById('inicialesUsuario')) {
  document.addEventListener('DOMContentLoaded', mostrarBienvenidaUsuario);
}

/// Utilidad para obtener iniciales
function obtenerIniciales(nombre) {
  if (!nombre) return 'U';
  const partes = nombre.trim().split(' ').filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  if (partes.length === 1 && partes[0].length > 1) return partes[0].slice(0, 2).toUpperCase();
  return 'U';
}

function mostrarDatosUsuarioEnPaginas() {
  const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
  if (!userData || !userData.nombre) return;
  const iniciales = obtenerIniciales(userData.nombre);

  if (document.getElementById('inicialesHeader')) {
    document.getElementById('inicialesHeader').textContent = iniciales;
  }
  if (document.getElementById('inicialesMenu')) {
    document.getElementById('inicialesMenu').textContent = iniciales;
  }
  if (document.getElementById('nombreUsuarioMenu')) {
    document.getElementById('nombreUsuarioMenu').textContent = "Nombre: " + userData.nombre;
  }
  if (document.getElementById('documentoInfo')) {
    document.getElementById('documentoInfo').textContent = "# de documento: " + (userData.tipoDocumento || "") + " " + (userData.numeroDocumento || "");
  }
  if (document.getElementById('habitacionInfo')) {
    document.getElementById('habitacionInfo').textContent = "Habitación: " + (userData.habitacion || "");
  }
  if (document.getElementById('servicioInfo')) {
    document.getElementById('servicioInfo').textContent = "Servicio: " + (userData.servicio || "");
  }

  if (document.getElementById('datetime') && userData.fechaRegistro) {
    const fecha = new Date(userData.fechaRegistro);
    document.getElementById('datetime').textContent =
      "Fecha de ingreso: " +
      fecha.toLocaleDateString("es-CO") + " " +
      fecha.toLocaleTimeString("es-CO");
  }

  // BIENVENIDA
  if (document.getElementById('inicialesUsuario')) {
    document.getElementById('inicialesUsuario').textContent = iniciales;
  }
  if (document.getElementById('nombreUsuario')) {
    document.getElementById('nombreUsuario').textContent = userData.nombre;
  }
}

// Llama esto en cada página donde quieras actualizar las iniciales (dashboard, bienvenida, etc)
document.addEventListener('DOMContentLoaded', mostrarDatosUsuarioEnPaginas);

