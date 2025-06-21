const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Конфигурация Telegram
const TELEGRAM_CONFIG = {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8031704621:AAFuySRHLHR8DGGo8A1fJnEH3l0q8_IllMM',
    chatId: process.env.TELEGRAM_CHAT_ID || '-1002335444341',
    channelUsername: process.env.TELEGRAM_CHANNEL_USERNAME || 'emel_orders'
};

// Цены продуктов
const PRICES = {
    '0.5': 50,
    '1': 80,
    '1.5': 100
};

// Инициализация Telegram бота
const bot = new TelegramBot(TELEGRAM_CONFIG.botToken, { polling: false });

// Middleware для обслуживания статических файлов
app.use(express.static(path.join(__dirname)));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Валидация данных заказа
function validateOrderData(data) {
    const required = ['name', 'phone', 'email', 'product', 'quantity'];
    const errors = [];

    // Проверяем обязательные поля
    required.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`Поле ${field} обязательно для заполнения`);
        }
    });

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
        errors.push('Некорректный email адрес');
    }

    // Валидация телефона
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    if (data.phone && !phoneRegex.test(data.phone.replace(/\D/g, ''))) {
        errors.push('Некорректный номер телефона');
    }

    // Валидация количества
    const quantity = parseInt(data.quantity);
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
        errors.push('Количество должно быть от 1 до 100');
    }

    // Валидация продукта
    if (data.product && !PRICES[data.product]) {
        errors.push('Некорректный продукт');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Очистка данных от опасных символов
function sanitizeData(data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = value.replace(/[<>]/g, '').trim();
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

// Формирование сообщения для Telegram
function formatTelegramMessage(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const price = PRICES[data.product] || 0;
    const total = price * parseInt(data.quantity);

    return `
🆕 Новый заказ:
📅 Дата: ${dateStr}
📦 Продукт: ${data.product} л
🔢 Количество: ${data.quantity}
💰 Цена: ${price} сом
💵 Итого: ${total} сом
👤 Имя: ${data.name}
📱 Телефон: ${data.phone}
📧 Email: ${data.email}
📝 Комментарий: ${data.comment || 'Нет'}
🌐 Источник: ${data.source || 'Веб-сайт'}
    `.trim();
}

// API маршруты
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;

        // Валидация данных
        const validation = validateOrderData(orderData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                errors: validation.errors
            });
        }

        // Очистка данных
        const sanitizedData = sanitizeData(orderData);

        // Формирование сообщения
        const message = formatTelegramMessage(sanitizedData);

        // Отправка в Telegram
        await bot.sendMessage(TELEGRAM_CONFIG.chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            disable_notification: false
        });

        res.json({
            success: true,
            message: 'Заказ успешно оформлен'
        });

    } catch (error) {
        console.error('Ошибка при обработке заказа:', error);
        
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при обработке заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Проверка статуса сервера
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Получение конфигурации цен
app.get('/api/prices', (req, res) => {
    res.json({
        success: true,
        prices: PRICES
    });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// 404 обработчик должен быть в конце, после всех маршрутов
// Сначала он пытается найти API, потом статический файл, и только потом отдает 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM получен, завершение работы сервера...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT получен, завершение работы сервера...');
    process.exit(0);
}); 