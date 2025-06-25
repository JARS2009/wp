const express = require('express');
const { Client, LocalAuth } = require('./index');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const QRCode = require('qrcode');

const app = express();
const port = 3003;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Almacenamiento en memoria para usuarios y clientes
const users = new Map(); // userId -> { apiKey, client, isReady, qrCode, sessionName }
const apiKeys = new Map(); // apiKey -> userId

// Generar API Key único
function generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
}

// Generar ID de usuario único
function generateUserId() {
    return crypto.randomBytes(16).toString('hex');
}

// Middleware de autenticación
function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.body.apiKey || req.query.apiKey;
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API Key requerida' });
    }
    
    const userId = apiKeys.get(apiKey);
    if (!userId || !users.has(userId)) {
        return res.status(401).json({ error: 'API Key inválida' });
    }
    
    req.userId = userId;
    req.userSession = users.get(userId);
    next();
}

// Inicializar cliente de WhatsApp para un usuario
function initializeWhatsAppForUser(userId, sessionName) {
    const user = users.get(userId);
    if (!user) return;
    
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionName }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', async (qr) => {
        console.log(`QR Code recibido para usuario ${userId}`);
        try {
            const qrCodeDataURL = await QRCode.toDataURL(qr);
            user.qrCode = qrCodeDataURL;
            user.qrString = qr;
        } catch (error) {
            console.error('Error generando QR Code:', error);
            user.qrCode = qr;
        }
    });

    client.on('ready', () => {
        console.log(`Cliente de WhatsApp listo para usuario ${userId}`);
        user.isReady = true;
        user.qrCode = '';
        user.qrString = '';
    });

    client.on('auth_failure', msg => {
        console.error(`Error de autenticación para usuario ${userId}:`, msg);
        user.isReady = false;
    });

    client.on('disconnected', (reason) => {
        console.log(`Cliente desconectado para usuario ${userId}:`, reason);
        user.isReady = false;
    });

    user.client = client;
    client.initialize();
}

// RUTAS DE AUTENTICACIÓN

