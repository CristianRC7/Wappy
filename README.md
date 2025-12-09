# WhatsApp Group Message Manager

Sistema web para enviar mensajes masivos y gestionar grupos de WhatsApp mediante la API de Baileys. Permite autenticación con código QR, envío de mensajes personalizados desde archivos CSV/Excel con variables dinámicas, creación de grupos, y gestión de chats.

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos partes principales: **Frontend (React + TypeScript)** y **Backend (Node.js + Express)**.

```
whatsapp/
├── group-message-whatsapp/    # Frontend - Aplicación React
└── server/                    # Backend - API Node.js + WhatsApp Integration
```

---

## 📁 Estructura del Frontend (`group-message-whatsapp/src`)

### 📂 Directorio Raíz (`src/`)

```
src/
├── App.tsx                    # Componente principal con configuración de rutas
├── App.css                    # Estilos del componente App
├── main.tsx                   # Punto de entrada de la aplicación React
├── index.css                  # Estilos globales de la aplicación
├── Config.ts                  # Configuración de URLs de la API
├── vite-env.d.ts             # Declaraciones de tipos para Vite
├── assets/                    # Recursos estáticos (imágenes, iconos, etc.)
├── components/                # Componentes reutilizables
├── context/                   # Context API para estado global
└── pages/                     # Páginas/Vistas de la aplicación
```

### 📄 Archivos Principales

#### `main.tsx`
- **Propósito**: Punto de entrada de la aplicación React
- **Funcionalidad**: 
  - Renderiza el componente raíz `App`
  - Configura los providers de contexto (`SessionProvider`, `NotificationProvider`)
  - Inicializa componentes globales (notificaciones, toaster)

#### `App.tsx`
- **Propósito**: Componente principal con la configuración de rutas
- **Funcionalidad**:
  - Configura React Router con las rutas de la aplicación
  - Define la estructura base con navbar
  - Gestiona la navegación entre páginas

#### `Config.ts`
- **Propósito**: Archivo de configuración central
- **Funcionalidad**:
  - Define la URL base de la API (`http://localhost:3005`)
  - Centraliza configuraciones del backend

---

### 📂 `src/components/` - Componentes Reutilizables

```
components/
├── Navbar.tsx                # Barra de navegación principal
├── Notification.tsx          # Sistema de notificaciones de progreso
└── Alert.tsx                 # Componente de alertas (SweetAlert2)
```

#### `Navbar.tsx`
- **Propósito**: Barra de navegación de la aplicación
- **Funcionalidad**:
  - Navegación entre secciones (QR, Mensajes, Grupos, Chats)
  - Resalta la página activa
  - Diseño responsivo con Tailwind CSS

#### `Notification.tsx`
- **Propósito**: Muestra el progreso de envío de mensajes y creación de grupos
- **Funcionalidad**:
  - Indicador de progreso en tiempo real
  - Modal con resumen de resultados (éxitos/errores)
  - Exportación de resultados a Excel
  - Muestra links de grupos creados

#### `Alert.tsx`
- **Propósito**: Utilidad para mostrar alertas personalizadas
- **Funcionalidad**:
  - Wrapper de SweetAlert2 para alertas consistentes
  - Métodos para éxito, error, advertencia y confirmación

---

### 📂 `src/pages/` - Páginas de la Aplicación

```
pages/
├── Qr.tsx                    # Página de autenticación con QR de WhatsApp
├── Message.tsx               # Página de envío de mensajes masivos
├── Group.tsx                 # Página de creación de grupos
└── Chats.tsx                 # Página de gestión de chats
```

#### `Qr.tsx`
- **Propósito**: Autenticación de WhatsApp mediante código QR
- **Funcionalidad**:
  - Muestra código QR para vincular WhatsApp Web
  - Socket.io para recibir QR en tiempo real
  - Detecta autenticación exitosa
  - Opción de cerrar sesión (elimina credenciales)

