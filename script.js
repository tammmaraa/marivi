document.addEventListener('DOMContentLoaded', () => {
    // ----- Popup de novedades -----
    const popup = document.getElementById('productsNewsPopup');

    function openPopup() {
        popup.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closePopup() {
        popup.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    if (popup) {
        document.querySelectorAll('.js-open-news').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPopup();
            });
        });

        document.querySelectorAll('.js-close-news').forEach((btn) => {
            btn.addEventListener('click', closePopup);
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });

        // Permite abrir el popup desde otras páginas con index.html#novedades
        if (window.location.hash === '#novedades') openPopup();
    }

    // ----- Chatbot -----
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    function toggleChatbot() {
        const isOpen = chatbotContainer.classList.toggle('is-open');
        chatbotToggleBtn.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        addMessage(userText, 'user');
        userInput.value = '';

        const respuestasCortesas = {
            'hola': '¡Hola! 😊 Soy tu asistente de Mariví. ¿En qué puedo ayudarte hoy?',
            'gracias': '¡De nada! Estoy aquí para ayudarte.',
            'adios': '¡Hasta pronto! 👋 Que tengas un gran día.'
        };

        const userTextClean = userText
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        if (respuestasCortesas[userTextClean]) {
            setTimeout(() => addMessage(respuestasCortesas[userTextClean], 'bot'), 500);
            return;
        }

        setTimeout(() => {
            addMessage('Gracias por tu mensaje. Por ahora puedo ayudarte con preguntas básicas o puedes consultar las secciones de la página.', 'bot');
        }, 1000);
    }

    if (chatbotContainer && chatbotToggleBtn) {
        chatbotToggleBtn.addEventListener('click', toggleChatbot);
        chatbotCloseBtn.addEventListener('click', toggleChatbot);
        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // ----- Formulario de contacto (abre el correo con el mensaje prellenado) -----
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = contactForm.elements['nombre'].value.trim();
            const correo = contactForm.elements['correo'].value.trim();
            const mensaje = contactForm.elements['mensaje'].value.trim();
            const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

            if (!nombre || !correoValido || !mensaje) {
                contactStatus.textContent = 'Por favor completa tu nombre, un correo válido y tu mensaje.';
                return;
            }

            const asunto = encodeURIComponent('Consulta desde Mariví - ' + nombre);
            const cuerpo = encodeURIComponent('Nombre: ' + nombre + '\nCorreo: ' + correo + '\n\n' + mensaje);
            window.location.href = 'mailto:contacto@marivi.co?subject=' + asunto + '&body=' + cuerpo;

            contactStatus.textContent = 'Se abrirá tu aplicación de correo con el mensaje listo para enviar. ¡Gracias por escribirnos!';
            contactForm.reset();
        });
    }

    // ----- Perfil: modo edición -----
    const editBtn = document.getElementById('edit-profile-btn');

    if (editBtn) {
        const editableItems = document.querySelectorAll('[data-editable]');
        const editLabel = editBtn.querySelector('span');
        const editIcon = editBtn.querySelector('i');
        let editing = false;

        editBtn.addEventListener('click', () => {
            editing = !editing;
            editableItems.forEach((item) => {
                item.contentEditable = editing ? 'true' : 'false';
                item.classList.toggle('is-editing', editing);
            });
            editLabel.textContent = editing ? 'Guardar cambios' : 'Editar perfil';
            editIcon.className = editing ? 'fas fa-check' : 'fas fa-pen';
        });
    }

    // ----- Banner de cookies y privacidad (localStorage) -----
    const COOKIE_KEY = 'marivi_cookies';
    let banner = null;

    function getPrefs() {
        try {
            return JSON.parse(localStorage.getItem(COOKIE_KEY));
        } catch (err) {
            return null;
        }
    }

    function savePrefs(prefs) {
        const data = {
            necessary: true,
            preferences: Boolean(prefs.preferences),
            analytics: Boolean(prefs.analytics),
            date: new Date().toISOString()
        };
        try {
            localStorage.setItem(COOKIE_KEY, JSON.stringify(data));
        } catch (err) {
            // Si el navegador bloquea localStorage, la preferencia solo aplica a esta visita.
        }
        hideBanner();
    }

    function hideBanner() {
        if (banner) {
            banner.remove();
            banner = null;
        }
    }

    function showBanner() {
        if (banner) return;

        const current = getPrefs() || {};
        banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Aviso de cookies y privacidad');
        banner.innerHTML =
            '<button type="button" class="cookie-close" aria-label="Cerrar y rechazar cookies opcionales">&times;</button>' +
            '<p class="cookie-text"><strong>Tu privacidad es importante.</strong> Usamos cookies necesarias para que el sitio funcione y, con tu permiso, otras para recordar tus preferencias y entender cómo se usa Mariví. Consulta nuestros <a href="#">Términos</a> y nuestra <a href="#">Política de Privacidad</a>.</p>' +
            '<div class="cookie-settings" hidden>' +
                '<label class="cookie-option"><input type="checkbox" checked disabled> <span><strong>Necesarias</strong> <small>Siempre activas</small></span></label>' +
                '<label class="cookie-option"><input type="checkbox" id="cookie-pref"' + (current.preferences ? ' checked' : '') + '> <span><strong>Preferencias</strong> <small>Recuerdan tus ajustes</small></span></label>' +
                '<label class="cookie-option"><input type="checkbox" id="cookie-analytics"' + (current.analytics ? ' checked' : '') + '> <span><strong>Analíticas</strong> <small>Nos ayudan a mejorar el sitio</small></span></label>' +
                '<div class="cookie-actions"><button type="button" class="btn btn-primary" data-cookie="save">Guardar preferencias</button></div>' +
            '</div>' +
            '<div class="cookie-actions">' +
                '<button type="button" class="btn btn-outline" data-cookie="settings">Configurar</button>' +
                '<button type="button" class="btn btn-primary" data-cookie="accept">Aceptar</button>' +
            '</div>';

        document.body.appendChild(banner);

        const settingsPanel = banner.querySelector('.cookie-settings');

        banner.querySelector('.cookie-close').addEventListener('click', () => {
            savePrefs({ preferences: false, analytics: false });
        });

        banner.querySelector('[data-cookie="settings"]').addEventListener('click', () => {
            settingsPanel.hidden = !settingsPanel.hidden;
        });

        banner.querySelector('[data-cookie="accept"]').addEventListener('click', () => {
            savePrefs({ preferences: true, analytics: true });
        });

        banner.querySelector('[data-cookie="save"]').addEventListener('click', () => {
            savePrefs({
                preferences: banner.querySelector('#cookie-pref').checked,
                analytics: banner.querySelector('#cookie-analytics').checked
            });
        });
    }

    if (!getPrefs()) showBanner();

    document.querySelectorAll('.js-open-cookies').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showBanner();
        });
    });

    // ----- Tecla Escape cierra popup y chatbot -----
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (popup && popup.classList.contains('is-open')) closePopup();
        if (chatbotContainer && chatbotContainer.classList.contains('is-open')) toggleChatbot();
    });
});