// Página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard (requiere estar logueado)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Crear nueva sesión de usuario
app.post('/api/auth/register', (req, res) => {
    try {
        const { sessionName } = req.body;
        
        if (!sessionName || sessionName.trim() === '') {
            return res.status(400).json({ error: 'Nombre de sesión requerido' });
        }
        
        // Verificar si ya existe una sesión con ese nombre
        const existingUser = Array.from(users.values()).find(user => user.sessionName === sessionName);
        if (existingUser) {
            return res.status(400).json({ error: 'Ya existe una sesión con ese nombre' });
        }
        
        const userId = generateUserId();
        const apiKey = generateApiKey();
        
        const user = {
            apiKey,
            client: null,
            isReady: false,
            qrCode: '',
            qrString: '',
            sessionName: sessionName.trim()
        };
        
        users.set(userId, user);
        apiKeys.set(apiKey, userId);
        
        // Inicializar WhatsApp para este usuario
        initializeWhatsAppForUser(userId, sessionName);
        
        res.json({
            success: true,
            userId,
            apiKey,
            sessionName,
            message: 'Sesión creada. Escanea el código QR para conectar WhatsApp.'
        });
        
    } catch (error) {
        console.error('Error creando sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener estado de la sesión
app.get('/api/auth/status/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const user = users.get(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        
        res.json({
            userId,
            sessionName: user.sessionName,
            isReady: user.isReady,
            qrCode: user.qrCode,
            hasQR: !!user.qrCode
        });
        
    } catch (error) {
        console.error('Error obteniendo estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RUTAS DE API (requieren autenticación)

// Obtener información de la sesión autenticada
app.get('/api/session/info', authenticateApiKey, (req, res) => {
    const user = req.userSession;
    res.json({
        sessionName: user.sessionName,
        isReady: user.isReady,
        hasQR: !!user.qrCode
    });
});

// Enviar mensaje individual
app.post('/api/send/message', authenticateApiKey, async (req, res) => {
    try {
        const { number, message } = req.body;
        const user = req.userSession;
        
        if (!user.isReady) {
            return res.status(400).json({ error: 'WhatsApp no está conectado' });
        }
        
        if (!number || !message) {
            return res.status(400).json({ error: 'Número y mensaje son requeridos' });
        }
        
        // Formatear número
        let formattedNumber = number.replace(/\D/g, '');
        if (!formattedNumber.includes('@c.us')) {
            formattedNumber = formattedNumber + '@c.us';
        }
        
        await user.client.sendMessage(formattedNumber, message);
        
        res.json({
            success: true,
            message: 'Mensaje enviado correctamente',
            to: number
        });
        
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({ error: 'Error enviando mensaje: ' + error.message });
    }
});

// Enviar mensajes masivos
app.post('/api/send/bulk', authenticateApiKey, async (req, res) => {
    try {
        const { numbers, message } = req.body;
        const user = req.userSession;
        
        if (!user.isReady) {
            return res.status(400).json({ error: 'WhatsApp no está conectado' });
        }
        
        if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
            return res.status(400).json({ error: 'Debe proporcionar una lista de números' });
        }
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Debe proporcionar un mensaje' });
        }
        
        const results = [];
        
        for (const number of numbers) {
            try {
                // Formatear número
                let formattedNumber = number.replace(/\D/g, '');
                if (!formattedNumber.includes('@c.us')) {
                    formattedNumber = formattedNumber + '@c.us';
                }
                
                await user.client.sendMessage(formattedNumber, message);
                results.push({ number, status: 'enviado', error: null });
                
                // Pausa entre mensajes
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`Error enviando a ${number}:`, error);
                results.push({ number, status: 'error', error: error.message });
            }
        }
        
        res.json({ success: true, results });
        
    } catch (error) {
        console.error('Error en envío masivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Enviar archivo/media
app.post('/api/send/media', authenticateApiKey, async (req, res) => {
    try {
        const { number, mediaUrl, caption } = req.body;
        const user = req.userSession;
        
        if (!user.isReady) {
            return res.status(400).json({ error: 'WhatsApp no está conectado' });
        }
        
        if (!number || !mediaUrl) {
            return res.status(400).json({ error: 'Número y URL del archivo son requeridos' });
        }
        
        // Formatear número
        let formattedNumber = number.replace(/\D/g, '');
        if (!formattedNumber.includes('@c.us')) {
            formattedNumber = formattedNumber + '@c.us';
        }
        
        const MessageMedia = require('./src/structures/MessageMedia');
        const media = await MessageMedia.fromUrl(mediaUrl);
        
        await user.client.sendMessage(formattedNumber, media, { caption });
        
        res.json({
            success: true,
            message: 'Archivo enviado correctamente',
            to: number
        });
        
    } catch (error) {
        console.error('Error enviando archivo:', error);
        res.status(500).json({ error: 'Error enviando archivo: ' + error.message });
    }
});

// Reiniciar sesión
app.post('/api/session/restart', authenticateApiKey, (req, res) => {
    try {
        const user = req.userSession;
        
        if (user.client) {
            user.client.destroy();
        }
        
        user.isReady = false;
        user.qrCode = '';
        user.qrString = '';
        
        setTimeout(() => {
            initializeWhatsAppForUser(req.userId, user.sessionName);
        }, 2000);
        
        res.json({ success: true, message: 'Sesión reiniciada' });
        
    } catch (error) {
        console.error('Error reiniciando sesión:', error);
        res.status(500).json({ error: 'Error al reiniciar sesión' });
    }
});

// Listar todas las sesiones activas (para administración)
app.get('/api/admin/sessions', (req, res) => {
    const sessions = Array.from(users.entries()).map(([userId, user]) => ({
        userId,
        sessionName: user.sessionName,
        isReady: user.isReady,
        hasQR: !!user.qrCode
    }));
    
    res.json({ sessions });
});

// Crear directorio public si no existe
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor API de WhatsApp ejecutándose en http://localhost:${port}`);
    console.log(`📱 Abre tu navegador en: http://localhost:${port}`);
    console.log('🔑 Crea una nueva sesión para obtener tu API Key');
});

module.exports = app;