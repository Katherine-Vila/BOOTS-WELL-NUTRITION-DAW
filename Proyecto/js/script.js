// ========================================
// BOOST WELL NUTRITION - JavaScript
// ========================================

// ========================================
// URLs Limpias - Ocultar extensión .html
// ========================================
(function () {
    var path = window.location.pathname;
    if (path.endsWith('.html')) {
        var cleanPath = path.replace('.html', '');
        // Renombrar "index" a solo la raíz "/"
        if (cleanPath.endsWith('/index')) {
            cleanPath = cleanPath.replace('/index', '/');
        }
        window.history.replaceState(null, document.title, cleanPath);
    }
})();

// ========================================
// Gestión del Carrito
// ========================================


let cart = JSON.parse(localStorage.getItem('boostWellCart')) || [];

const validators = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
    salvadoranPhone: /^(\+503\s?)?[267][0-9]{3}[-\s]?[0-9]{4}$/,
    orderNumber: /^BWN\d{11}$/
};

function isValidEmail(value) {
    return validators.email.test(String(value).trim());
}

function isValidPhone(value) {
    return validators.salvadoranPhone.test(String(value).trim());
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Función para agregar al carrito
function addToCart(productName, price, image = 'img/LOGO-sin fondo.png') {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1,
            image: image
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${productName} añadido al carrito`);
}

// Remover del carrito
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCart();
    updateCartCount();
    displayCartItems();
    showNotification(`${productName} eliminado del carrito`);
}

// Actualizar cantidad
function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productName);
        } else {
            saveCart();
            displayCartItems();
        }
    }
}

// Guardar carrito en LocalStorage
function saveCart() {
    localStorage.setItem('boostWellCart', JSON.stringify(cart));
}

// Actualizar contador del carrito
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadges = document.querySelectorAll('#cartCount');
    
    cartBadges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

// Calculate subtotal (sin descuento)
function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Calculate Cart Total
function calculateTotal() {
    return calculateSubtotal();
}

// Mostrar items del carrito (para página de carrito)
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-5">
                    <h4>Tu carrito está vacío</h4>
                    <a href="productos.html" class="btn btn-primary-custom mt-3">Ver Productos</a>
                </td>
            </tr>
        `;
        if (cartTotalElement) cartTotalElement.textContent = '$0.00';
        const cartSubtotalElement = document.getElementById('cartSubtotal');
        if (cartSubtotalElement) cartSubtotalElement.textContent = '$0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-3">
                    <button class="remove-btn" onclick="removeFromCart('${item.name}')">
                        <i class="bi bi-x-circle"></i>
                    </button>
                    <img src="${item.image || 'img/LOGO-sin fondo.png'}" 
                         alt="${item.name}" 
                         class="cart-item-image">
                    <strong>${item.name}</strong>
                </div>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    <span class="px-3">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                </div>
            </td>
            <td><strong>$${(item.price * item.quantity).toFixed(2)}</strong></td>
        </tr>
    `).join('');
    
    updateCartSummary();
}

// Mostrar resumen de pedido (para página de checkout)
function displayOrderSummary() {
    const orderSummaryContainer = document.getElementById('orderSummary');
    const orderTotalElement = document.getElementById('orderTotal');
    
    if (!orderSummaryContainer) return;
    
    if (cart.length === 0) {
        orderSummaryContainer.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4">
                    <p>No hay productos en el carrito</p>
                </td>
            </tr>
        `;
        if (orderTotalElement) orderTotalElement.textContent = '$0.00';
        return;
    }
    
    orderSummaryContainer.innerHTML = cart.map(item => `
        <tr>
            <td>${item.name} x ${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    const total = calculateTotal();
    
    if (orderTotalElement) {
        orderTotalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    // Actualizar monto de pago en efectivo
    updateCashPaymentAmount(total);
}

// ========================================
// Notificaciones
// ========================================

function showNotification(message, type = 'success') {
    // Remover notificaciones existentes
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>
        ${message}
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #7d9670, #3d4f3d)' : 'linear-gradient(135deg, #dc3545, #c82333)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
        font-weight: 600;
        display: flex;
        align-items: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Manejo de Formularios
// ========================================

// Formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]')?.value || '';
        const message = this.querySelector('textarea')?.value || '';
        if (!isValidEmail(email)) {
            showNotification('Ingresa un correo electronico valido', 'error');
            return;
        }
        if (message.trim().length < 10) {
            showNotification('El mensaje debe tener al menos 10 caracteres', 'error');
            return;
        }
        showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.');
        contactForm.reset();
    });
}

// Formulario de newsletter
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (!isValidEmail(email)) {
            showNotification('Ingresa un correo electronico valido', 'error');
            return;
        }
        sessionStorage.setItem('boostWellNewsletterEmail', email);
        showNotification('¡Gracias por suscribirte! Recibirás nuestras mejores ofertas.');
        this.reset();
    });
}

// Formulario de cuenta
const accountForms = document.querySelectorAll('.account-form');
accountForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('¡Inicio de sesión exitoso!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});

// Formulario de registro
const registrationForm = document.querySelector('.registration-form');
if (registrationForm) {
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = this.querySelector('input[type="password"]').value;
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
        const email = this.querySelector('input[type="email"]')?.value || '';
        const phone = this.querySelector('input[type="tel"]')?.value || '';
        
        if (!isValidEmail(email)) {
            showNotification('Ingresa un correo electronico valido', 'error');
            return;
        }
        
        if (!isValidPhone(phone)) {
            showNotification('Ingresa un telefono salvadoreno valido', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        showNotification('¡Cuenta creada con éxito!');
        setTimeout(() => {
            window.location.href = 'cuenta.html';
        }, 1500);
    });
}

// Formulario de checkout
const checkoutForm = document.querySelector('.checkout-form');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
    });
}

// Función para actualizar monto de pago en efectivo
function updateCashPaymentAmount(total) {
    const cashAmount = document.getElementById('cashAmount');
    if (cashAmount) {
        cashAmount.textContent = `$${total.toFixed(2)}`;
    }
}

// Alternar método de pago
const pagoEfectivo = document.getElementById('pagoEfectivo');
const pagoLinea = document.getElementById('pagoLinea');
const cashPaymentInfo = document.getElementById('cashPaymentInfo');
const cardPaymentForm = document.getElementById('cardPaymentForm');

if (pagoEfectivo && pagoLinea) {
    pagoEfectivo.addEventListener('change', function() {
        if (this.checked) {
            cashPaymentInfo.style.display = 'block';
            if (cardPaymentForm) cardPaymentForm.style.display = 'none';
            
            // Actualizar monto del carrito (con descuento si aplica)
            const total = calculateTotal();
            updateCashPaymentAmount(total);
            
            // Cambiar texto del botón
            const btnText = document.getElementById('btnText');
            if (btnText) {
                btnText.innerHTML = '<i class="bi bi-check-circle"></i> Finalizar Compra';
            }
        }
    });
    
    pagoLinea.addEventListener('change', function() {
        if (this.checked) {
            cashPaymentInfo.style.display = 'none';
            if (cardPaymentForm) cardPaymentForm.style.display = 'block';
            
            // Cambiar texto del botón
            const btnText = document.getElementById('btnText');
            if (btnText) {
                btnText.innerHTML = '<i class="bi bi-credit-card"></i> Procesar Pago';
            }
        }
    });
}

// Formateo automático de campos de tarjeta
const cardNumber = document.getElementById('cardNumber');
if (cardNumber) {
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
}

const cardExpiry = document.getElementById('cardExpiry');
if (cardExpiry) {
    cardExpiry.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
}

const cardCVV = document.getElementById('cardCVV');
if (cardCVV) {
    cardCVV.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// ========================================
// Generar número de pedido
// ========================================
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `BWN${year}${month}${day}${random}`;
}

// Botón de envío de checkout
const checkoutSubmitBtn = document.getElementById('finalizarCompraBtn');
if (checkoutSubmitBtn) {
    console.log('✅ Botón de finalizar compra encontrado y conectado correctamente');
    checkoutSubmitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('🔵 Botón de finalizar compra presionado');
        
        if (cart.length === 0) {
            showNotification('Tu carrito está vacío', 'error');
            return;
        }
        
        // Validar que se hayan completado los datos del cliente
        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const address = document.getElementById('address')?.value.trim();
        
        console.log('🔍 Validando campos:', {
            name: name || 'VACÍO',
            email: email || 'VACÍO',
            phone: phone || 'VACÍO',
            address: address || 'VACÍO'
        });
        
        if (!name || !email || !phone || !address) {
            showNotification('Por favor completa todos los campos de facturación', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Ingresa un correo electronico valido', 'error');
            return;
        }
        
        if (!isValidPhone(phone)) {
            showNotification('Ingresa un telefono salvadoreno valido', 'error');
            return;
        }
        
        // Verificar método de pago
        const pagoLinea = document.getElementById('pagoLinea');
        const pagoEfectivo = document.getElementById('pagoEfectivo');
        
        if (!pagoLinea?.checked && !pagoEfectivo?.checked) {
            showNotification('Por favor selecciona un método de pago', 'error');
            return;
        }
        
        if (pagoLinea && pagoLinea.checked) {
            // Simular proceso de pago con tarjeta
            simulateCardPayment();
        } else {
            // Procesar pedido directamente (pago en efectivo)
            finalizePurchase('Efectivo');
        }
    });
}

// Simular pago con tarjeta
function simulateCardPayment() {
    // Validar campos de tarjeta
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    
    if (!/^\d{15,16}$/.test(cardNumber)) {
        alert('❌ Por favor ingresa un número de tarjeta válido');
        document.getElementById('cardNumber').focus();
        return;
    }
    
    if (!cardName || cardName.length < 3) {
        alert('❌ Por favor ingresa el nombre como aparece en la tarjeta');
        document.getElementById('cardName').focus();
        return;
    }
    
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        alert('❌ Por favor ingresa la fecha de expiración (MM/AA)');
        document.getElementById('cardExpiry').focus();
        return;
    }
    
    if (!/^\d{3,4}$/.test(cardCVV)) {
        alert('❌ Por favor ingresa el CVV (3 dígitos)');
        document.getElementById('cardCVV').focus();
        return;
    }
    
    const total = calculateTotal();
    
    // Detectar tipo de tarjeta usando switch
    let cardType;
    switch (cardNumber.charAt(0)) {
        case '4':
            cardType = 'VISA';
            break;
        case '5':
            cardType = 'MASTERCARD';
            break;
        case '3':
            cardType = 'AMEX';
            break;
        default:
            cardType = 'VISA';
            break;
    }
    
    // Crear modal de procesamiento
    const modalHTML = `
        <div class="modal fade" id="paymentModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-credit-card-fill"></i> Procesando Pago
                        </h5>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="mb-3">
                            <i class="bi bi-credit-card text-primary" style="font-size: 64px;"></i>
                        </div>
                        <h5>Total a cobrar: $${total.toFixed(2)}</h5>
                        <p class="text-muted mb-1">${cardType} •••• ${cardNumber.slice(-4)}</p>
                        <p class="text-muted small">${cardName}</p>
                        
                        <div id="paymentProgress" class="progress mb-3" style="height: 30px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                                 role="progressbar" style="width: 0%; font-weight: bold; font-size: 14px;">
                                Validando tarjeta...
                            </div>
                        </div>
                        
                        <p class="small text-muted mb-0">
                            <i class="bi bi-shield-lock-fill"></i> Transacción segura y encriptada
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
    
    // Simular progreso de pago
    let progress = 0;
    const progressBar = document.querySelector('#paymentProgress .progress-bar');
    const messages = [
        'Validando tarjeta...',
        'Contactando con banco emisor...',
        'Verificando fondos...',
        'Procesando transacción...',
        'Confirmando pago...',
        '¡Pago aprobado!'
    ];
    
    const interval = setInterval(() => {
        progress += Math.floor(100 / messages.length);
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        const messageIndex = Math.floor((progress / 100) * messages.length);
        progressBar.textContent = messages[messageIndex] || messages[messages.length - 1];
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                paymentModal.hide();
                // Eliminar modal del DOM
                setTimeout(() => {
                    document.getElementById('paymentModal')?.remove();
                }, 300);
                // Finalizar pedido
                finalizePurchase(`${cardType} •••• ${cardNumber.slice(-4)}`);
            }, 1000);
        }
    }, 500);
}

