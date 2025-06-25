# WhatsApp API - Sistema Multi-Usuario

## 🚀 Descripción

Este es un sistema completo de API REST para WhatsApp que permite a múltiples usuarios crear sesiones independientes, obtener sus propias API Keys y enviar mensajes de WhatsApp de forma programática.

## ✨ Características

- 🔐 **Sistema de autenticación con API Keys únicas**
- 👥 **Múltiples sesiones simultáneas de WhatsApp**
- 📱 **Interfaz web para gestión de sesiones**
- 🔄 **Códigos QR automáticos para conexión**
- 📨 **Envío de mensajes individuales y masivos**
- 📎 **Envío de archivos multimedia**
- 🛡️ **Autenticación segura por headers o body**
- 📊 **Dashboard completo para gestión**

## 🛠️ Instalación

### Prerrequisitos
- Node.js v18 o superior
- npm o yarn

### Pasos de instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor:**
   ```bash
   npm start
   # o
   npm run dev
   ```

3. **Acceder a la aplicación:**
   - Abrir navegador en: `http://localhost:3001`

## 🔧 Uso del Sistema

### 1. Crear una Sesión

1. Ve a `http://localhost:3001`
2. Ingresa un nombre único para tu sesión (ej: "MiEmpresa", "Personal")
3. Haz clic en "Crear Sesión"
4. **Guarda tu API Key** - la necesitarás para todas las peticiones
5. Escanea el código QR con WhatsApp
6. ¡Listo! Tu sesión está conectada

### 2. Usar el Dashboard

- Ve a `http://localhost:3001/dashboard`
- Desde aquí puedes:
  - Enviar mensajes individuales
  - Enviar archivos multimedia
  - Realizar envíos masivos
  - Ver el estado de tu conexión
  - Reiniciar tu sesión

## 📡 API Endpoints

### Autenticación

Todas las peticiones a la API requieren autenticación. Puedes enviar tu API Key de dos formas:

**Opción 1: Header (Recomendado)**
```bash
X-API-Key: tu_api_key_aqui
```

**Opción 2: En el body**
```json
{
  "apiKey": "tu_api_key_aqui",
  "number": "+1234567890",
  "message": "Hola"
}
```

### Endpoints Disponibles

#### 1. Enviar Mensaje Individual
```http
POST /api/send/message
Content-Type: application/json
X-API-Key: tu_api_key

{
  "number": "+1234567890",
  "message": "Hola, este es un mensaje de prueba"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "to": "+1234567890"
}
```

#### 2. Envío Masivo
```http
POST /api/send/bulk
Content-Type: application/json
X-API-Key: tu_api_key

{
  "numbers": ["+1234567890", "+0987654321", "+1122334455"],
  "message": "Mensaje masivo para todos"
}
```

**Respuesta:**
```json
{
  "success": true,
  "results": [
    {
      "number": "+1234567890",
      "status": "enviado",
      "error": null
    },
    {
      "number": "+0987654321",
      "status": "error",
      "error": "Número inválido"
    }
  ]
}
```

#### 3. Enviar Archivo/Media
```http
POST /api/send/media
Content-Type: application/json
X-API-Key: tu_api_key

{
  "number": "+1234567890",
  "mediaUrl": "https://ejemplo.com/imagen.jpg",
  "caption": "Descripción opcional del archivo"
}
```

#### 4. Información de Sesión
```http
GET /api/session/info
X-API-Key: tu_api_key
```

**Respuesta:**
```json
{
  "sessionName": "MiEmpresa",
  "isReady": true,
  "hasQR": false
}
```

#### 5. Reiniciar Sesión
```http
POST /api/session/restart
X-API-Key: tu_api_key
```

## 🔨 Ejemplos con diferentes herramientas

### cURL
```bash
# Enviar mensaje individual
curl -X POST http://localhost:3001/api/send/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu_api_key_aqui" \
  -d '{
    "number": "+1234567890",
    "message": "Hola desde cURL"
  }'

# Envío masivo
curl -X POST http://localhost:3001/api/send/bulk \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu_api_key_aqui" \
  -d '{
    "numbers": ["+1234567890", "+0987654321"],
    "message": "Mensaje masivo desde cURL"
  }'
```

### Postman

1. **Configurar Headers:**
   - `Content-Type: application/json`
   - `X-API-Key: tu_api_key_aqui`

