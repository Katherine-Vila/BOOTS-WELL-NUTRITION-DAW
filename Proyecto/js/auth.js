// ========================================
// BOOST WELL NUTRITION - Autenticacion local
// ========================================

var AUTH_USERS_KEY = 'bwn_users';
var AUTH_SESSION_KEY = 'bwn_user';

document.addEventListener('DOMContentLoaded', function () {
    verificarSesion();
});

function obtenerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(usuarios));
}

function obtenerSesion() {
    try {
        return JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY));
    } catch (error) {
        return null;
    }
}

function guardarSesion(usuario) {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(usuario));
}

function verificarSesion() {
    var usuario = obtenerSesion();
    var userIcon = document.querySelector('a[href="cuenta.html"] .bi-person');
    var userLink = document.querySelector('a[href="cuenta.html"]');

    if (usuario) {
        if (userIcon) {
            userIcon.classList.remove('bi-person');
            userIcon.classList.add('bi-person-check-fill');
            userIcon.style.color = '#2d6a4f';
        }

        if (userLink) {
            userLink.title = 'Mi Cuenta';
        }

        if (document.getElementById('loginSection')) {
            mostrarPerfil(usuario);
        }

        if (document.getElementById('registroForm')) {
            window.location.href = 'cuenta.html';
        }

        return;
    }

    if (document.getElementById('loginSection')) {
        document.getElementById('loginSection').style.display = '';
        document.getElementById('profileSection').style.display = 'none';
    }
}

function registrarUsuario(event) {
    event.preventDefault();

    var nombre = document.getElementById('regNombre').value.trim();
    var apellido = document.getElementById('regApellido').value.trim();
    var fechaNac = document.getElementById('regFechaNac').value;
    var telefono = document.getElementById('regTelefono').value.trim();
    var email = document.getElementById('regEmail').value.trim().toLowerCase();
    var password = document.getElementById('regPassword').value;
    var confirmPassword = document.getElementById('regConfirmPassword').value;
    var btnSubmit = document.querySelector('#registroForm button[type="submit"]');
    var usuarios = obtenerUsuarios();

    if (password.length < 6) {
        mostrarAlerta('La contrasena debe tener al menos 6 caracteres.', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        mostrarAlerta('Las contrasenas no coinciden.', 'danger');
        return;
    }

    if (usuarios.some(function (usuario) { return usuario.email === email; })) {
        mostrarAlerta('Este correo ya esta registrado. Intenta iniciar sesion.', 'danger');
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creando cuenta...';

    var nuevoUsuario = {
        id: Date.now().toString(),
        nombre: nombre,
        apellido: apellido,
        fechaNacimiento: fechaNac,
        telefono: telefono,
        email: email,
        password: password,
        creadoEn: new Date().toISOString(),
        pedidos: [],
        actividades: [
            {
                tipo: 'registro',
                descripcion: 'Creo su cuenta en BOOST WELL NUTRITION',
                creadoEn: new Date().toISOString()
            }
        ]
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    guardarSesion(sanitizarUsuario(nuevoUsuario));

    mostrarAlerta('Cuenta creada exitosamente. Redirigiendo...', 'success');

    setTimeout(function () {
        window.location.href = 'cuenta.html';
    }, 1000);
}

function iniciarSesion(event) {
    event.preventDefault();

    var email = document.getElementById('loginEmail').value.trim().toLowerCase();
    var password = document.getElementById('loginPassword').value;
    var btnSubmit = document.querySelector('#loginForm button[type="submit"]');

    if (!email || !password) {
        mostrarAlerta('Por favor completa todos los campos.', 'danger');
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Ingresando...';

    var usuarios = obtenerUsuarios();
    var usuario = usuarios.find(function (item) {
        return item.email === email && item.password === password;
    });

    if (!usuario) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Ingresar';
        mostrarAlerta('Correo o contrasena incorrectos.', 'danger');
        return;
    }

    usuario.actividades = usuario.actividades || [];
    usuario.actividades.unshift({
        tipo: 'login',
        descripcion: 'Inicio sesion',
        creadoEn: new Date().toISOString()
    });

    guardarUsuarios(usuarios);
    guardarSesion(sanitizarUsuario(usuario));
    mostrarAlerta('Bienvenido de vuelta. Cargando tu perfil...', 'success');

    setTimeout(function () {
        window.location.reload();
    }, 800);
}

function cerrarSesion() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem('boostWellCart');
    mostrarAlerta('Sesion cerrada correctamente.', 'success');

    setTimeout(function () {
        window.location.href = 'index.html';
    }, 800);
}

function sanitizarUsuario(usuario) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        fechaNacimiento: usuario.fechaNacimiento,
        telefono: usuario.telefono,
        email: usuario.email,
        creadoEn: usuario.creadoEn,
        pedidos: usuario.pedidos || [],
        actividades: usuario.actividades || []
    };
}