// Finalizar compra
function finalizePurchase(paymentMethod) {
    // Generar número de pedido
    const orderNumber = generateOrderNumber();
    
    // Calcular valores
    const subtotal = calculateSubtotal();
    const total = subtotal;
    
    // Capturar datos del cliente
    const customerData = {
        name: document.getElementById('name')?.value.trim() || 'Cliente',
        email: document.getElementById('email')?.value.trim() || '',
        phone: document.getElementById('phone')?.value.trim() || '',
        address: document.getElementById('address')?.value.trim() || ''
    };
    
    console.log('📋 Datos del cliente capturados:', customerData);
    
    // Guardar pedido en localStorage
    const orderData = {
        orderNumber: orderNumber,
        items: [...cart],
        subtotal: subtotal,
        total: total,
        paymentMethod: paymentMethod,
        date: new Date().toLocaleString('es-SV', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        status: 'received',
        estimatedDelivery: '30-45 minutos',
        customer: customerData
    };
    
    console.log('💾 Pedido guardado en localStorage:', orderData);
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    
    // Mostrar modal de confirmación con número de pedido
    showOrderConfirmation(orderData);
    
    // Limpiar carrito después de mostrar confirmación
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartCount();
    }, 1000);
}

// Mostrar confirmación de pedido
function showOrderConfirmation(orderData) {
    const isCard = orderData.paymentMethod.includes('VISA') || orderData.paymentMethod.includes('MASTERCARD');
    const paymentBadge = isCard
        ? `<span class="badge bg-success mb-2" style="font-size: 14px;"><i class="bi bi-credit-card-fill"></i> Pago aprobado: ${orderData.paymentMethod}</span>`
        : '<span class="badge bg-warning text-dark mb-2" style="font-size: 14px;"><i class="bi bi-cash-coin"></i> Pago en efectivo al recibir</span>';
    
    const modalHTML = `
        <div class="modal fade show" id="orderConfirmationModal" style="display: block; background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="border-radius: 15px; border: none;">
                    <div class="modal-body text-center p-5">
                        <div style="font-size: 80px; color: #4a7c59;">
                            <i class="bi bi-check-circle-fill"></i>
                        </div>
                        <h2 class="mt-3 mb-2" style="color: #2d5a3d; font-weight: 700;">¡Pedido Confirmado!</h2>
                        ${paymentBadge}
                        <p class="mb-4" style="font-size: 16px; color: #666;">
                            Tu pedido ha sido registrado exitosamente
                        </p>
                        
                        <div class="alert" style="background: #e8f5e9; border: 2px solid #4a7c59; border-radius: 10px; padding: 20px; margin: 20px 0;">
                            <p class="mb-2" style="color: #2d5a3d; font-weight: 600;">Número de Pedido:</p>
                            <h3 class="mb-0" style="color: #4a7c59; font-weight: 700; font-size: 28px; letter-spacing: 1px;">
                                ${orderData.orderNumber}
                            </h3>
                        </div>
                        
                        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
                            <p class="mb-2" style="font-size: 14px; color: #856404;">
                                <i class="bi bi-info-circle-fill"></i> <strong>Importante:</strong>
                            </p>
                            <ul style="font-size: 14px; color: #856404; margin: 0; padding-left: 20px;">
                                <li>Guarda este número para rastrear tu pedido</li>
                                <li>Recibirás un correo de confirmación</li>
                                <li>⏱️ Tiempo estimado de entrega: ${orderData.estimatedDelivery}</li>
                            </ul>
                        </div>
                        
                        <div class="d-grid gap-2 mt-4">
                            <button class="btn btn-success btn-lg" onclick="downloadInvoiceFromConfirmation()">
                                <i class="bi bi-file-earmark-pdf-fill"></i> Descargar Factura PDF
                            </button>
                            <a href="seguimiento.html?order=${orderData.orderNumber}" class="btn btn-primary-custom btn-lg">
                                <i class="bi bi-geo-alt-fill"></i> Rastrear mi Pedido
                            </a>
                            <button class="btn btn-outline-secondary" onclick="closeOrderModal()">
                                <i class="bi bi-house-fill"></i> Continuar Comprando
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Cerrar modal de confirmación
function closeOrderModal() {
    const modal = document.getElementById('orderConfirmationModal');
    if (modal) {
        modal.remove();
            window.location.href = 'index.html';
    }
}

// ========================================
// Generar factura desde confirmación de pago
// ========================================

function generateBoostWellInvoice(orderData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const darkGreen = [35, 61, 50];
    const mediumGreen = [93, 127, 98];
    const sage = [237, 243, 228];
    const cream = [247, 244, 234];
    const coral = [201, 111, 74];
    const charcoal = [36, 41, 35];
    const orderDate = orderData.date || orderData.orderDate || new Date().toLocaleString('es-SV');
    const customer = orderData.customer || {};
    const items = orderData.items || [];
    const subtotal = Number(orderData.subtotal || items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const total = Number(orderData.total || subtotal);
    const statusLabels = {
        received: 'Recibido',
        preparing: 'En preparacion',
        shipping: 'En camino',
        delivered: 'Entregado'
    };
    const status = statusLabels[orderData.status] || 'En proceso';

    doc.setFillColor(...cream);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(...darkGreen);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setFillColor(...coral);
    doc.rect(0, 40, 210, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('BOOST WELL', 18, 18);
    doc.setFontSize(12);
    doc.text('NUTRITION', 18, 27);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Alimentos saludables y bebidas funcionales', 18, 34);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FACTURA', 168, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`No. ${orderData.orderNumber}`, 168, 27, { align: 'right' });
    doc.text(orderDate, 168, 34, { align: 'right' });

    doc.setTextColor(...charcoal);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(18, 54, 86, 38, 4, 4, 'F');
    doc.setFillColor(...sage);
    doc.roundedRect(112, 54, 76, 38, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkGreen);
    doc.text('Cliente', 24, 64);
    doc.text('Pedido', 118, 64);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    doc.text(customer.name || 'Cliente', 24, 72);
    doc.text(customer.phone || '+503 7475-3562', 24, 78);
    doc.text(doc.splitTextToSize(customer.address || 'Direccion por confirmar', 70), 24, 84);
    doc.text(`Estado: ${status}`, 118, 72);
    doc.text(`Metodo: ${orderData.paymentMethod || 'Por confirmar'}`, 118, 78);
    doc.text(`Entrega: ${orderData.estimatedDelivery || '30-45 minutos'}`, 118, 84);

    let y = 108;
    doc.setFillColor(...darkGreen);
    doc.roundedRect(18, y, 174, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Producto', 24, y + 7);
    doc.text('Cant.', 118, y + 7, { align: 'center' });
    doc.text('Precio', 145, y + 7, { align: 'right' });
    doc.text('Subtotal', 186, y + 7, { align: 'right' });

    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    items.forEach((item, index) => {
        if (index % 2 === 0) {
            doc.setFillColor(255, 255, 255);
            doc.rect(18, y - 6, 174, 10, 'F');
        }
        doc.text(doc.splitTextToSize(item.name, 82), 24, y);
        doc.text(String(item.quantity), 118, y, { align: 'center' });
        doc.text(`$${Number(item.price).toFixed(2)}`, 145, y, { align: 'right' });
        doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 186, y, { align: 'right' });
        y += 11;
    });

    y += 8;
    doc.setDrawColor(...mediumGreen);
    doc.setLineWidth(0.4);
    doc.line(112, y, 192, y);
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal', 138, y, { align: 'right' });
    doc.text(`$${subtotal.toFixed(2)}`, 186, y, { align: 'right' });
    y += 8;
    doc.text('Envio', 138, y, { align: 'right' });
    doc.text('Gratis', 186, y, { align: 'right' });
    y += 10;
    doc.setFillColor(...mediumGreen);
    doc.roundedRect(112, y - 7, 80, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL', 138, y + 2, { align: 'right' });
    doc.text(`$${total.toFixed(2)}`, 186, y + 2, { align: 'right' });

    doc.setTextColor(...charcoal);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(18, 230, 174, 32, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkGreen);
    doc.text('Gracias por tu compra', 24, 241);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    doc.text('BOOST WELL NUTRITION confirma que tu pedido fue registrado correctamente.', 24, 249);
    doc.text('WhatsApp: +503 7475-3562 | flower.89045@gmail.com', 24, 256);

    doc.setFillColor(...darkGreen);
    doc.rect(0, 278, 210, 19, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Antiguo Cuscatlan, La Libertad, El Salvador', 105, 288, { align: 'center' });
    doc.save(`Factura-${orderData.orderNumber}.pdf`);
}

function downloadInvoiceFromConfirmation() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));

    if (!lastOrder) {
        showNotification('No se pudo generar la factura', 'error');
        return;
    }

    generateBoostWellInvoice(lastOrder);
    showNotification('Factura descargada exitosamente', 'success');
}
// ========================================
// Efecto de scroll en Navbar
// ========================================

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ========================================
// Desplazamiento suave
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// Funcionalidad de búsqueda
// ========================================

const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = this.value.trim();
            
            if (searchTerm) {
                sessionStorage.setItem('boostWellLastSearch', searchTerm);
                showNotification(`Buscando: ${searchTerm}`);
                // Aquí se implementaría la funcionalidad de búsqueda real
                // Por ahora, redirigir a página de productos
                setTimeout(() => {
                    window.location.href = 'productos.html';
                }, 1000);
            }
        }
    });
}

// ========================================
// Carga diferida de imágenes
// ========================================

const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// ========================================
// Animación al hacer scroll
// ========================================

const animateOnScroll = () => {
    const elements = document.querySelectorAll('.product-card, .product-card-simple');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
};

// ========================================
// Resumen del carrito
// ========================================

function updateCartSummary() {
    const cartTotalElement = document.getElementById('cartTotal');
    const subtotalElement = document.getElementById('cartSubtotal');
    const subtotal = calculateSubtotal();

    if (cartTotalElement) {
        cartTotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }

    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
}
// ========================================
// Catalogo dinamico con AJAX + JSON
// ========================================

function renderProductCard(product) {
    const safeName = escapeHTML(product.nombre);
    const safeImage = escapeHTML(product.imagen);
    const safeCategory = escapeHTML(product.categoria);
    const benefits = Array.isArray(product.beneficios) ? product.beneficios.slice(0, 3) : [];
    
    return `
        <div class="col-lg-4 col-md-6">
            <div class="product-card-simple enhanced-product-card">
                <div class="product-image-simple">
                    <img src="${safeImage}" alt="${safeName}" loading="lazy">
                    <span class="product-badge">${safeCategory}</span>
                </div>
                <div class="product-info-simple">
                    <p class="product-category">${safeCategory}</p>
                    <h4 class="product-name-simple">${safeName}</h4>
                    <ul class="product-benefits">
                        ${benefits.map(benefit => `<li>${escapeHTML(benefit)}</li>`).join('')}
                    </ul>
                    <h3 class="product-price-simple">$${Number(product.precio).toFixed(2)}</h3>
                    <button class="btn btn-secondary-custom" onclick="addToCart('${safeName}', ${Number(product.precio).toFixed(2)}, '${safeImage}')">
                        <i class="bi bi-cart-plus"></i> Comprar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function loadCatalogData() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const request = new XMLHttpRequest();
    request.open('GET', 'data/productos.json', true);
    request.onreadystatechange = function() {
        if (request.readyState !== 4) return;
        
        if (request.status === 200 || request.status === 0) {
            try {
                const products = JSON.parse(request.responseText);
                sessionStorage.setItem('boostWellCatalogCount', String(products.length));
                grid.innerHTML = products.map(renderProductCard).join('');
                animateOnScroll();
            } catch (error) {
                console.warn('No se pudo interpretar el catalogo JSON', error);
            }
        }
    };
    request.send();
}

