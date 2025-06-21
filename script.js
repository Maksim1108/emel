// Конфигурация приложения
const CONFIG = {
    formValidation: {
        phonePattern: /^[\+]?[0-9]{10,15}$/,
        emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        minQuantity: 1,
        maxQuantity: 100
    },
    animation: {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    },
    prices: {
        '0.5': 50,
        '1': 80,
        '1.5': 100
    },
    language: {
        default: 'ru',
        storageKey: 'language'
    },
    ui: {
        debounceDelay: 300,
        messageTimeout: 5000,
        headerOffset: 80,
        parallaxSpeed: 0.1
    },
    api: {
        baseUrl: '/api',
        endpoints: {
            orders: '/orders',
            health: '/health',
            prices: '/prices'
        }
    }
};

// Локализация
const MESSAGES = {
    ru: {
        required: 'Это поле обязательно для заполнения',
        email: 'Пожалуйста, введите корректный email',
        phone: 'Введите номер телефона (10-15 цифр)',
        quantity: 'Количество должно быть от 1 до 100',
        formError: 'Пожалуйста, исправьте ошибки в форме',
        orderSuccess: 'Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.',
        orderError: 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.',
        initError: 'Произошла ошибка при загрузке страницы. Пожалуйста, обновите страницу.',
        sending: 'Отправка...',
        submitButton: 'Оформить заказ'
    },
    ky: {
        required: 'Бул талаа толтуруу зарыл',
        email: 'Туура email дарегин киргизиңиз',
        phone: 'Телефон номерин киргизиңиз (10-15 сан)',
        quantity: 'Саны 1ден 100гө чейин болуш керек',
        formError: 'Формадагы каталарды оңдоңуз',
        orderSuccess: 'Заказ ийгиликтүү берилди! Биз сиз менен жакында байланышабыз.',
        orderError: 'Форманы жөнөтүүдө ката болду. Кийинчерээк аракет кылыңыз.',
        initError: 'Баракты жүктөөдө ката болду. Баракты жаңыртыңыз.',
        sending: 'Жөнөтүлүүдө...',
        submitButton: 'Заказ берүү'
    }
};

