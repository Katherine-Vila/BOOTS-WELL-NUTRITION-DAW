/* ========================================
   BOOST WELL NUTRITION - jQuery Enhancements
   Mejoras de interfaz y UX usando jQuery
   ======================================== */

$(document).ready(function () {

    // ========================================
    // 1. Animaciones al hacer scroll (Scroll Reveal)
    //    Usa selectores de jQuery y filtros
    // ========================================
    
    // Seleccionar elementos que se animarán al ser visibles
    var $animatedElements = $('.product-card, .benefit-card, .product-card-simple, .register-benefit-card, .about-text-card, .contact-info-box');
    
    // Ocultar elementos inicialmente
    $animatedElements.css({ opacity: 0, transform: 'translateY(30px)' });

    // Función para animar elementos visibles en viewport
    function animateOnScroll() {
        $animatedElements.each(function () {
            var $el = $(this);
            var windowHeight = $(window).height();
            var elementTop = $el.offset().top;
            var scrollTop = $(window).scrollTop();

            // Filtro: solo animar si el elemento es visible y aún no fue animado
            if (elementTop < scrollTop + windowHeight - 80 && !$el.hasClass('animated')) {
                $el.addClass('animated').animate(
                    { opacity: 1 },
                    600,
                    function () {
                        $(this).css('transform', 'translateY(0)');
                    }
                );
            }
        });
    }

    // Ejecutar al cargar y al hacer scroll
    $(window).on('scroll', animateOnScroll);
    animateOnScroll();

    // ========================================
    // 2. Validación interactiva de formularios
    //    Usa selectores de atributos y eventos jQuery
    // ========================================

    // Seleccionar todos los inputs de formularios de registro y contacto
    // Uso de selectores avanzados: formularios específicos + tipos de input
    var $formInputs = $('.registration-form input, .contact-form input, .contact-form textarea');

    // Evento de validación en tiempo real con jQuery
    $formInputs.on('input', function () {
        var $input = $(this);
        var value = $.trim($input.val());

        // Remover clases previas
        $input.removeClass('is-valid is-invalid');

        if (value.length === 0) {
            return; // No validar si está vacío
        }

        // Validación específica según el tipo de input
        var type = $input.attr('type');
        var isValid = false;

        switch (type) {
            case 'email':
                // Validar formato de correo electrónico
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
                break;
            case 'password':
                // Validar mínimo 8 caracteres
                isValid = value.length >= 8;
                break;
            case 'tel':
                // Validar teléfono salvadoreño
                isValid = /^(\+503\s?)?[267][0-9]{3}[-\s]?[0-9]{4}$/.test(value);
                break;
            default:
                // Para campos de texto: al menos 2 caracteres
                isValid = value.length >= 2;
                break;
        }

        // Agregar clase visual de validación
        $input.addClass(isValid ? 'is-valid' : 'is-invalid');
    });

    // ========================================
    // 3. Efectos hover mejorados en tarjetas de productos
    //    Usa .hover(), .find(), .css() de jQuery
    // ========================================

    // Filtro :has para tarjetas que tienen imagen
    $('.product-card, .product-card-simple').hover(
        // mouseenter
        function () {
            $(this).find('img').css({
                'transform': 'scale(1.08)',
                'transition': 'transform 0.4s ease'
            });
            $(this).find('.product-name, .product-name-simple')
                .css('color', '#3d4f3d');
        },
        // mouseleave
        function () {
            $(this).find('img').css('transform', 'scale(1)');
            $(this).find('.product-name, .product-name-simple')
                .css('color', '');
        }
    );

    // ========================================
    // 4. Smooth Scroll para enlaces internos
    //    Usa selectores de filtro jQuery: [href^="#"]
    // ========================================

    $('a[href^="#"]').not('[data-bs-toggle]').on('click', function (e) {
        var target = $(this).attr('href');
        if (target && target !== '#' && $(target).length) {
            e.preventDefault();
            $('html, body').animate(
                { scrollTop: $(target).offset().top - 80 },
                600,
                'swing'
            );
        }
    });

    // ========================================
    // 5. Contador animado para estadísticas
    //    Usa .each() y .animate() de jQuery
    // ========================================

    var counterAnimated = false;
    var $counters = $('.stat-number');

    function animateCounters() {
        if (counterAnimated || $counters.length === 0) return;

        var windowHeight = $(window).height();
        var scrollTop = $(window).scrollTop();
        
        $counters.each(function () {
            var $counter = $(this);
            var elementTop = $counter.offset().top;

            if (elementTop < scrollTop + windowHeight - 50 && !counterAnimated) {
                counterAnimated = true;
                var target = parseInt($counter.text().replace(/\D/g, ''), 10);
                
                if (!isNaN(target) && target > 0) {
                    $({ count: 0 }).animate(
                        { count: target },
                        {
                            duration: 1500,
                            step: function () {
                                $counter.text(Math.floor(this.count));
                            },
                            complete: function () {
                                $counter.text(target);
                            }
                        }
                    );
                }
            }
        });
    }

    $(window).on('scroll', animateCounters);
    animateCounters();

    // ========================================
    // 6. Tooltip y efectos en botones
    //    Usa .addClass(), .removeClass(), filtros jQuery
    // ========================================

    // Efecto ripple al hacer clic en botones
    $('.btn-primary-custom, .btn-secondary-custom').on('click', function (e) {
        var $btn = $(this);
        
        // Remover ripple anterior si existe
        $btn.find('.jquery-ripple').remove();

        // Crear efecto ripple con jQuery
        var $ripple = $('<span class="jquery-ripple"></span>');
        var btnOffset = $btn.offset();
        var rippleX = e.pageX - btnOffset.left;
        var rippleY = e.pageY - btnOffset.top;

        $ripple.css({
            left: rippleX + 'px',
            top: rippleY + 'px'
        });

        $btn.css('position', 'relative').css('overflow', 'hidden').append($ripple);

        // Remover después de la animación
        setTimeout(function () {
            $ripple.remove();
        }, 700);
    });

    // ========================================
    // 7. Navbar: cambio de estilo al hacer scroll
    //    Usa .scrollTop(), .toggleClass() de jQuery
    // ========================================

    $(window).on('scroll', function () {
        var $navbar = $('.navbar');
        if ($(this).scrollTop() > 100) {
            $navbar.addClass('navbar-scrolled');
        } else {
            $navbar.removeClass('navbar-scrolled');
        }
    });

    // ========================================
    // 8. Búsqueda en tiempo real con jQuery
    //    Usa selectores, filtros :contains y manipulación DOM
    // ========================================

    var $searchInput = $('.search-box input');
    
    $searchInput.on('keyup', function () {
        var searchTerm = $.trim($(this).val()).toLowerCase();
        
        // Solo filtrar si hay tarjetas de productos en la página actual
        var $products = $('.product-card-simple, .product-card');
        
        if ($products.length > 0 && searchTerm.length >= 2) {
            $products.each(function () {
                var $card = $(this).closest('.col-md-4, .col-lg-4, .col-md-6');
                var productName = $(this).find('.product-name, .product-name-simple').text().toLowerCase();
                
                if (productName.indexOf(searchTerm) !== -1) {
                    $card.fadeIn(300);
                } else {
                    $card.fadeOut(300);
                }
            });
        } else if (searchTerm.length === 0) {
            // Mostrar todos si se borra la búsqueda
            $products.closest('.col-md-4, .col-lg-4, .col-md-6').fadeIn(300);
        }
    });

    // ========================================
    // 9. AJAX con jQuery - Cargar datos dinámicos
    //    Usa $.getJSON() como alternativa a XMLHttpRequest
    // ========================================

    // Si estamos en la página de productos, cargar datos con jQuery AJAX
    var $catalogContainer = $('#catalogProducts');
    if ($catalogContainer.length > 0) {
        $.getJSON('data/productos.json')
            .done(function (data) {
                console.log('jQuery AJAX: Catálogo cargado exitosamente.', data.length + ' productos.');
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log('jQuery AJAX: Error al cargar catálogo -', textStatus);
            });
    }

    // ========================================
    // 10. CSS dinámico para efectos ripple
    // ========================================

    $('<style>')
        .text(
            '.jquery-ripple {' +
                'position: absolute;' +
                'border-radius: 50%;' +
                'background: rgba(255,255,255,0.4);' +
                'width: 0; height: 0;' +
                'animation: jqRipple 0.7s ease-out;' +
                'pointer-events: none;' +
            '}' +
            '@keyframes jqRipple {' +
                'to { width: 300px; height: 300px; margin-left: -150px; margin-top: -150px; opacity: 0; }' +
            '}' +
            '.navbar-scrolled {' +
                'box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;' +
                'padding: 0.5rem 0 !important;' +
            '}'
        )
        .appendTo('head');

    // Log para confirmar que jQuery está activo
    console.log('jQuery ' + $.fn.jquery + ' - BOOST WELL NUTRITION cargado correctamente.');

});