2. **Body (raw JSON):**
   ```json
   {
     "number": "+1234567890",
     "message": "Mensaje desde Postman"
   }
   ```

### JavaScript/Node.js
```javascript
const axios = require('axios');

const apiKey = 'tu_api_key_aqui';
const baseURL = 'http://localhost:3001';

// Enviar mensaje individual
async function enviarMensaje(numero, mensaje) {
  try {
    const response = await axios.post(`${baseURL}/api/send/message`, {
      number: numero,
      message: mensaje
    }, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Mensaje enviado:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Envío masivo
async function envioMasivo(numeros, mensaje) {
  try {
    const response = await axios.post(`${baseURL}/api/send/bulk`, {
      numbers: numeros,
      message: mensaje
    }, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Envío masivo completado:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Usar las funciones
enviarMensaje('+1234567890', 'Hola desde Node.js');
envioMasivo(['+123', '+456', '+789'], 'Mensaje masivo desde Node.js');
```

### Python
```python
import requests
import json

api_key = 'tu_api_key_aqui'
base_url = 'http://localhost:3001'

headers = {
    'Content-Type': 'application/json',
    'X-API-Key': api_key
}

# Enviar mensaje individual
def enviar_mensaje(numero, mensaje):
    data = {
        'number': numero,
        'message': mensaje
    }
    
    response = requests.post(
        f'{base_url}/api/send/message',
        headers=headers,
        json=data
    )
    
    return response.json()

# Envío masivo
def envio_masivo(numeros, mensaje):
    data = {
        'numbers': numeros,
        'message': mensaje
    }
    
    response = requests.post(
        f'{base_url}/api/send/bulk',
        headers=headers,
        json=data
    )
    
    return response.json()

# Usar las funciones
result = enviar_mensaje('+1234567890', 'Hola desde Python')
print(result)

result = envio_masivo(['+123', '+456'], 'Mensaje masivo desde Python')
print(result)
```

## 🔒 Seguridad

- **API Keys únicas:** Cada sesión tiene su propia API Key
- **Sesiones aisladas:** Las sesiones no pueden acceder a datos de otras
- **Validación de entrada:** Todos los datos son validados antes del procesamiento
- **Rate limiting:** Pausa automática entre mensajes para evitar spam

## ⚠️ Consideraciones Importantes

1. **Límites de WhatsApp:** Respeta los límites de WhatsApp para evitar bloqueos
2. **Uso responsable:** No uses la API para spam o mensajes no solicitados
3. **Backup de API Keys:** Guarda tus API Keys de forma segura
4. **Reconexión:** Si WhatsApp se desconecta, usa el endpoint de restart
5. **Formato de números:** Usa formato internacional (+código_país + número)

## 🐛 Solución de Problemas

### Error: "API Key requerida"
- Verifica que estés enviando la API Key en el header `X-API-Key` o en el body

### Error: "WhatsApp no está conectado"
- Ve al dashboard y verifica el estado de conexión
- Si es necesario, reinicia la sesión

### Error: "Número inválido"
- Asegúrate de usar formato internacional: `+1234567890`
- No incluyas espacios, guiones o paréntesis

### QR Code no aparece
- Verifica que el servidor esté ejecutándose
- Revisa la consola del servidor para errores
- Intenta reiniciar la sesión

## 📊 Monitoreo

### Logs del Servidor
El servidor muestra logs detallados:
```
🚀 Servidor API de WhatsApp ejecutándose en http://localhost:3001
📱 Abre tu navegador en: http://localhost:3001
🔑 Crea una nueva sesión para obtener tu API Key
QR Code recibido para usuario abc123
Cliente de WhatsApp listo para usuario abc123
```

### Endpoint de Administración
```http
GET /api/admin/sessions
```

Muestra todas las sesiones activas (útil para monitoreo).

## 🚀 Próximas Características

- [ ] Webhooks para recibir mensajes
- [ ] Programación de mensajes
- [ ] Plantillas de mensajes
- [ ] Estadísticas de envío
- [ ] Base de datos persistente
- [ ] Autenticación con usuarios y contraseñas

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa esta documentación
2. Verifica los logs del servidor
3. Prueba con el dashboard web primero
4. Verifica que WhatsApp esté conectado

---

**¡Disfruta usando la API de WhatsApp! 🎉**