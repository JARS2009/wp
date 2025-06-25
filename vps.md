# 🚀 Guía Completa: Desplegar API de WhatsApp en VPS

Esta guía te ayudará a subir tu proyecto de API de WhatsApp a un servidor VPS paso a paso.

## 📋 Requisitos Previos

### En tu VPS:

-   Ubuntu 20.04+ o CentOS 7+ (recomendado)
-   Mínimo 1GB RAM, 1 CPU
-   Acceso root o sudo
-   Conexión a internet estable

### En tu máquina local:

-   Git instalado
-   Acceso SSH al VPS
-   Tu proyecto funcionando localmente

## 🔧 Paso 1: Preparar el VPS

### 1.1 Conectar al VPS

```bash
ssh root@tu-ip-del-vps
# o si tienes usuario específico:
ssh usuario@tu-ip-del-vps
```

### 1.2 Actualizar el sistema

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.3 Instalar dependencias básicas

```bash
# Ubuntu/Debian
sudo apt install -y curl wget git build-essential

# CentOS/RHEL
sudo yum install -y curl wget git gcc-c++ make
```

## 📦 Paso 2: Instalar Node.js

### 2.1 Instalar Node.js 18+ (recomendado)

```bash
# Descargar e instalar NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2.2 Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
```

## 🌐 Paso 3: Configurar Firewall

### 3.1 Configurar UFW (Ubuntu)

```bash
sudo ufw allow ssh
sudo ufw allow 3003/tcp  # Puerto de tu aplicación
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
```

### 3.2 Verificar puertos abiertos

```bash
sudo ufw status
```

## 📁 Paso 4: Subir el Proyecto

### 4.1 Crear directorio para la aplicación

```bash
sudo mkdir -p /var/www/whatsapp-api
sudo chown $USER:$USER /var/www/whatsapp-api
cd /var/www/whatsapp-api
```

### 4.2 Opción A: Clonar desde Git (recomendado)

```bash
# Si tu proyecto está en GitHub/GitLab
git clone https://github.com/tu-usuario/tu-repositorio.git .
```

### 4.3 Opción B: Subir archivos manualmente

```bash
# Desde tu máquina local, comprimir el proyecto
tar -czf whatsapp-api.tar.gz --exclude=node_modules --exclude=.wwebjs_auth --exclude=.wwebjs_cache .

# Subir al VPS
scp whatsapp-api.tar.gz usuario@tu-ip:/var/www/whatsapp-api/

# En el VPS, extraer
cd /var/www/whatsapp-api
tar -xzf whatsapp-api.tar.gz
rm whatsapp-api.tar.gz
```

## ⚙️ Paso 5: Configurar la Aplicación

### 5.1 Instalar dependencias

```bash
cd /var/www/whatsapp-api
npm install
```

### 5.2 Crear archivo de configuración

```bash
nano ecosystem.config.js
```

Agregar el siguiente contenido:

```javascript
module.exports = {
    apps: [
        {
            name: "whatsapp-api",
            script: "server.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "production",
                PORT: 3003,
            },
            error_file: "/var/log/whatsapp-api/error.log",
            out_file: "/var/log/whatsapp-api/out.log",
            log_file: "/var/log/whatsapp-api/combined.log",
        },
    ],
};
```

### 5.3 Crear directorio de logs

```bash
sudo mkdir -p /var/log/whatsapp-api
sudo chown $USER:$USER /var/log/whatsapp-api
```

### 5.4 Modificar configuración del servidor (si es necesario)

```bash
nano server.js
```

Asegúrate de que el puerto esté configurado correctamente:

```javascript
const PORT = process.env.PORT || 3003;
```

## 🚀 Paso 6: Iniciar la Aplicación

### 6.1 Iniciar con PM2

```bash
cd /var/www/whatsapp-api
pm2 start ecosystem.config.js
```

### 6.2 Verificar que esté funcionando

```bash
pm2 status
pm2 logs whatsapp-api
```

### 6.3 Configurar PM2 para inicio automático

```bash
pm2 startup
pm2 save
```

## 🌍 Paso 7: Configurar Nginx (Opcional pero Recomendado)

### 7.1 Instalar Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.2 Crear configuración del sitio

```bash
sudo nano /etc/nginx/sites-available/whatsapp-api
```

Agregar:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;  # Cambia por tu dominio o IP

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.3 Activar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Paso 8: Configurar HTTPS con Let's Encrypt (Opcional)

### 8.1 Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Obtener certificado SSL

```bash
sudo certbot --nginx -d tu-dominio.com
```

## 📊 Paso 9: Monitoreo y Mantenimiento

### 9.1 Comandos útiles de PM2

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs whatsapp-api

# Reiniciar aplicación
pm2 restart whatsapp-api

# Detener aplicación
pm2 stop whatsapp-api

# Eliminar aplicación de PM2
pm2 delete whatsapp-api
```

### 9.2 Verificar uso de recursos

```bash
# Uso de CPU y memoria
top
htop  # Si está instalado

# Espacio en disco
df -h

# Procesos de Node.js
ps aux | grep node
```

### 9.3 Logs del sistema

```bash
# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de la aplicación
tail -f /var/log/whatsapp-api/combined.log
```

## 🔧 Paso 10: Actualizar la Aplicación

### 10.1 Script de actualización

Crea un archivo `update.sh`:

```bash
nano /var/www/whatsapp-api/update.sh
```

Contenido:

```bash
#!/bin/bash
cd /var/www/whatsapp-api

# Hacer backup
cp -r .wwebjs_auth .wwebjs_auth_backup_$(date +%Y%m%d_%H%M%S)

# Actualizar código
git pull origin main

# Instalar nuevas dependencias
npm install

# Reiniciar aplicación
pm2 restart whatsapp-api

echo "Actualización completada"
```

### 10.2 Hacer ejecutable

```bash
chmod +x /var/www/whatsapp-api/update.sh
```

## 🚨 Solución de Problemas Comunes

### Error: Puerto en uso

```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3003

# Matar proceso si es necesario
sudo kill -9 PID_DEL_PROCESO
```

### Error: Permisos de archivos

```bash
# Corregir permisos
sudo chown -R $USER:$USER /var/www/whatsapp-api
chmod -R 755 /var/www/whatsapp-api
```

### Error: Puppeteer no funciona

```bash
# Instalar dependencias de Puppeteer
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## 📱 Paso 11: Acceder a la Aplicación

### 11.1 URLs de acceso

-   **Con Nginx**: `http://tu-dominio.com` o `https://tu-dominio.com`
-   **Sin Nginx**: `http://tu-ip:3003`

### 11.2 Crear primera sesión

1. Accede a la URL en tu navegador
2. Ingresa un nombre para tu sesión
3. Escanea el código QR con WhatsApp
4. Obtén tu API Key

## 🔐 Consideraciones de Seguridad

1. **Cambiar puerto SSH por defecto**
2. **Configurar fail2ban** para proteger contra ataques de fuerza bruta
3. **Usar claves SSH** en lugar de contraseñas
4. **Mantener el sistema actualizado**
5. **Configurar backup automático** de las sesiones de WhatsApp
6. **Limitar acceso por IP** si es posible

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `pm2 logs whatsapp-api`
2. Verifica el estado: `pm2 status`
3. Comprueba la conectividad: `curl http://localhost:3003`
4. Revisa los logs del sistema: `sudo journalctl -u nginx`

¡Tu API de WhatsApp ya está lista para usar en producción! 🎉
