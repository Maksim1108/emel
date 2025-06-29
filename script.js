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
        headerOffset: 60,
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
            this.initializeNavigation();
            this.initializeSlider();
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
        // Создаем Intersection Observer для анимаций
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Специальная логика для секции about
                    if (entry.target.classList.contains('about')) {
                        this.animateAboutSection(entry.target);
                    }
                    
                    // Специальная логика для секции composition (таблица минералов)
                    if (entry.target.classList.contains('composition')) {
                        this.animateCompositionTable(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        // Наблюдаем за секциями с анимациями
        const animatedSections = document.querySelectorAll('.about, .source, .journey, .composition, .gallery, .quality');
        animatedSections.forEach(section => {
            animationObserver.observe(section);
        });

        // Сохраняем observer для очистки
        this.observers.set('animation', animationObserver);
        
        // Инициализируем таймлайн
        this.initializeTimeline();
    }

    // Специальная анимация для секции about
    animateAboutSection(section) {
        const elements = [
            section.querySelector('.section-header'),
            section.querySelector('.about-image-new'),
            section.querySelector('.about-text-new'),
            section.querySelector('.well-info'),
            section.querySelector('.health-slogan'),
            section.querySelector('.medical-recommendations')
        ];

        // Добавляем класс animate с задержкой для каждого элемента
        elements.forEach((element, index) => {
            if (element) {
                setTimeout(() => {
                    element.classList.add('animate');
                }, index * 200); // 200ms задержка между элементами
            }
        });

        // Анимация для feature items если они есть
        const featureItems = section.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, 1000 + (index * 150)); // Начинаем после основных элементов
        });
    }

    // Специальная анимация для таблицы минерального состава
    animateCompositionTable(section) {
        const table = section.querySelector('.mineral-table');
        if (!table) return;

        // Анимация заголовка таблицы
        const thead = table.querySelector('thead tr');
        if (thead) {
            setTimeout(() => {
                thead.classList.add('animate');
            }, 300);
        }

        // Анимация строк таблицы
        const tbodyRows = table.querySelectorAll('tbody tr');
        tbodyRows.forEach((row, index) => {
            setTimeout(() => {
                row.classList.add('animate');
            }, 500 + (index * 150)); // Начинаем после заголовка с задержкой для каждой строки
        });
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

    // Инициализация навигации
    initializeNavigation() {
        // Плавная прокрутка по якорным ссылкам
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

        // Обработка изменения шапки при скролле
        const header = document.querySelector('.main-header');
        if (header) {
            const handleScroll = Utils.debounce(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }, 10);

            window.addEventListener('scroll', handleScroll);
            
            // Проверяем начальное состояние
            handleScroll();
        }
    }

    // Инициализация слайдера
    initializeSlider() {
        const slider = document.querySelector('.slider');
        const slideWrapper = document.querySelector('.slide-wrapper');
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevArrow = document.querySelector('.slider-arrow-prev');
        const nextArrow = document.querySelector('.slider-arrow-next');
        
        if (!slider || slides.length === 0) return;

        // Массив всех изображений
        const images = [
            './assets/slider/1.PNG',
            './assets/slider/2.PNG',
            './assets/slider/3.PNG',
            './assets/slider/4.PNG',
            './assets/slider/5.PNG',
            './assets/slider/6.PNG'
        ];

        // Массив подписей для каждого слайда
        const captions = [
            {
                title: { ru: 'Современное производство', ky: 'Заманбаp өндүрүү' },
                description: { ru: 'Высокие стандарты качества', ky: 'Жогорку сапат стандарттары' }
            },
            {
                title: { ru: 'Контроль качества', ky: 'Сапаттыn көзөmөлү' },
                description: { ru: 'Строгий надзор на каждом этапе', ky: 'Ар бир этапта катуu көзөmөл' }
            },
            {
                title: { ru: 'Природный источник', ky: 'Табигый булаk' },
                description: { ru: 'Чистая вода из глубин гор', ky: 'Тоолордуn тереңинен таза суu' }
            },
            {
                title: { ru: 'Автоматизация', ky: 'Автоматташтыруу' },
                description: { ru: 'Современные технологии розлива', ky: 'Заманбаp сатуu технологиялары' }
            },
            {
                title: { ru: 'Лабораторные испытания', ky: 'Лабораториялыk сыноолор' },
                description: { ru: 'Регулярные проверки качества', ky: 'Сапаттыn үзгүлтүксүз текшерүүлөрү' }
            },
            {
                title: { ru: 'Экологичность', ky: 'Экологиялыkтыk' },
                description: { ru: 'Забота об окружающей среде', ky: 'Чөйрөнү коргоо' }
            }
        ];

        let currentIndex = 0;
        let isAnimating = false;

        // Функция для анимированного обновления слайдов
        const updateSlides = (direction = 'next') => {
            if (isAnimating) return;
            isAnimating = true;

            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            const nextIndex = (currentIndex + 1) % images.length;

            // Добавляем классы анимации
            if (direction === 'next') {
                slides[0].classList.add('sliding-left'); // prev уходит влево
                slides[1].classList.add('sliding-left'); // active уходит влево
                slides[2].classList.add('sliding-right'); // next уходит вправо
            } else {
                slides[0].classList.add('sliding-right'); // prev уходит вправо
                slides[1].classList.add('sliding-right'); // active уходит вправо
                slides[2].classList.add('sliding-left'); // next уходит влево
            }

            // Ждем завершения анимации
            setTimeout(() => {
                // Обновляем изображения
                slides[0].querySelector('img').src = images[prevIndex];
                slides[1].querySelector('img').src = images[currentIndex];
                slides[2].querySelector('img').src = images[nextIndex];

                // Обновляем alt атрибуты
                slides[0].querySelector('img').alt = `Эмел Суу - Производство ${prevIndex + 1}`;
                slides[1].querySelector('img').alt = `Эмел Суу - Производство ${currentIndex + 1}`;
                slides[2].querySelector('img').alt = `Эмел Суу - Производство ${nextIndex + 1}`;

                // Обновляем подписи
                const currentLanguage = Utils.getCurrentLanguage();
                
                // Предыдущий слайд
                const prevCaption = slides[0].querySelector('.slide-caption');
                if (prevCaption) {
                    prevCaption.querySelector('h3').textContent = captions[prevIndex].title[currentLanguage];
                    prevCaption.querySelector('p').textContent = captions[prevIndex].description[currentLanguage];
                }

                // Активный слайд
                const activeCaption = slides[1].querySelector('.slide-caption');
                if (activeCaption) {
                    activeCaption.querySelector('h3').textContent = captions[currentIndex].title[currentLanguage];
                    activeCaption.querySelector('p').textContent = captions[currentIndex].description[currentLanguage];
                }

                // Следующий слайд
                const nextCaption = slides[2].querySelector('.slide-caption');
                if (nextCaption) {
                    nextCaption.querySelector('h3').textContent = captions[nextIndex].title[currentLanguage];
                    nextCaption.querySelector('p').textContent = captions[nextIndex].description[currentLanguage];
                }

                // Убираем классы анимации
                slides.forEach(slide => {
                    slide.classList.remove('sliding-left', 'sliding-right');
                });

                // Обновляем точки (только для отображения текущего слайда)
                dots.forEach(dot => dot.classList.remove('active'));
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });

                isAnimating = false;
            }, 300); // Половина времени transition для плавности
        };

        // Функция для перехода к следующему слайду
        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateSlides('next');
        };

        // Функция для перехода к предыдущему слайду
        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateSlides('prev');
        };

        // Обработчики событий для стрелок
        if (prevArrow) {
            prevArrow.addEventListener('click', () => {
                prevSlide();
            });
        }

        if (nextArrow) {
            nextArrow.addEventListener('click', () => {
                nextSlide();
            });
        }

        // Инициализируем первый слайд
        updateSlides();
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