#### `Message.tsx`
- **Propósito**: Envío masivo de mensajes personalizados
- **Funcionalidad**:
  - Carga de archivos CSV/Excel con contactos
  - Editor de mensajes con variables dinámicas (Ej: `{{nombre}}`, `{{apellido}}`)
  - Vista previa del mensaje con primer registro
  - Autocompletado de variables del CSV
  - Adjuntar imágenes/videos/documentos
  - Configuración de tiempo de espera entre mensajes
  - Validación de formato de números telefónicos

#### `Group.tsx`
- **Propósito**: Creación masiva de grupos de WhatsApp
- **Funcionalidad**:
  - Carga de archivo CSV/Excel con información de grupos
  - Procesamiento de columnas: nombre del grupo y participantes
  - Separación de múltiples participantes (comas, punto y coma)
  - Creación automática de grupos vía API
  - Generación de links de invitación
  - Descarga de resultados con links en Excel

#### `Chats.tsx`
- **Propósito**: Gestión y visualización de conversaciones
- **Funcionalidad**:
  - Lista de chats activos del WhatsApp vinculado
  - Búsqueda y filtrado de conversaciones
  - Muestra información de contactos
  - Actualización en tiempo real de nuevos mensajes

---

### 📂 `src/context/` - Estado Global con Context API

```
context/
├── Context.tsx               # Contexto de sesión/autenticación
└── NotificationContext.tsx   # Contexto de notificaciones de progreso
```

#### `Context.tsx` (SessionContext)
- **Propósito**: Gestión del estado de autenticación
- **Estado**:
  - `isAuthenticated`: Boolean que indica si WhatsApp está vinculado
- **Funciones**:
  - `setIsAuthenticated`: Actualiza el estado de autenticación

#### `NotificationContext.tsx`
- **Propósito**: Gestión del estado de notificaciones de envío
- **Estado**:
  - `sending`: Boolean, indica si hay un envío en progreso
  - `current`: Contacto/grupo actual procesándose
  - `index`: Índice actual del procesamiento
  - `total`: Total de elementos a procesar
  - `results`: Array con resultados (éxito/error)
  - `finished`: Boolean, indica si el proceso terminó
  - `type`: Tipo de operación ('mensaje' | 'grupo')
  - `loading`: Estado de carga
  - `createdGroups`: Array de grupos creados con sus links
- **Funciones**:
  - `start()`: Inicia un proceso de envío
  - `update()`: Actualiza el progreso
  - `addResult()`: Agrega un resultado
  - `finish()`: Finaliza el proceso
  - `clear()`: Limpia el estado
  - `setLoading()`: Actualiza estado de carga
  - `setCreatedGroups()`: Guarda grupos creados

---

## 📁 Estructura del Backend (`server/`)

### 📂 Directorio Raíz

```
server/
├── index.js                   # Servidor principal con Express y Socket.io
├── package.json               # Dependencias del backend
├── auth_info/                 # Credenciales y estado de WhatsApp (Baileys)
└── routes/                    # Rutas de la API
    ├── session.js             # Gestión de sesión y QR
    ├── message.js             # Envío de mensajes
    ├── group.js               # Creación de grupos
    └── chats.js               # Obtención de chats
```

---

### 📄 `index.js` - Servidor Principal

**Propósito**: Punto de entrada del backend, configura Express y Socket.io

**Funcionalidades**:
- Crea servidor HTTP con Express
- Configura Socket.io para comunicación en tiempo real
- Habilita CORS para permitir peticiones del frontend
- Registra las rutas de la API:
  - `/api/*` - Rutas de mensajes, grupos y chats
- Maneja conexiones de Socket.io para:
  - Envío de código QR al frontend
  - Notificaciones de autenticación
  - Recepción de mensajes en tiempo real
- Integra listener de mensajes entrantes de Baileys
- Escucha en puerto 3005

**Dependencias principales**:
- `express`: Framework web
- `socket.io`: Comunicación bidireccional en tiempo real
- `cors`: Middleware para habilitar CORS
- `baileys`: Librería para conectarse a WhatsApp

---

### 📂 `routes/` - Rutas de la API

#### `session.js`
**Propósito**: Gestión de la sesión de WhatsApp

