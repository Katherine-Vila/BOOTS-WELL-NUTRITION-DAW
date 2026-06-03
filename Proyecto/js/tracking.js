// ========================================
// BOOST WELL NUTRITION - Sistema de seguimiento
// ========================================

// Base de datos de pedidos de prueba (En producción esto vendría de un backend)
const mockOrders = {
    'BWN20251023001': {
        orderNumber: 'BWN20251023001',
        orderDate: '23 de Octubre, 2025 - 10:30 AM',
        status: 'delivered',
        customer: {
            name: 'María González',
            phone: '+503 7908 1234',
            address: 'Col. La Sultana, Calle Principal #123, Antiguo Cuscatlán'
        },
        items: [
            { name: 'Bebida Energizante', quantity: 2, price: 4.00, image: 'img/Bebida Energizante.jpeg' },
            { name: 'Wafles Proteicos', quantity: 1, price: 3.75, image: 'img/Wafles.jpeg' }
        ],
        total: 11.75,
        timeline: {
            received: 'Hace 45 min - 10:30 AM',
            preparing: 'Hace 35 min - 10:40 AM',
            shipping: 'Hace 20 min - 10:55 AM',
            delivered: 'Hace 5 min - 11:10 AM'
        }
    },
    'BWN20251023002': {
        orderNumber: 'BWN20251023002',
        orderDate: '23 de Octubre, 2025 - 2:15 PM',
        status: 'shipping',
        customer: {
            name: 'Carlos Ramírez',
            phone: '+503 7908 5678',
            address: 'Residencial Los Robles, Casa #45, Santa Tecla'
        },
        items: [
            { name: 'Tartaletas', quantity: 3, price: 3.50, image: 'img/Mini Tartas Proteicas.jpeg' },
            { name: 'Berry Bloom Latte', quantity: 1, price: 4.00, image: 'img/Berry Bloom Latte.jpg' }
        ],
        total: 14.50,
        timeline: {
            received: 'Hace 30 min - 2:15 PM',
            preparing: 'Hace 20 min - 2:25 PM',
            shipping: 'Hace 5 min - 2:40 PM (Llegará en 10-15 min)',
            delivered: null
        }
    },
    'BWN20251023003': {
        orderNumber: 'BWN20251023003',
        orderDate: '23 de Octubre, 2025 - 4:00 PM',
        status: 'preparing',
        customer: {
            name: 'Ana Martínez',
            phone: '+503 7908 9012',
            address: 'Av. Las Magnolias, Edif. Torre Verde #302, San Salvador'
        },
        items: [
            { name: 'Shake Proteico', quantity: 1, price: 4.50, image: 'img/Shake Proteico.jpeg' },
            { name: 'Cheesecake de Fresa', quantity: 2, price: 3.00, image: 'img/Cheescake.jpg' }
        ],
        total: 10.50,
        timeline: {
            received: 'Hace 15 min - 4:00 PM',
            preparing: 'Hace 5 min - 4:10 PM (Listo en 10-15 min)',
            shipping: null,
            delivered: null
        }
    }
};

// ========================================
// Funcionalidad de seguimiento de pedidos
// ========================================

const trackingForm = document.getElementById('trackingForm');
if (trackingForm) {
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const orderNumber = document.getElementById('orderNumber').value.trim().toUpperCase();
        trackOrder(orderNumber);
    });
    
    // Si hay un pedido reciente, autocompletar el campo
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    const orderInput = document.getElementById('orderNumber');
    
    if (lastOrder && orderInput) {
        // Mostrar sugerencia
        const suggestionHTML = `
            <div class="alert alert-info mt-3" id="orderSuggestion">
                <i class="bi bi-info-circle"></i> 
                Tienes un pedido reciente: 
                <strong>${lastOrder.orderNumber}</strong>
                <button class="btn btn-sm btn-primary-custom ms-2" onclick="loadLastOrder()">
                    Ver mi pedido
                </button>
            </div>
        `;
        trackingForm.insertAdjacentHTML('afterend', suggestionHTML);
    }
}