// Утилиты
const Utils = {
    // Дебаунс функция
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Троттлинг функция
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Стандартная валидация номера телефона (только цифры и плюс)
    validatePhoneNumber(input) {
        const value = input.replace(/\D/g, ''); // Удаляем все нецифровые символы кроме +
        return value.length >= 10 && value.length <= 15;
    },

    // Очистка ввода от опасных символов
    sanitizeInput(input) {
        return input.replace(/[<>]/g, '').trim();
    },

    // Плавная прокрутка
    smoothScroll(element, offset = CONFIG.ui.headerOffset) {
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    // Получение текущего языка
    getCurrentLanguage() {
        return localStorage.getItem(CONFIG.language.storageKey) || CONFIG.language.default;
    },

    // Показ уведомлений
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

        // Добавляем стили если их нет
        if (!document.querySelector('#message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'message-styles';
            styles.textContent = `
                .message {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                .message-error { background-color: #e74c3c; }
                .message-success { background-color: #27ae60; }
                .message-info { background-color: #3498db; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), CONFIG.ui.messageTimeout);
    }
};

// Глобальные функции
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        Utils.smoothScroll(section);
    }
}

// Основной класс приложения
class App {
    constructor() {
        this.currentLanguage = Utils.getCurrentLanguage();
        this.observers = new Map();
        this.init();
    }

    // Инициализация приложения
    async init() {
        try {
            this.initializeLanguage();
            this.initializeMobileMenu();
            this.initializeFormValidation();
            this.initializeAnimations();
            this.initializeOrderForm();
            this.initializeScrollEffects();
            this.initializeNavigation();
        } catch (error) {
            console.error('Initialization error:', error);
            Utils.showMessage(MESSAGES[this.currentLanguage].initError, 'error');
        }
    }

    // Инициализация языка
    initializeLanguage() {
        const langButtons = document.querySelectorAll('.lang-btn');

        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setLanguage(btn.dataset.lang);
            });
        });

        this.setLanguage(this.currentLanguage);
    }

    // Установка языка
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem(CONFIG.language.storageKey, lang);

        // Обновляем текст элементов
        document.querySelectorAll('[data-ru]').forEach(element => {
            const text = element.dataset[lang];
            if (text) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
            }
        });

        // Обновляем активную кнопку языка
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    // Инициализация мобильного меню
    initializeMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.main-nav');

        if (!menuBtn || !nav) return;

        const toggleMenu = () => {
            const isActive = menuBtn.classList.toggle('active');
            nav.classList.toggle('active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        };

        const closeMenu = () => {
            menuBtn.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        };

        menuBtn.addEventListener('click', toggleMenu);

        // Закрытие меню при клике на ссылку
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // Инициализация валидации формы
    initializeFormValidation() {
        const form = document.querySelector('.order-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            // Валидация при вводе (с дебаунсом)
            input.addEventListener('input', Utils.debounce(() => {
                this.validateInput(input);
            }, CONFIG.ui.debounceDelay));

            // Для телефона разрешаем только цифры, плюс и пробелы
            if (input.type === 'tel') {
                input.addEventListener('input', (e) => {
                    // Разрешаем только цифры, плюс и пробелы
                    e.target.value = e.target.value.replace(/[^\d\+\s\-\(\)]/g, '');
                });
            }
        });

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Валидация поля
    validateInput(input) {
        const value = Utils.sanitizeInput(input.value);
        let isValid = true;
        let errorMessage = '';
        const messages = MESSAGES[this.currentLanguage];

        switch (input.type) {
            case 'email':
                isValid = CONFIG.formValidation.emailPattern.test(value);
                errorMessage = isValid ? '' : messages.email;
                break;
            case 'tel':
                const cleanPhone = value.replace(/\D/g, '');
                isValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;
                errorMessage = isValid ? '' : messages.phone;
                break;
            case 'number':
                const num = parseInt(value);
                isValid = num >= CONFIG.formValidation.minQuantity && num <= CONFIG.formValidation.maxQuantity;
                errorMessage = isValid ? '' : messages.quantity;
                break;
            default:
                isValid = value.length > 0;
                errorMessage = isValid ? '' : messages.required;
        }

        input.setCustomValidity(errorMessage);
        input.classList.toggle('invalid', !isValid);

        return isValid;
    }

    // Обработка отправки формы
    async handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const inputs = form.querySelectorAll('input, textarea');
        const submitButton = form.querySelector('.submit-button');
        const messages = MESSAGES[this.currentLanguage];

        // Валидация всех полей
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            Utils.showMessage(messages.formError, 'error');
            return;
        }

        try {
            // Блокируем кнопку
            submitButton.disabled = true;
            submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${messages.sending}`;

            // Получаем данные формы
            const formDataObj = Object.fromEntries(formData.entries());

            // Отправляем данные на сервер
            await this.sendToServer(formDataObj);

            Utils.showMessage(messages.orderSuccess, 'success');
            form.reset();
            this.updateOrderSummary();

        } catch (error) {
            Utils.showMessage(messages.orderError, 'error');
        } finally {
            // Разблокируем кнопку
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-shopping-cart"></i> ${messages.submitButton}`;
        }
    }

    // Отправка данных на сервер
    async sendToServer(data) {
        try {
            const response = await fetch(`${CONFIG.api.baseUrl}${CONFIG.api.endpoints.orders}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Server sending error:', error);
            throw error;
        }
    }

    // Инициализация анимаций
    initializeAnimations() {
        // Создаем один observer для всех анимаций
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, CONFIG.animation);

        // Наблюдаем за всеми анимируемыми элементами
        document.querySelectorAll('.animate-on-scroll, .animate-item, .animate-left, .animate-right').forEach(element => {
            observer.observe(element);
        });

        this.observers.set('general', observer);
        this.initializeTimeline();
    }

    // Инициализация таймлайна
    initializeTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item, .timeline-step, .journey-step');
        if (timelineItems.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Обновляем прогресс если есть
                    const step = entry.target.dataset.step;
                    if (step) {
                        this.updateTimelineProgress(parseInt(step));
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });

        timelineItems.forEach(item => observer.observe(item));
        this.observers.set('timeline', observer);
    }

    // Обновление прогресса таймлайна
    updateTimelineProgress(step) {
        const progress = document.querySelector('.timeline-progress');
        const dots = document.querySelectorAll('.dot');

        if (progress) {
            const progressPercent = ((step - 1) / (dots.length - 1)) * 100;
            progress.style.height = `${progressPercent}%`;
        }

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < step);
        });
    }

    // Инициализация формы заказа
    initializeOrderForm() {
        const quantityInput = document.querySelector('#quantity');
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        const productOptions = document.querySelectorAll('input[name="product"]');

        if (quantityInput) {
            // Кнопки изменения количества
            if (minusBtn) {
                minusBtn.addEventListener('click', () => {
                    this.changeQuantity(quantityInput, -1);
                });
            }

            if (plusBtn) {
                plusBtn.addEventListener('click', () => {
                    this.changeQuantity(quantityInput, 1);
                });
            }

            // Прямое изменение количества
            quantityInput.addEventListener('change', () => {
                this.validateQuantity(quantityInput);
                this.updateOrderSummary();
            });
        }

        // Изменение продукта
        productOptions.forEach(option => {
            option.addEventListener('change', () => this.updateOrderSummary());
        });

        // Первоначальное обновление
        this.updateOrderSummary();
    }

    // Изменение количества
    changeQuantity(input, delta) {
        const currentValue = parseInt(input.value) || CONFIG.formValidation.minQuantity;
        const newValue = Math.max(
            CONFIG.formValidation.minQuantity,
            Math.min(CONFIG.formValidation.maxQuantity, currentValue + delta)
        );

        input.value = newValue;
        this.updateOrderSummary();
    }

    // Валидация количества
    validateQuantity(input) {
        let value = parseInt(input.value);
        if (isNaN(value) || value < CONFIG.formValidation.minQuantity) {
            value = CONFIG.formValidation.minQuantity;
        } else if (value > CONFIG.formValidation.maxQuantity) {
            value = CONFIG.formValidation.maxQuantity;
        }
        input.value = value;
    }

    // Обновление сводки заказа
    updateOrderSummary() {
        const selectedProduct = document.querySelector('input[name="product"]:checked');
        const quantityInput = document.querySelector('#quantity');

        if (!selectedProduct || !quantityInput) return;

        const size = selectedProduct.value;
        const quantity = parseInt(quantityInput.value) || 1;
        const price = CONFIG.prices[size] || 0;
        const total = price * quantity;

        // Обновляем элементы сводки
        const summaryElements = {
            product: document.querySelector('#product-summary'),
            price: document.querySelector('#price-summary'),
            total: document.querySelector('#total-summary')
        };

        if (summaryElements.product) {
            summaryElements.product.textContent = `${size} л x ${quantity} шт.`;
        }
        if (summaryElements.price) {
            summaryElements.price.textContent = `${price} сом`;
        }
        if (summaryElements.total) {
            summaryElements.total.textContent = `${total} сом`;
        }
    }

    // Инициализация эффектов прокрутки
    initializeScrollEffects() {
        const bottle = document.querySelector('.bottle');

        if (bottle) {
            let lastScrollY = window.scrollY;

            const handleScroll = Utils.throttle(() => {
                const currentScrollY = window.scrollY;
                const scrollDiff = currentScrollY - lastScrollY;

                const currentTransform = bottle.style.transform || 'translateY(0px)';
                const currentY = parseFloat(currentTransform.match(/translateY\(([^)]+)px\)/) || [0, 0])[1];
                const newY = currentY + scrollDiff * CONFIG.ui.parallaxSpeed;

                bottle.style.transform = `translateY(${newY}px)`;
                lastScrollY = currentScrollY;
            }, 16); // 60fps

            window.addEventListener('scroll', handleScroll, {passive: true});
        }
    }

    // Инициализация навигации
    initializeNavigation() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);

                if (target) {
                    Utils.smoothScroll(target);
                }
            });
        });
    }

    // Очистка ресурсов
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});

// Экспорт для использования в других скриптах
window.App = App;
window.Utils = Utils;