// ========================================
// Alternar menú móvil
// ========================================

const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.querySelector('.navbar-collapse');

if (navbarToggler) {
    navbarToggler.addEventListener('click', function() {
        setTimeout(() => {
            if (navbarCollapse.classList.contains('show')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }, 100);
    });
}

// ========================================
// Inicializar al cargar la página
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Actualizar contador de carrito en todas las páginas
    updateCartCount();
    
    // Mostrar items del carrito si está en página de carrito
    if (document.getElementById('cartItems')) {
        displayCartItems();
    }
    
    // Mostrar resumen de pedido si está en página de checkout
    if (document.getElementById('orderSummary')) {
        displayOrderSummary();
    }
    
    // Cargar catalogo desde JSON local mediante AJAX si existe la grilla
    loadCatalogData();
    
    // Inicializar animaciones
    animateOnScroll();
    
    // Mensaje de bienvenida en consola
    console.log('%c🌱 BOOST WELL NUTRITION', 'color: #7d9670; font-size: 24px; font-weight: bold;');
    console.log('%c¡Bienvenido a tu tienda de salud! 🥤', 'color: #3d4f3d; font-size: 14px;');
});

// ========================================
// Eventos al cargar la ventana
// ========================================

window.addEventListener('load', function() {
    // Agregar animación fade-in al body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Registrar tiempo de carga de página
    const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                     window.performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
});

// ========================================
// Botón de scroll hacia arriba (Opcional)
// ========================================

const createScrollTopButton = () => {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #7d9670, #3d4f3d);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'translateY(-5px)';
        scrollBtn.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'translateY(0)';
        scrollBtn.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    });
};

// Inicializar botón de scroll hacia arriba
createScrollTopButton();

// ========================================
// Prevenir reenvío de formularios
// ========================================

if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// ========================================
// Easter Egg (Opcional)
// ========================================

let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            showNotification('🎉 ¡Código secreto activado! ¡Disfruta de un 50% de descuento!');
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});