function trackOrder(orderNumber) {
    if (!/^BWN\d{11}$/.test(orderNumber)) {
        showNotification('Formato invalido. Usa un numero como BWN20251023001.', 'error');
        return;
    }
    
    // Primero buscar en pedidos reales (localStorage)
    let order = null;
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (lastOrder && lastOrder.orderNumber === orderNumber) {
        order = {
            orderNumber: lastOrder.orderNumber,
            orderDate: lastOrder.date,
            status: lastOrder.status || 'preparing',
            customer: {
                name: lastOrder.customer?.name || 'Cliente',
                phone: lastOrder.customer?.phone || '+503 7475-3562',
                address: lastOrder.customer?.address || 'Dirección de entrega'
            },
            items: lastOrder.items,
            total: lastOrder.total,
            timeline: {
                received: 'Hace unos minutos',
                preparing: 'En proceso',
                shipping: null,
                delivered: null
            }
        };
    } else {
        // Si no está en localStorage, buscar en mockOrders (pedidos demo)
        order = mockOrders[orderNumber];
    }
    
    if (!order) {
        showNotification('Pedido no encontrado. Verifica el número e intenta nuevamente.', 'error');
        return;
    }
    
    // Guardar pedido actual para generar factura
    saveCurrentOrder(order);
    
    // Mostrar la tarjeta de estado
    const orderStatus = document.getElementById('orderStatus');
    orderStatus.style.display = 'block';
    
    // Scroll suave hacia el resultado
    orderStatus.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Actualizar información básica
    document.getElementById('displayOrderNumber').textContent = order.orderNumber;
    document.getElementById('orderDate').textContent = order.orderDate;
    
    // Actualizar badge de estado
    updateStatusBadge(order.status);
    
    // Actualizar progreso
    updateProgressTracker(order.status, order.timeline);
    
    // Actualizar detalles del cliente
    document.getElementById('customerName').textContent = order.customer.name;
    document.getElementById('customerPhone').textContent = order.customer.phone;
    
    // Actualizar dirección con enlace a Google Maps
    const addressElement = document.getElementById('deliveryAddress');
    addressElement.textContent = order.customer.address;
    
    // Crear enlace a Google Maps
    const mapsLink = document.createElement('a');
    mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;
    mapsLink.target = '_blank';
    mapsLink.className = 'btn btn-sm btn-outline-primary mt-2';
    mapsLink.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Ver en Google Maps';
    
    addressElement.appendChild(document.createElement('br'));
    addressElement.appendChild(mapsLink);
    
    // Actualizar lista de productos
    displayOrderItems(order.items);
    
    // Actualizar total
    document.getElementById('orderTotal').textContent = `$${order.total.toFixed(2)}`;
    
    showNotification('¡Pedido encontrado!', 'success');
}

function updateStatusBadge(status) {
    const badge = document.getElementById('orderStatusBadge');
    let text;
    let statusClass;

    // Determinar texto y clase según el estado del pedido
    switch (status) {
        case 'received':
            text = 'Recibido';
            statusClass = 'status-received';
            break;
        case 'preparing':
            text = 'En Preparación';
            statusClass = 'status-preparing';
            break;
        case 'shipping':
            text = 'En Camino';
            statusClass = 'status-shipping';
            break;
        case 'delivered':
            text = 'Entregado';
            statusClass = 'status-delivered';
            break;
        default:
            text = 'Desconocido';
            statusClass = 'status-received';
            break;
    }

    badge.textContent = text;
    badge.className = `order-status-badge ${statusClass}`;
}