**Funcionalidades**:
- Inicializa conexión con WhatsApp usando Baileys
- Genera código QR para autenticación
- Guarda credenciales en `auth_info/`
- Maneja eventos de conexión/desconexión
- Emite código QR vía Socket.io
- Endpoint para cerrar sesión (elimina credenciales)

**Endpoints**:
- `POST /logout` - Cierra sesión y elimina credenciales

**Exports**:
- `handleSocketConnection()`: Función para manejar socket de QR
- `getSock()`: Retorna instancia de conexión de Baileys

---

#### `message.js`
**Propósito**: Envío de mensajes a contactos individuales

**Funcionalidades**:
- Recibe array de contactos con datos personalizados
- Reemplaza variables en el mensaje ({{variable}})
- Formatea números telefónicos al formato de WhatsApp
- Envía mensajes con texto y/o archivos multimedia
- Maneja imágenes, videos, documentos y audio
- Espera tiempo configurable entre cada envío
- Retorna resultados individuales (éxito/error)

**Endpoints**:
- `POST /send-messages` - Envía mensajes masivos
  - Body: `{ contacts: [...], message: string, waitTime: number, media?: file }`

**Proceso**:
1. Recibe lista de contactos y mensaje plantilla
2. Para cada contacto:
   - Personaliza el mensaje con sus datos
   - Formatea el número
   - Envía vía Baileys
   - Espera tiempo configurado
   - Registra resultado

---

#### `group.js`
**Propósito**: Creación masiva de grupos de WhatsApp

**Funcionalidades**:
- Recibe array de grupos con nombre y participantes
- Formatea números de participantes
- Crea grupos usando API de Baileys
- Genera código de invitación para cada grupo
- Construye link de invitación
- Retorna lista de grupos con sus links
- Manejo de errores por grupo individual

**Endpoints**:
- `POST /create-groups` - Crea grupos masivamente
  - Body: `{ groups: [{ nombre: string, participantes: string[] }] }`

**Proceso**:
1. Recibe lista de grupos
2. Para cada grupo:
   - Formatea números de participantes
   - Crea el grupo con Baileys
   - Obtiene código de invitación
   - Genera link compartible
   - Registra resultado con link

---

#### `chats.js`
**Propósito**: Gestión y consulta de chats

**Funcionalidades**:
- Obtiene lista de todos los chats activos
- Filtra conversaciones individuales y grupales
- Extrae información de contactos
- Registra mensajes entrantes en memoria
- Asocia mensajes recibidos con su remitente
- Retorna historial de mensajes por número

**Endpoints**:
- `GET /chats` - Obtiene lista de chats
- `GET /messages/:number` - Obtiene mensajes de un contacto

**Funcionalidades adicionales**:
- `registerIncomingMessage()`: Registra mensajes recibidos
- Almacenamiento temporal de mensajes en memoria
- Filtrado y formateo de información de chats

**Exports**:
- `router`: Router de Express con endpoints
- `registerIncomingMessage()`: Función para registrar mensajes entrantes

---

## 🔧 Tecnologías y Librerías

### Frontend - Dependencias de Producción
| Librería | Versión | Descripción |
|----------|---------|-------------|
| `react` | ^19.2.0 | Librería UI para construcción de interfaces |
| `react-dom` | ^19.2.0 | Renderizado de React en el DOM |
| `react-router-dom` | ^7.9.6 | Navegación y rutas en aplicaciones React |
| `socket.io-client` | ^4.8.1 | Cliente WebSocket para comunicación en tiempo real |
| `tailwindcss` | ^4.1.17 | Framework de CSS utility-first |
| `@tailwindcss/vite` | ^4.1.17 | Plugin de Tailwind para Vite |
| `lucide-react` | ^0.554.0 | Iconos SVG para React |
| `papaparse` | ^5.5.3 | Parser de archivos CSV |
| `xlsx` | ^0.18.5 | Lectura y escritura de archivos Excel |
| `sweetalert2` | ^11.26.3 | Alertas y modales personalizados |
| `sonner` | ^2.0.7 | Notificaciones toast elegantes |

