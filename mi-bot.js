const { Client, LocalAuth } = require('whatsapp-web.js');

// Crear cliente con autenticación local
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false // Muestra el navegador
    }
});

// Evento: Código QR para vincular WhatsApp
client.on('qr', (qr) => {
    console.log('Escanea este código QR con tu WhatsApp:', qr);
});

// Evento: Cliente listo
client.on('ready', () => {
    console.log('¡Bot de WhatsApp está listo!');
});

// Evento: Mensaje recibido
client.on('message', async msg => {
    console.log('Mensaje recibido:', msg.body);
    
    // Responder a comandos
    if (msg.body === '!ping') {
        msg.reply('¡pong!');
    }
    
    if (msg.body === '!hola') {
        msg.reply('¡Hola! Soy un bot de WhatsApp 🤖');
    }
    
    if (msg.body === '!info') {
        const chat = await msg.getChat();
        msg.reply(`Nombre del chat: ${chat.name}\nEs grupo: ${chat.isGroup}`);
    }
});

// Inicializar el cliente
client.initialize();