function mostrarPerfil(usuario) {
    var loginSection = document.getElementById('loginSection');
    var profileSection = document.getElementById('profileSection');

    if (!loginSection || !profileSection) return;

    loginSection.style.display = 'none';
    profileSection.style.display = '';

    var nombre = usuario.nombre || '';
    var apellido = usuario.apellido || '';
    var telefono = usuario.telefono || '';
    var iniciales = ((nombre.charAt(0) || '') + (apellido.charAt(0) || '')).toUpperCase() || 'U';
    var pedidos = usuario.pedidos || [];
    var actividades = usuario.actividades || [];
    var pedidosHTML = '';
    var actividadHTML = '';

    if (pedidos.length > 0) {
        pedidos.forEach(function (pedido) {
            var fecha = new Date(pedido.creadoEn).toLocaleDateString('es-SV');
            pedidosHTML += '<div class="d-flex justify-content-between align-items-center py-2 border-bottom">' +
                '<div><strong>' + pedido.numero + '</strong><br><small class="text-muted">' + fecha + '</small></div>' +
                '<div><span class="badge bg-secondary">' + pedido.estado + '</span>' +
                '<br><strong>$' + parseFloat(pedido.total).toFixed(2) + '</strong></div></div>';
        });
    } else {
        pedidosHTML = '<p class="text-muted text-center py-3"><i class="bi bi-bag"></i> Aun no tienes pedidos</p>';
    }

    if (actividades.length > 0) {
        actividades.slice(0, 5).forEach(function (actividad) {
            var fecha = new Date(actividad.creadoEn).toLocaleDateString('es-SV');
            var icono = actividad.tipo === 'registro' ? 'bi-person-plus text-success' : 'bi-box-arrow-in-right text-primary';

            actividadHTML += '<div class="d-flex align-items-center gap-2 py-2 border-bottom">' +
                '<i class="bi ' + icono + '"></i>' +
                '<div><small>' + actividad.descripcion + '</small><br><small class="text-muted">' + fecha + '</small></div></div>';
        });
    } else {
        actividadHTML = '<p class="text-muted text-center py-3">Sin actividad reciente</p>';
    }

    profileSection.innerHTML =
        '<div class="container">' +
        '  <div class="row g-4">' +
        '    <div class="col-lg-4">' +
        '      <div class="account-card text-center">' +
        '        <div class="profile-avatar" style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#2d6a4f,#52b788);color:#fff;font-size:2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' + iniciales + '</div>' +
        '        <h3>' + nombre + ' ' + apellido + '</h3>' +
        '        <p class="text-muted"><i class="bi bi-envelope"></i> ' + usuario.email + '</p>' +
        (telefono ? '        <p class="text-muted"><i class="bi bi-telephone"></i> ' + telefono + '</p>' : '') +
        '        <hr>' +
        '        <button onclick="cerrarSesion()" class="btn btn-outline-danger w-100">' +
        '          <i class="bi bi-box-arrow-right"></i> Cerrar Sesion' +
        '        </button>' +
        '      </div>' +
        '    </div>' +
        '    <div class="col-lg-4">' +
        '      <div class="account-card">' +
        '        <h4><i class="bi bi-bag"></i> Mis Pedidos</h4>' +
        '        <hr>' + pedidosHTML +
        '      </div>' +
        '    </div>' +
        '    <div class="col-lg-4">' +
        '      <div class="account-card">' +
        '        <h4><i class="bi bi-clock-history"></i> Actividad Reciente</h4>' +
        '        <hr>' + actividadHTML +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
}

function mostrarAlerta(mensaje, tipo) {
    var alertas = document.querySelectorAll('.auth-alert');
    alertas.forEach(function (alerta) { alerta.remove(); });

    var alerta = document.createElement('div');
    alerta.className = 'auth-alert alert alert-' + tipo + ' alert-dismissible fade show';
    alerta.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;min-width:320px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    alerta.innerHTML = mensaje + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';

    document.body.appendChild(alerta);

    setTimeout(function () {
        if (alerta.parentNode) alerta.remove();
    }, 5000);
}