### Frontend - Dependencias de Desarrollo
| Librería | Versión | Descripción |
|----------|---------|-------------|
| `typescript` | ~5.9.3 | Superset de JavaScript con tipado estático |
| `vite` | ^7.2.4 | Build tool y dev server ultrarrápido |
| `@vitejs/plugin-react` | ^5.1.1 | Plugin oficial de Vite para React |
| `@types/react` | ^19.2.7 | Definiciones de tipos para React |
| `@types/react-dom` | ^19.2.3 | Definiciones de tipos para React DOM |
| `@types/papaparse` | ^5.5.0 | Definiciones de tipos para PapaParse |
| `eslint` | ^9.39.1 | Linter para identificar patrones problemáticos |
| `@eslint/js` | ^9.39.1 | Configuración de ESLint para JavaScript |
| `typescript-eslint` | ^8.47.0 | Plugin de ESLint para TypeScript |
| `eslint-plugin-react-hooks` | ^7.0.1 | Reglas de ESLint para React Hooks |
| `eslint-plugin-react-refresh` | ^0.4.24 | Plugin de ESLint para React Fast Refresh |
| `globals` | ^16.5.0 | Variables globales de JavaScript |

### Backend - Dependencias
| Librería | Versión | Descripción |
|----------|---------|-------------|
| `baileys` | 7.0.0-rc.9 | Librería para conectarse a WhatsApp Web API |
| `express` | ^5.1.0 | Framework web minimalista para Node.js |
| `socket.io` | ^4.8.1 | Librería WebSocket para comunicación bidireccional |
| `socket.io-client` | ^4.8.1 | Cliente Socket.io (usado internamente) |
| `cors` | ^2.8.5 | Middleware para habilitar CORS |
| `http` | ^0.0.1-security | Módulo HTTP de Node.js |
| `multer` | ^2.0.2 | Middleware para manejo de multipart/form-data (archivos) |
| `qrcode` | ^1.5.4 | Generador de códigos QR |
| `papaparse` | ^5.5.3 | Parser de CSV para Node.js |
| `link-preview-js` | ^3.2.0 | Generador de previews de links |
| `nodemon` | ^3.1.11 | Monitor de cambios para desarrollo (auto-restart)

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- **Node.js** 18+ ([Descargar aquí](https://nodejs.org/))
- **npm** (incluido con Node.js) o **yarn**

---

### 📦 Instalación de Dependencias

Antes de ejecutar el proyecto, instala las dependencias tanto del frontend como del backend.

#### 1️⃣ Instalar dependencias del Backend
```bash
cd server
npm install
```

#### 2️⃣ Instalar dependencias del Frontend
```bash
cd group-message-whatsapp
npm install
```

---

### ▶️ Ejecución del Proyecto

Para que la aplicación funcione correctamente, **debes ejecutar tanto el backend como el frontend** en terminales separadas.

#### 🔧 Paso 1: Iniciar el Servidor Backend

Abre una terminal y ejecuta:

```bash
cd server
node index
```

✅ **El servidor estará corriendo en:** `http://localhost:3005`

**Salida esperada:**
```
Servidor corriendo en el puerto 3005
Socket.io configurado correctamente
```

---

#### 🎨 Paso 2: Iniciar el Frontend

Abre **otra terminal** (manteniendo el backend activo) y ejecuta:

```bash
cd group-message-whatsapp
npm run dev
```

✅ **La aplicación estará disponible en:** `http://localhost:5173`

**Salida esperada:**
```
VITE v7.2.4  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### 🎬 Demostración de Inicio

![Proceso de inicio del proyecto](https://github.com/user-attachments/assets/6588e9f1-528b-4bd3-9bf8-0e4ebdfc03fd)

*GIF mostrando el proceso completo de inicialización del backend y frontend*

---

### 📝 Resumen de Comandos

| Acción | Comando | Puerto |
|--------|---------|--------|
| **Backend** | `cd server && node index` | 3005 |
| **Frontend** | `cd group-message-whatsapp && npm run dev` | 5173 |

> **💡 Tip**: Mantén ambas terminales abiertas mientras uses la aplicación. Si cierras alguna, esa parte del sistema dejará de funcionar.

---

### 🔄 Modo Desarrollo (Opcional)

Si estás desarrollando y quieres que el backend se reinicie automáticamente al hacer cambios:

```bash
cd server
npm run dev
```

Esto usará **nodemon** para detectar cambios y reiniciar el servidor automáticamente.

---

## 📱 Flujo de Uso

### 1. **Autenticación con WhatsApp** 🔐

Al iniciar la aplicación por primera vez, debes vincular tu cuenta de WhatsApp:

1. Abre la aplicación en `http://localhost:5173`
2. Escanea el código QR con tu WhatsApp
3. Ve a **WhatsApp > Dispositivos vinculados > Vincular un dispositivo**
4. Escanea el código QR que aparece en la pantalla
5. ✅ Una vez autenticado, verás el mensaje de éxito

![Proceso de autenticación con código QR](https://github.com/user-attachments/assets/7b7cc3b0-7833-4f96-9d4f-f7ff8c60c954)

*Demostración del proceso de escaneo del código QR y autenticación exitosa*

> **📌 Nota**: La sesión se mantiene activa mientras no cierres sesión o elimines la carpeta `auth_info/`

---

### 2. **Envío de Mensajes** 📨

Una vez autenticado, puedes enviar mensajes masivos personalizados:

1. Ve a la sección **"Mensajes"** en el menú
2. Sube un archivo CSV/Excel con contactos
   - **Obligatorio**: Columna `telefono` con código de país
   - **Opcional**: Otras columnas para personalización (nombre, apellido, ciudad, etc.)
3. Escribe el mensaje usando variables dinámicas
   - Ejemplo: `Hola {{nombre}}, te escribo desde {{ciudad}}`
   - Las variables se autocompletan según las columnas del CSV
4. **(Opcional)** Adjunta archivos multimedia (imágenes, videos, documentos)
5. Configura el tiempo de espera entre mensajes (recomendado: 25-30 segundos)
6. Haz clic en **"Enviar Mensajes"**
7. Observa el progreso en tiempo real con la barra de notificaciones

---

### 3. **Creación de Grupos** 👥

Crea múltiples grupos de WhatsApp automáticamente:

1. Ve a la sección **"Grupos"** en el menú
2. Sube un archivo CSV/Excel con la información de los grupos
   - Columna `grupo`: Nombre del grupo (puede usar variables dinámicas)
   - Las demás columnas serán los participantes a agregar
3. **(Opcional)** Agrega una descripción para todos los grupos
4. **(Opcional)** Define un usuario administrador para todos los grupos
5. Haz clic en **"Crear Grupos"**
6. Espera a que se procesen todos los grupos
7. Descarga el archivo Excel con los **links de invitación** de cada grupo creado

---

### 4. **Gestión de Chats** 💬 *(En Desarrollo)*

Esta funcionalidad está en desarrollo y próximamente permitirá:

- Visualizar todas tus conversaciones activas
- Buscar contactos específicos
- Ver mensajes recibidos en tiempo real
- Responder mensajes desde la interfaz
---

## 📝 Formato de Archivos CSV/Excel

### Para Mensajes
```csv
telefono,nombre,apellido,ciudad
59112345678, Vinchita, Mamen, Santa Cruz
573001234567,Juan,Pérez,Bogotá
573009876543,María,López,Medellín
```

### Para Grupos
```csv
grupo,
Grupo Familia,
Grupo Trabajo,
```

---

## ⚠️ Notas Importantes

- Los archivos de autenticación se guardan en `server/auth_info/`
- No compartir la carpeta `auth_info/` (contiene credenciales)
- Respetar límites de WhatsApp para evitar bloqueos
- Usar tiempos de espera prudentes entre mensajes (recomendado: 25-30 segundos)
- Los números deben tener código de país (Ej: 57 para Colombia, 591 Bolivia)

---

## 🔧 Problemas Comunes y Soluciones

### 1. **Error de Autenticación - QR no se genera**

**Problema**: El código QR no aparece en el frontend

**Causas posibles**:
- El servidor backend no está corriendo
- Socket.io no puede conectarse
- El puerto 3005 está ocupado

**Solución**:
```bash
# Verificar que el backend esté corriendo
cd server
node index.js

# Verificar que no haya errores en la consola
# Verificar en el navegador que Socket.io se conecte (Consola F12)
```

---

### 2. **Actualización de Baileys - Incompatibilidad de Versiones**

**Problema**: Baileys lanza actualizaciones frecuentes y puede haber cambios que rompan la compatibilidad

**Síntomas**:
- Error: `Cannot find module '@whiskeysockets/baileys'`
- Errores de conexión con WhatsApp
- Métodos o propiedades indefinidas
- QR no se genera o autenticación falla

**Solución**:

#### Opción 1: Mantener la versión actual (Recomendado)
```bash
cd server
# Asegurarse de usar la versión estable
npm install baileys@7.0.0-rc.9 --save-exact
```

#### Opción 2: Actualizar a la última versión
```bash
cd server
# Actualizar Baileys
npm install baileys@latest

# Si hay errores, revisar el changelog oficial:
# https://github.com/WhiskeySockets/Baileys/releases
```

**Cambios comunes en actualizaciones de Baileys**:
- Estructura de mensajes modificada
- Nombres de métodos cambiados (ej: `sendMessage` → `sendMsg`)
- Formato de números de WhatsApp actualizado
- Eventos de conexión modificados
- Estructura de autenticación actualizada

**Archivos a revisar después de actualizar**:
- `server/routes/session.js` - Verificar conexión y autenticación
- `server/routes/message.js` - Verificar `sendMessage()`
- `server/routes/group.js` - Verificar `groupCreate()` y `groupInviteCode()`
- `server/routes/chats.js` - Verificar `store.chats` y estructura de mensajes

---

### 3. **Error: "Cannot send messages" o "Not Authorized"**

**Problema**: No se pueden enviar mensajes después de autenticar

**Causas**:
- La sesión de WhatsApp expiró
- Número bloqueado por WhatsApp
- WhatsApp desvinculado del celular

**Solución**:
```bash
# 1. Eliminar credenciales antiguas
cd server
rm -rf auth_info/*  # En Windows: Remove-Item auth_info\* -Recurse

# 2. Reiniciar el servidor
node index.js

# 3. Volver a escanear el QR
```

---

### 4. **Números no se envían correctamente**

**Problema**: Mensajes no llegan o error "Invalid JID"

**Causas**:
- Formato de número incorrecto
- Falta código de país
- Caracteres especiales en el número

**Solución**:
- Asegurarse que el formato sea: `{código_país}{número}` sin espacios ni símbolos
- Ejemplo Colombia: `573001234567` (no `+57 300 123 4567`)
- Ejemplo México: `525512345678` (no `+52 55 1234 5678`)

```javascript
// El código ya maneja el formato, pero verificar en el CSV:
// ✅ Correcto
573001234567

// ❌ Incorrecto
+57 300 123 4567
57-300-123-4567
(57) 300 123 4567
```

---

### 5. **Archivos multimedia no se envían**

**Problema**: Imágenes/videos no se adjuntan a los mensajes

**Causas**:
- Archivo muy pesado (límite ~16MB en WhatsApp)
- Formato no soportado
- Error en Multer (middleware de archivos)

**Solución**:
```bash
# Verificar que Multer esté instalado
cd server
npm list multer

# Reinstalar si es necesario
npm install multer@^2.0.2
```

**Formatos soportados**:
- Imágenes: JPG, PNG, GIF, WEBP
- Videos: MP4, 3GP, AVI, MOV
- Documentos: PDF, DOC, DOCX, XLS, XLSX, TXT
- Audio: MP3, OGG, WAV, AAC

---

### 6. **Error: "Rate limit exceeded" o "Demasiados mensajes"**

**Problema**: WhatsApp bloquea temporalmente por spam

**Causas**:
- Enviar mensajes muy rápido
- Enviar el mismo mensaje a muchos contactos
- Tiempo de espera muy corto entre mensajes

**Solución**:
- **Aumentar tiempo de espera**: Usar mínimo 25-30 segundos entre mensajes
- **Variar mensajes**: Usar variables dinámicas para personalizar cada mensaje
- **Enviar en lotes**: No enviar más de 50-100 mensajes por hora
- **Esperar 24h**: Si hay bloqueo temporal, esperar antes de reintentar

```javascript
// En el frontend (Message.tsx), configurar:
waitTime: 30  // segundos (mínimo recomendado)
```

---

### 7. **Error al crear grupos - "Participant not found"**

**Problema**: No se puede agregar un participante al grupo

**Causas**:
- Número no está en WhatsApp
- Número bloqueó al creador del grupo
- Formato de número incorrecto
- Privacidad del usuario no permite ser agregado

**Solución**:
- Verificar que todos los números existan en WhatsApp
- Validar formato de números (código país + número)
- Enviar mensaje individual primero antes de agregar a grupo
- Revisar logs del servidor para ver qué número falló

---

### 8. **Frontend no se conecta al Backend**

**Problema**: Error de CORS o "Network Error"

**Causas**:
- Backend no está corriendo
- URL del backend incorrecta
- CORS no configurado

**Solución**:
```typescript
// Verificar Config.ts en el frontend
const API_URL: string = 'http://localhost:3005';

// Asegurarse que el backend esté en ese puerto
// Verificar en server/index.js:
const PORT = 3005;
```

```javascript
// Verificar CORS en server/index.js
app.use(cors()); // Debe estar antes de las rutas
```

---

### 9. **CSV/Excel no se lee correctamente**

**Problema**: Las columnas no se detectan o datos incorrectos

**Causas**:
- Codificación del archivo incorrecta
- Formato CSV con separador diferente
- Caracteres especiales en encabezados

**Solución**:
- Guardar CSV con codificación **UTF-8**
- Usar coma `,` como separador
- Encabezados sin acentos ni espacios (opcional pero recomendado)
- Primera fila debe ser los nombres de columnas

**Formato correcto**:
```csv
telefono,nombre,apellido
573001234567,Juan,Perez
573009876543,Maria,Lopez
```

---

### 10. **Sesión se desconecta frecuentemente**

**Problema**: Hay que escanear QR constantemente

**Causas**:
- Carpeta `auth_info/` se elimina
- Múltiples dispositivos conectados
- Problemas con WhatsApp

**Solución**:
- No eliminar `auth_info/` a menos que sea necesario
- Agregar `auth_info/` al `.gitignore`
- Desconectar otros WhatsApp Web activos
- Reiniciar el celular y volver a vincular

```bash
# Crear .gitignore en server/
echo "auth_info/" > .gitignore
echo "node_modules/" >> .gitignore
```

---

### 11. **Error: "Port 3005 already in use"**

**Problema**: El puerto ya está ocupado

**Solución en Windows**:
```powershell
# Ver qué proceso usa el puerto 3005
netstat -ano | findstr :3005

# Matar el proceso (usar el PID del comando anterior)
taskkill /PID <PID> /F

# O cambiar el puerto en server/index.js
const PORT = 3006; // Usar otro puerto
```

**Solución en Linux/Mac**:
```bash
# Ver proceso
lsof -i :3005

# Matar proceso
kill -9 <PID>
```

---

### 12. **Dependencias desactualizadas o conflictos**

**Problema**: Errores al instalar o ejecutar el proyecto

**Solución**:
```bash
# Backend - Reinstalar dependencias
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend - Reinstalar dependencias
cd group-message-whatsapp
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Recursos Adicionales

- **Documentación oficial de Baileys**: [GitHub - WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)
- **Límites de WhatsApp**: [WhatsApp Business API Limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- **Socket.io Docs**: [Socket.io Documentation](https://socket.io/docs/v4/)
- **React 19 Docs**: [React Documentation](https://react.dev/)

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
