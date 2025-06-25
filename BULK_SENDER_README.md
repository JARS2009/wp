# 📱 WhatsApp Bulk Sender

## ¿Qué es esto?

Una aplicación web que te permite enviar mensajes masivos de WhatsApp a múltiples números de forma fácil y organizada. **NO envía SMS**, sino mensajes de WhatsApp.

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Instalar Express (si no se instaló automáticamente)
```bash
npm install express
```

### 3. Ejecutar la aplicación
```bash
npm start
```

O directamente:
```bash
node server.js
```

### 4. Abrir en el navegador
Ve a: http://localhost:3000

## 📋 Cómo usar la aplicación

### Paso 1: Conectar WhatsApp
1. Ejecuta la aplicación
2. Aparecerá un código QR en la página web
3. Abre WhatsApp en tu teléfono
4. Ve a **Menú → Dispositivos vinculados → Vincular dispositivo**
5. Escanea el código QR
6. ¡Listo! El estado cambiará a "WhatsApp conectado ✅"

### Paso 2: Agregar números

#### Opción A: Uno por uno
1. Escribe el número en el campo "Número de teléfono"
2. Formatos aceptados:
   - `3001234567`
   - `+573001234567`
   - `573001234567`
3. Haz clic en "➕ Agregar Número"

#### Opción B: Múltiples números
1. En el área de texto "múltiples números", pega una lista
2. Un número por línea:
   ```
   3001234567
   +573009876543
   3005555555
   ```
3. Haz clic en "📥 Importar Números"

### Paso 3: Escribir mensaje
1. En el área "Mensaje a enviar", escribe tu mensaje
2. Puedes usar emojis y texto normal
3. El mensaje se enviará exactamente como lo escribas

### Paso 4: Enviar mensajes
1. Haz clic en "🚀 Enviar Mensajes"
2. Confirma el envío
3. La aplicación enviará los mensajes uno por uno
4. Verás los resultados en tiempo real

## ✨ Características

### 🎯 Funcionalidades principales
- ✅ Envío masivo de mensajes de WhatsApp
- ✅ Gestión de listas de números
- ✅ Importación masiva de números
- ✅ Resultados detallados del envío
- ✅ Interfaz web moderna y responsive
- ✅ Conexión automática con WhatsApp Web

### 🛡️ Características de seguridad
- ⏱️ Pausa de 2 segundos entre mensajes (evita spam)
- 🔄 Reconexión automática si se pierde la conexión
- ❌ Manejo de errores por número inválido
- 📊 Reporte detallado de éxitos y fallos

### 📱 Interfaz de usuario
- 🎨 Diseño moderno inspirado en WhatsApp
- 📱 Responsive (funciona en móviles)
- 🔴🟢 Indicador de estado de conexión
- 📋 Lista visual de números agregados
- 📊 Resultados organizados por éxito/error

## 🔧 Funciones avanzadas

### Gestión de números
- **Agregar individual**: Un número a la vez
- **Importación masiva**: Pegar lista completa
- **Eliminar individual**: Botón ✕ en cada número
- **Limpiar todo**: Botón para vaciar la lista
- **Contador**: Muestra cuántos números hay

### Control de envío
- **Validación**: Verifica conexión antes de enviar
- **Confirmación**: Pregunta antes del envío masivo
- **Progreso**: Muestra "Enviando mensajes..."
- **Resultados**: Detalle de cada envío

### Gestión de conexión
- **Estado visual**: Indicador rojo/verde
- **Código QR**: Se muestra automáticamente
- **Reinicio**: Botón para reconectar
- **Auto-verificación**: Cada 3 segundos

## 📊 Interpretando los resultados

### ✅ Mensaje enviado exitosamente
- Aparece con fondo verde
- Indica que el mensaje llegó a WhatsApp
- El número es válido y está en WhatsApp

### ❌ Error en el envío
- Aparece con fondo rojo
- Muestra el motivo del error:
  - "Número no registrado en WhatsApp"
  - "Número inválido"
  - "Error de conexión"
  - Etc.

## ⚠️ Consideraciones importantes

### Limitaciones de WhatsApp
- WhatsApp puede detectar y bloquear el uso de bots
- No envíes spam o mensajes no solicitados
- Respeta la privacidad de los usuarios
- Usa la aplicación responsablemente

### Recomendaciones de uso
- **Máximo recomendado**: 50-100 mensajes por sesión
- **Frecuencia**: No uses la aplicación todo el día
- **Contenido**: Envía solo mensajes relevantes
- **Permisos**: Asegúrate de tener permiso para contactar

### Problemas comunes

#### "WhatsApp no está conectado"
- **Solución**: Escanea el código QR nuevamente
- **Causa**: La sesión expiró o se desconectó

#### "Número no registrado en WhatsApp"
- **Solución**: Verifica que el número tenga WhatsApp
- **Causa**: El número no existe o no usa WhatsApp

#### "Error de conexión"
- **Solución**: Verifica tu conexión a internet
- **Causa**: Problemas de red o servidor

## 🛠️ Solución de problemas

### La página no carga
1. Verifica que el servidor esté ejecutándose
2. Ve a http://localhost:3000
3. Revisa la consola por errores

### No aparece el código QR
1. Haz clic en "🔄 Reiniciar Cliente"
2. Espera unos segundos
3. El QR debería aparecer automáticamente

### Los mensajes no se envían
1. Verifica que el estado sea "conectado ✅"
2. Asegúrate de tener números en la lista
3. Escribe un mensaje antes de enviar

### Error "Cannot find module 'express'"
```bash
npm install express
```

## 📁 Estructura de archivos

```
wp/
├── server.js              # Servidor web principal
├── public/
│   └── index.html         # Interfaz web
├── package.json           # Dependencias
├── .wwebjs_auth/          # Sesión de WhatsApp (auto-generado)
└── .wwebjs_cache/         # Cache de WhatsApp (auto-generado)
```

## 🔄 Comandos útiles

```bash
# Ejecutar la aplicación
npm start

# Ejecutar en modo desarrollo
npm run dev

# Instalar dependencias
npm install

# Limpiar cache de WhatsApp (si hay problemas)
rm -rf .wwebjs_auth .wwebjs_cache
```

## 🆘 Soporte

Si tienes problemas:

1. **Revisa este README** completo
2. **Verifica los requisitos**: Node.js v18+
3. **Reinstala dependencias**: `npm install`
4. **Limpia el cache**: Elimina carpetas `.wwebjs_*`
5. **Reinicia todo**: Cierra y vuelve a ejecutar

---

**¡Disfruta enviando mensajes de WhatsApp de forma masiva! 🚀📱**