function updateProgressTracker(status, timeline) {
    const steps = ['received', 'preparing', 'shipping', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    steps.forEach((step, index) => {
        const stepElement = document.getElementById(`step${index + 1}`);
        const lineElement = document.getElementById(`line${index + 1}`);
        const timeElement = document.getElementById(`step${index + 1}Time`);
        
        if (index <= currentIndex) {
            stepElement.classList.add('completed');
            if (index < currentIndex && lineElement) {
                lineElement.classList.add('completed');
            }
            
            // Mostrar tiempo si está disponible
            const timeValue = timeline[step];
            if (timeValue) {
                timeElement.textContent = timeValue;
            }
        } else {
            stepElement.classList.remove('completed');
            if (lineElement) {
                lineElement.classList.remove('completed');
            }
            timeElement.textContent = 'Pendiente';
        }
    });
}

function displayOrderItems(items) {
    const container = document.getElementById('orderItemsList');
    
    container.innerHTML = items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-details">
                <h5>${item.name}</h5>
                <p>Cantidad: ${item.quantity} × $${item.price.toFixed(2)}</p>
            </div>
            <div class="order-item-total">
                <strong>$${(item.quantity * item.price).toFixed(2)}</strong>
            </div>
        </div>
    `).join('');
}

function shareOrder() {
    const orderNumber = document.getElementById('displayOrderNumber').textContent;
    const text = `Mi pedido ${orderNumber} de BOOST WELL NUTRITION está en camino! 🌱`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Pedido BOOST WELL NUTRITION',
            text: text,
            url: window.location.href
        }).then(() => {
            showNotification('¡Compartido exitosamente!', 'success');
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Enlace copiado al portapapeles', 'success');
    }).catch(() => {
        showNotification('No se pudo copiar', 'error');
    });
}

// ========================================
// Funcionalidad del formulario de reclamaciones
// ========================================

const claimsForm = document.getElementById('claimsForm');
if (claimsForm) {
    claimsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitClaim();
    });
}

function submitClaim() {
    const formData = {
        problemType: document.getElementById('problemType').value,
        orderNumber: document.getElementById('claimOrderNumber').value,
        name: document.getElementById('claimName').value,
        email: document.getElementById('claimEmail').value,
        phone: document.getElementById('claimPhone').value,
        description: document.getElementById('claimDescription').value,
        solution: document.getElementById('desiredSolution').value
    };
    
    // Simular envío (en producción iría a un backend)
    console.log('Reclamación enviada:', formData);
    
    // Generar número de ticket
    const ticketNumber = 'REC' + Date.now();
    
    // Mostrar mensaje de éxito
    showSuccessMessage(ticketNumber);
    
    // Limpiar formulario
    document.getElementById('claimsForm').reset();
}

function showSuccessMessage(ticketNumber) {
    const message = `
        <div class="success-message-card">
            <div class="success-icon">
                <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>¡Reclamación Recibida!</h3>
            <p>Tu reclamación ha sido registrada exitosamente.</p>
            <div class="ticket-number">
                <strong>Número de Ticket:</strong>
                <span class="ticket-badge">${ticketNumber}</span>
            </div>
            <p class="success-note">
                Te contactaremos en menos de 24 horas para dar seguimiento a tu caso.
                Guarda tu número de ticket para futuras referencias.
            </p>
            <button class="btn btn-primary-custom" onclick="window.location.reload()">
                Realizar Otra Reclamación
            </button>
        </div>
    `;
    
    const formCard = document.querySelector('.claims-form-card');
    formCard.innerHTML = message;
    
    // Scroll al mensaje
    formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    showNotification('¡Reclamación enviada con éxito!', 'success');
}

// ========================================
// Autocompletar número de pedido desde URL
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    if (orderNumber) {
        const orderInput = document.getElementById('orderNumber');
        if (orderInput) {
            orderInput.value = orderNumber;
            // Auto-enviar si viene de otra página
            setTimeout(() => {
                trackOrder(orderNumber.toUpperCase());
            }, 500);
        }
        
        const claimOrderInput = document.getElementById('claimOrderNumber');
        if (claimOrderInput) {
            claimOrderInput.value = orderNumber;
        }
    }
});

// Cargar el último pedido automáticamente
function loadLastOrder() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    if (lastOrder) {
    const orderInput = document.getElementById('orderNumber');
    if (orderInput) {
            orderInput.value = lastOrder.orderNumber;
            trackOrder(lastOrder.orderNumber);
            
            // Remover sugerencia
            const suggestion = document.getElementById('orderSuggestion');
            if (suggestion) {
                suggestion.remove();
            }
        }
    }
}

// ========================================
// Generar factura en PDF con QR
// ========================================

let currentOrderData = null; // Variable global para guardar el pedido actual

// Actualizar cuando se muestra un pedido
function saveCurrentOrder(order) {
    currentOrderData = order;
}

function downloadInvoice() {
    if (!currentOrderData) {
        showNotification('No hay pedido para generar factura', 'error');
        return;
    }

    generateBoostWellInvoice(currentOrderData);
    showNotification('Factura descargada exitosamente', 'success');
}
console.log('🚀 Sistema de seguimiento BOOST WELL NUTRITION cargado');

