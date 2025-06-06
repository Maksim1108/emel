// Конфигурация
const CONFIG = {
    formValidation: {
        phonePattern: /^\+996\s?\(\d{3}\)\s?\d{3}\s?\d{2}\s?\d{2}$/,
        emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        minQuantity: 1,
        maxQuantity: 100
    },
    animation: {
        threshold: 0.1,
        rootMargin: '0px'
    }
};

// Утилиты
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatPhoneNumber(input) {
        const cleaned = input.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
        if (match) {
            return `+996 (${match[1]}) ${match[2]} ${match[3]} ${match[4]}`;
        }
        return input;
    },

    sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeLanguageSwitcher();
        initializeMobileMenu();
        initializeFormValidation();
        initializeAnimations();
        initializeOrderForm();
        handleAboutAnimations();
    } catch (error) {
        console.error('Initialization error:', error);
        // Показываем пользователю сообщение об ошибке
        showErrorMessage('Произошла ошибка при загрузке страницы. Пожалуйста, обновите страницу.');
    }
});

// Инициализация переключателя языка
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const currentLang = localStorage.getItem('language') || 'ru';

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
            localStorage.setItem('language', lang);
        });

        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });
    
    setLanguage(currentLang);
}

// Установка языка
    function setLanguage(lang) {
        document.querySelectorAll('[data-ru]').forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = element.dataset[lang];
                } else {
            element.textContent = element.dataset[lang];
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    updateFormValidationMessages(lang);
}

// Инициализация мобильного меню
function initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.main-nav');

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Закрытие меню при клике на ссылку
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Инициализация валидации формы
function initializeFormValidation() {
    const form = document.querySelector('.order-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', utils.debounce(() => {
            validateInput(input);
        }, 300));

        if (input.type === 'tel') {
            input.addEventListener('input', (e) => {
                e.target.value = utils.formatPhoneNumber(e.target.value);
            });
        }
    });

    form.addEventListener('submit', handleFormSubmit);
}

// Валидация поля ввода
function validateInput(input) {
    const value = utils.sanitizeInput(input.value.trim());
    let isValid = true;
    let errorMessage = '';

    switch (input.type) {
        case 'email':
            isValid = CONFIG.formValidation.emailPattern.test(value);
            errorMessage = isValid ? '' : 'Пожалуйста, введите корректный email';
            break;
        case 'tel':
            isValid = CONFIG.formValidation.phonePattern.test(value);
            errorMessage = isValid ? '' : 'Пожалуйста, введите корректный номер телефона';
            break;
        case 'number':
            const num = parseInt(value);
            isValid = num >= CONFIG.formValidation.minQuantity && num <= CONFIG.formValidation.maxQuantity;
            errorMessage = isValid ? '' : `Количество должно быть от ${CONFIG.formValidation.minQuantity} до ${CONFIG.formValidation.maxQuantity}`;
            break;
        default:
            isValid = value.length > 0;
            errorMessage = isValid ? '' : 'Это поле обязательно для заполнения';
    }

    input.setCustomValidity(errorMessage);
    return isValid;
}

// Обработка отправки формы
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Валидация всех полей
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        showErrorMessage('Пожалуйста, исправьте ошибки в форме');
        return;
    }

    try {
        const submitButton = form.querySelector('.submit-button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';

        // Здесь будет отправка данных на сервер
        await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация отправки

        showSuccessMessage('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
        form.reset();
        updateOrderSummary();
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
    } finally {
        const submitButton = form.querySelector('.submit-button');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Оформить заказ';
    }
}

// Инициализация анимаций
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, CONFIG.animation);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
}

// Инициализация формы заказа
function initializeOrderForm() {
    const quantityInput = document.querySelector('#quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const productOptions = document.querySelectorAll('input[name="product"]');

    if (quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > CONFIG.formValidation.minQuantity) {
                quantityInput.value = currentValue - 1;
                updateOrderSummary();
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < CONFIG.formValidation.maxQuantity) {
                quantityInput.value = currentValue + 1;
                updateOrderSummary();
            }
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < CONFIG.formValidation.minQuantity) {
                value = CONFIG.formValidation.minQuantity;
            } else if (value > CONFIG.formValidation.maxQuantity) {
                value = CONFIG.formValidation.maxQuantity;
            }
            quantityInput.value = value;
            updateOrderSummary();
        });
    }

    productOptions.forEach(option => {
        option.addEventListener('change', updateOrderSummary);
    });
}

// Обновление сводки заказа
function updateOrderSummary() {
    const selectedProduct = document.querySelector('input[name="product"]:checked');
    const quantity = parseInt(document.querySelector('#quantity').value);
    
    if (!selectedProduct) return;

    const size = selectedProduct.value;
    const price = getProductPrice(size);
    const total = price * quantity;

    document.querySelector('#product-summary').textContent = `${size} л x ${quantity} шт.`;
    document.querySelector('#price-summary').textContent = `${price} сом`;
    document.querySelector('#total-summary').textContent = `${total} сом`;
}

// Получение цены продукта
function getProductPrice(size) {
    const prices = {
        '0.5': 50,
        '1': 80,
        '1.5': 100
    };
    return prices[size] || 0;
}

// Показать сообщение об ошибке
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Показать сообщение об успехе
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

// Плавная прокрутка к секции
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Обновление сообщений валидации
    function updateFormValidationMessages(lang) {
        const messages = {
            ru: {
                required: 'Это поле обязательно для заполнения',
                email: 'Пожалуйста, введите корректный email',
                phone: 'Пожалуйста, введите корректный номер телефона',
                min: 'Минимальное количество: 1',
                max: 'Максимальное количество: 100'
            },
            ky: {
                required: 'Бул талаа толтуруу зарыл',
                email: 'Туура email дарегин киргизиңиз',
                phone: 'Туура телефон номерин киргизиңиз',
                min: 'Минималдуу саны: 1',
                max: 'Максималдуу саны: 100'
            }
        };
        
        document.querySelectorAll('input, textarea').forEach(input => {
        input.setCustomValidity(messages[lang][input.type === 'email' ? 'email' : 'required']);
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Parallax effect for bottle
    const bottle = document.querySelector('.bottle');
    let lastScrollY = window.scrollY;

    if (bottle) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const scrollDiff = currentScrollY - lastScrollY;
            
            const currentTransform = parseFloat(getComputedStyle(bottle).transform.split(',')[5] || 0);
            const newTransform = currentTransform + scrollDiff * 0.1;
            bottle.style.transform = `translateY(${newTransform}px)`;
            
            lastScrollY = currentScrollY;
        });
    }

    // Scroll Animation Function
    function handleScrollAnimation() {
        const elements = document.querySelectorAll('.animate-on-scroll, .animate-item');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            // Check if element is in viewport
            if (elementTop < windowHeight * 0.8 && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    }

    // Initial check for elements in viewport
    document.addEventListener('DOMContentLoaded', handleScrollAnimation);

    // Check for elements in viewport on scroll
    window.addEventListener('scroll', handleScrollAnimation);

    // Journey section animations
    function handleJourneyAnimations() {
        const steps = document.querySelectorAll('.journey-step');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        steps.forEach(step => {
            observer.observe(step);
        });
    }

    // Initialize journey animations
    handleJourneyAnimations();

function handleAboutAnimations() {
    const leftElement = document.querySelector('.animate-left');
    const rightElement = document.querySelector('.animate-right');
    
    if (leftElement && rightElement) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(leftElement);
        observer.observe(rightElement);
    }
} 