# Wappy

<img width="3072" height="1677" alt="Image" src="https://github.com/user-attachments/assets/bfcd3cd4-60c2-4d3d-bdf6-b173589c08d4" />

**Wappy** es una aplicación multiplataforma para enviar mensajes masivos y gestionar grupos de WhatsApp mediante la API de Baileys. Permite autenticación con código QR, envío de mensajes personalizados desde archivos CSV/Excel con variables dinámicas, creación de grupos, y gestión de chats.

## ✨ Características Principales

- 🖥️ **Aplicación de Escritorio - Web**: Construida con React (para la Web) + Electron (para Windows, macOS y Linux)
- 📱 **Autenticación WhatsApp**: Vinculación mediante código QR
- 📧 **Mensajes Masivos**: Envío personalizado desde CSV/Excel con variables dinámicas
- 👥 **Gestión de Grupos**: Creación automática de grupos con links de invitación
- 💬 **Gestión de Chats**: Visualización y búsqueda de conversaciones en tiempo real
- 📎 **Multimedia**: Soporte para imágenes, videos, documentos y audio
- ⚡ **Configuración de Envío**: Control de tiempo de espera entre mensajes para evitar bloqueos

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos partes principales: **Frontend (React + TypeScript)** y **Backend (Node.js + Express)**.


```
wappy/
├── frontend/              # Frontend - Aplicación React + Electron
│   ├── src/               # Código fuente React
│   ├── electron/          # Configuración de Electron
│   └── package.json       # Dependencias y scripts de Electron
├── server/                # Backend - API Node.js + WhatsApp Integration
│   ├── index.js           # Servidor Express + Socket.io
│   ├── routes/            # Rutas de la API
│   └── auth_info/         # Credenciales de WhatsApp (Baileys)
└── iniciar-proyecto.bat   # Script de inicio automático (Windows)
```

**Stack Tecnológico**:
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Desktop**: Electron (aplicación de escritorio multiplataforma)
- **Backend**: Node.js + Express + Socket.io
- **WhatsApp API**: Baileys (conexión no oficial a WhatsApp)

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- **Git** (opcional, para clonar el repositorio)

### Opción 1: Instalación Automática con Script (Windows)

La forma más fácil de iniciar el proyecto en Windows es usando el script `iniciar-proyecto.bat`:

#### 1. Clonar o descargar el proyecto
```bash
git clone https://github.com/tu-usuario/wappy.git
cd wappy
```

#### 2. Ejecutar el script de inicio
```bash
iniciar-proyecto.bat
```

#### 3. Seleccionar opción 1 - Instalar/Verificar Paquetes
El script automáticamente:
- ✅ Verifica la existencia de las carpetas `server` y `frontend`
- ✅ Instala dependencias del backend
- ✅ Instala dependencias del frontend (incluyendo Electron)
- ✅ Verifica actualizaciones de paquetes

#### 4. Seleccionar opción 2 - Iniciar Servicios
El script:
- ✅ Inicia el backend (Node.js en puerto 3005)
- ✅ Inicia el frontend con Electron en modo desarrollo
- ✅ Abre automáticamente la aplicación de escritorio

**Menú del Script**:
```
============================================================
                         Wappy                        
============================================================

 [1] Instalar/Verificar Paquetes
 [2] Iniciar Servicios
 [3] Apagar Servicios
 [4] Salir
============================================================
              Author: Cristian Ramirez
============================================================
```

### Opción 2: Instalación Manual

#### 1. Instalar dependencias del Backend
```bash
cd server
npm install
```

#### 2. Instalar dependencias del Frontend
```bash
cd frontend
npm install
```

#### 3. Iniciar el Backend
```bash
cd server
node index.js
```

#### 4. Iniciar el Frontend como sistema Web (en otra terminal)
```bash
cd frontend
npm run dev
```
#### 5. Iniciar el Frontend como aplicación de Escritorio (en otra terminal)
```bash
cd frontend
npm run electron:dev
```


---

### 🎬 Demostración de Inicio

![Proceso de inicio del proyecto](https://github.com/user-attachments/assets/6588e9f1-528b-4bd3-9bf8-0e4ebdfc03fd)

*GIF mostrando el proceso completo de inicialización del backend y frontend*

---

## 🎯 Uso de la Aplicación

### 1. Primera vez - Autenticación WhatsApp

1. Ejecutar el proyecto con el script `.bat` o manualmente
2. La aplicación se abrirá automáticamente
3. Ir a la sección **"QR"** en el menú
4. Escanear el código QR con tu WhatsApp (WhatsApp > Dispositivos Vinculados > Vincular dispositivo)
5. Una vez autenticado, aparecerá un mensaje de éxito ✅

![Proceso de autenticación con código QR](https://github.com/user-attachments/assets/7b7cc3b0-7833-4f96-9d4f-f7ff8c60c954)

*Demostración del proceso de escaneo del código QR y autenticación exitosa*

### 2. Envío de Mensajes Masivos

1. Ir a la sección **"Mensajes"**
2. Cargar un archivo CSV/Excel con las siguientes columnas mínimas:
   ```csv
   telefono,nombre,apellido
   573001234567,Juan,Perez
   573009876543,Maria,Lopez
   ```
3. Escribir el mensaje usando variables dinámicas:
   ```
   Hola {{nombre}} {{apellido}}, este es un mensaje personalizado para ti.
   ```
4. (Opcional) Adjuntar imagen, video o documento
5. Configurar tiempo de espera entre mensajes (recomendado: 30 segundos)
6. Hacer clic en **"Enviar Mensajes"**

**Variables disponibles**: Cualquier columna del CSV puede usarse como `{{nombre_columna}}`

<img width="1888" height="994" alt="Image" src="https://github.com/user-attachments/assets/065b44f4-64e2-49aa-9018-cc079cfb1b26" />

### 3. Creación de Grupos

1. Ir a la sección **"Grupos"**
2. Cargar un archivo CSV/Excel con:
   ```csv
   nombre_grupo,participantes
   "Grupo Ventas","573001234567,573009876543,573005556789"
   "Grupo Soporte","573002223344;573007778899"
   ```
   > Nota: Los participantes se pueden separar con `,` o `;`
3. Hacer clic en **"Crear Grupos"**
4. El sistema creará los grupos y generará links de invitación
5. Descargar el archivo Excel con los resultados y links

<img width="1883" height="983" alt="Image" src="https://github.com/user-attachments/assets/06c0657c-138d-4048-bf9e-4af8995e168f" />

### 4. Agregar Participantes a un Grupo

1. Ir a la sección **"Agregar"**
2. Seleccionar el grupo destino del desplegable (se carga automáticamente desde WhatsApp)
3. Cargar un archivo CSV con el siguiente formato:
   ```csv
   telefono,admin
   591701234567,true
   591709876543,false
   591703334455,
   ```
   - `telefono` — **obligatoria**: número con código de país, sin `+` ni espacios
   - `admin` — **opcional**: `true` para promover como administrador, vacío o `false` para no hacerlo
4. Configurar el tiempo de espera entre adiciones (mínimo 25 segundos)
5. Hacer clic en **"Agregar al grupo"**
6. Al finalizar, el modal de resumen muestra el estado por número y permite descargar el reporte en Excel

### 5. Gestión de Chats

1. Ir a la sección **"Chats"**
2. Ver lista de conversaciones activas
3. Usar el buscador para filtrar chats
4. Los mensajes nuevos se actualizan en tiempo real

---

## 📁 Estructura del Frontend (`frontend/src`)

### 📂 Directorio Raíz (`src/`)

```
src/
├── App.tsx                    # Componente principal con configuración de rutas
├── App.css                    # Estilos del componente App
├── main.tsx                   # Punto de entrada de la aplicación React
├── index.css                  # Estilos globales de la aplicación
├── Config.ts                  # Configuración de URLs de la API
├── vite-env.d.ts              # Declaraciones de tipos para Vite
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
├── Notification.tsx          # Sistema global de notificaciones y modal de resultados
└── Alert.tsx                 # Componente de alertas toast (Sonner)
```

#### `Navbar.tsx`
- **Propósito**: Barra de navegación de la aplicación
- **Funcionalidad**:
  - Navegación entre secciones (QR, Mensajes, Grupos, Agregar, Chats)
  - Resalta la página activa
  - Diseño responsivo con Tailwind CSS

#### `Notification.tsx`
- **Propósito**: Sistema global de notificaciones de progreso y modal de resultados
- **Funcionalidad**:
  - Toast flotante en tiempo real con progreso actual (`X de Y`)
  - Botón para detener el proceso en curso con confirmación
  - Toast de resumen al finalizar (clicable para abrir el modal)
  - Modal con tabla de resultados individuales por tipo de operación:
    - **Mensajes**: teléfono + estado (Enviado / Error)
    - **Grupos**: nombre del grupo + estado (Creado / Error)
    - **Agregar**: teléfono + estado + columna de admin con ícono de escudo si fue promovido + motivo del error si aplica
  - Botón "📥 Descargar Excel" disponible en el modal para grupos creados y adiciones al grupo
  - Fondo con efecto blur (`backdrop-blur-md`) al abrir el modal
  - Soporta procesos cancelados mostrando resumen parcial

#### `Alert.tsx`
- **Propósito**: Utilidad para mostrar alertas tipo toast
- **Funcionalidad**:
  - Wrapper de Sonner para alertas consistentes en toda la app
  - Métodos: `alert.error()`, `alert.success()`, `alert.warning()`, `alert.info()`

---

### 📂 `src/pages/` - Páginas de la Aplicación

```
pages/
├── Qr.tsx                    # Página de autenticación con QR de WhatsApp
├── Message.tsx               # Página de envío de mensajes masivos
├── Group.tsx                 # Página de creación de grupos
├── AddToGroup.tsx            # Página de adición masiva de participantes a grupos
└── Chats.tsx                 # Página de gestión de chats en tiempo real
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

#### `AddToGroup.tsx`
- **Propósito**: Adición masiva de participantes a un grupo existente
- **Funcionalidad**:
  - Carga la lista de grupos del WhatsApp vinculado desde la API
  - Selector de grupo destino con contador de miembros actuales
  - Botón de actualizar para recargar la lista de grupos
  - Carga de CSV con columnas `telefono` (obligatoria) y `admin` (opcional)
  - Detecta automáticamente si el CSV tiene columna `admin` y muestra el conteo de admins a promover
  - Cancela el proceso en cualquier momento manteniendo el reporte parcial
  - Integrado con el sistema global de notificaciones (progreso persistente al cambiar de página)

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
- **Propósito**: Gestión global del estado de operaciones en progreso (mensajes, grupos, adiciones)
- **Estado**:
  - `sending`: Boolean, indica si hay una operación en progreso
  - `finished`: Boolean, indica si la operación terminó
  - `cancelled`: Boolean, indica si fue detenida manualmente
  - `current`: Elemento actual procesándose (teléfono o nombre de grupo)
  - `index` / `total`: Progreso actual y total de elementos
  - `type`: Tipo de operación — `'mensaje'` | `'grupo'` | `'agregar'`
  - `results`: Array con resultados simplificados `{ telefono?, grupo?, status }`
  - `addedResults`: Array con resultados detallados de adiciones `{ telefono, status, reason, makeAdmin, adminStatus }`
  - `createdGroups`: Array de grupos creados con sus datos para el Excel
  - `loading`: Estado de carga general
- **Funciones**:
  - `start(total, type)`: Inicia una operación
  - `update(current, index)`: Actualiza el progreso
  - `addResult(data)`: Registra el resultado de un elemento
  - `finish()`: Marca la operación como finalizada
  - `cancel()`: Solicita la cancelación del proceso
  - `clear()`: Limpia todo el estado
  - `getCancelRef()`: Devuelve la `ref` compartida para cancelación sin re-renders
  - `setCreatedGroups(groups)`: Guarda los grupos creados para el Excel
  - `setAddedResults(results)`: Guarda los resultados detallados de adición para el Excel

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
    ├── message.js             # Envío de mensajes (texto y multimedia)
    ├── group.js               # Creación de grupos
    ├── addtogroup.js          # Adición de participantes a grupos existentes
    └── chats.js               # Gestión de chats en tiempo real
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

`POST /api/send-messages`
```json
// Request
{
  "messages": [
    { "telefono": "591701234567", "mensaje": "Hola Juan, bienvenido." }
  ],
  "waitTime": 25000
}

// Response
{
  "success": true,
  "results": [
    { "telefono": "591701234567", "success": true, "messageId": "ABCD1234" }
  ],
  "totalSent": 1,
  "totalFailed": 0
}
```

`POST /api/send-messages-media` *(multipart/form-data)*
- Campo `media`: archivo de imagen, video o audio (máx. 50MB)
- Campo `data`: JSON con `{ messages: [...], waitTime: number }`
- El mensaje se envía como `caption` para imágenes y videos; los audios se envían sin caption

---
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
- Recibe array de grupos con nombres y participantes
- Formatea números de participantes
- Crea grupos usando `sock.groupCreate()`
- Genera links de invitación con `sock.groupInviteCode()`
- Retorna resultados con links para cada grupo

**Endpoints**:

`POST /api/create-groups`
```json
// Request
{
  "groupTitle": "Equipo @ciudad",
  "groupDesc": "Grupo oficial de @ciudad",
  "descEnabled": true,
  "addAdmin": true,
  "adminNumber": "591700000000",
  "waitTime": 30,
  "csvFields": ["nombre", "ciudad", "telefono"],
  "csvRows": [
    { "nombre": "Juan", "ciudad": "Santa Cruz", "telefono": "591701234567" }
  ]
}

// Response
{
  "success": true,
  "groups": [
    {
      "groupId": "120363XXXXXXXXXX@g.us",
      "title": "Equipo Santa Cruz",
      "inviteCode": "XXXXXXXXXXXXXXXX"
    }
  ]
}
```

El link de invitación se construye como `https://chat.whatsapp.com/{inviteCode}`.

**Proceso**:
1. Recibe array de grupos
2. Para cada grupo:
   - Formatea participantes
   - Crea el grupo
   - Genera código de invitación
   - Construye link de invitación
   - Registra resultado

---


#### `addtogroup.js`
**Propósito**: Adición de participantes a un grupo existente, con soporte para promover administradores

**Endpoints**:

`GET /api/groups`
```json
// Response — lista de grupos del WhatsApp vinculado, ordenada alfabéticamente
[
  { "id": "120363XXXXXXXXXX@g.us", "name": "Equipo Ventas", "participantsCount": 12 },
  { "id": "120363YYYYYYYYYY@g.us", "name": "Soporte Clientes", "participantsCount": 5 }
]
```

`POST /api/add-to-group`
```json
// Request
{
  "groupId": "120363XXXXXXXXXX@g.us",
  "phones": [
    { "telefono": "591701234567", "makeAdmin": true },
    { "telefono": "591709876543", "makeAdmin": false }
  ],
  "waitTime": 25
}

// Response
{
  "success": true,
  "results": [
    {
      "telefono": "591701234567",
      "status": "agregado",
      "reason": "Agregado exitosamente",
      "makeAdmin": true,
      "adminStatus": "promovido"
    },
    {
      "telefono": "591709876543",
      "status": "error",
      "reason": "El número no existe en WhatsApp",
      "makeAdmin": false,
      "adminStatus": "no_agregado"
    }
  ]
}
```

**Valores de `status`**: `"agregado"` | `"error"`

**Valores de `adminStatus`**:
- `"promovido"` — fue agregado y promovido como administrador exitosamente
- `"error_al_promover"` — fue agregado pero falló la promoción a admin
- `"no_agregado"` — no se intentó promover porque la adición falló
- `null` — `makeAdmin` era `false`, no se intentó promoción

**Formato de la columna `admin` en el CSV**:

| Valor en CSV | Interpretación |
|---|---|
| `true`, `1`, `yes`, `si`, `sí` | Se promueve como admin |
| `false`, `0`, vacío | No se promueve |

---


#### `chats.js`
**Propósito**: Obtención de conversaciones activas

**Funcionalidades**:
- Obtiene lista de chats desde Baileys `store.chats`
- Filtra solo conversaciones personales (no grupos ni broadcasts)
- Extrae información de contacto (nombre, número)
- Obtiene último mensaje de cada chat
- Retorna lista formateada de chats

`GET /api/chats`
```json
// Response
[
  { "number": "591701234567", "messages": [] },
  { "number": "591709876543", "messages": [] }
]
```

`GET /api/chats/:number`
```json
// Response — historial de mensajes del número
[
  { "fromMe": false, "text": "Hola, ¿cómo están?", "timestamp": 1700000000000 },
  { "fromMe": true,  "text": "¡Todo bien, gracias!", "timestamp": 1700000005000 }
]
```

`POST /api/chats/:number`
```json
// Request
{ "message": "Hola, te escribimos de Wappy." }

// Response
{ "success": true }
```

Los mensajes recibidos se registran automáticamente desde el listener de Baileys en `index.js` y se emiten vía Socket.io con el evento `new-message`.

---

## 🔐 Seguridad y Privacidad

### Almacenamiento de Credenciales

Las credenciales de WhatsApp se almacenan localmente en:
```
server/auth_info/
```

**⚠️ Importante**:
- Esta carpeta contiene datos sensibles de autenticación
- NO compartir ni subir a repositorios públicos
- Incluir en `.gitignore`:
```gitignore
# .gitignore
server/auth_info/
```

### Políticas de WhatsApp

Para evitar bloqueos o restricciones:

1. **Tiempo de espera**: Usar mínimo 25-30 segundos entre mensajes
2. **Personalización**: Usar variables dinámicas para evitar spam
3. **Límites diarios**: 
   - No enviar más de 100-150 mensajes por día
   - No crear más de 30-45 grupos por día
4. **Números válidos**: Verificar que existan en WhatsApp antes de enviar
5. **Contenido apropiado**: Evitar links sospechosos o contenido spam

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
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### 13. **Grupos no aparecen en el selector de "Agregar"**

**Problema**: El desplegable de grupos está vacío

**Causas**:
- No hay sesión activa de WhatsApp
- El usuario no es administrador de ningún grupo

**Solución**:
- Verificar que el QR esté escaneado y la sesión activa
- Hacer clic en el botón **"Actualizar"** junto al selector
- Confirmar que la cuenta tiene grupos creados o en los que es admin

---

## 📊 API Endpoints


## Resumen de API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/groups` | Lista los grupos del WhatsApp vinculado |
| `POST` | `/api/add-to-group` | Agrega participantes a un grupo existente |
| `POST` | `/api/send-messages` | Envía mensajes de texto masivos |
| `POST` | `/api/send-messages-media` | Envía mensajes con archivo multimedia |
| `POST` | `/api/create-groups` | Crea grupos masivamente desde CSV |
| `GET` | `/api/chats` | Obtiene lista de conversaciones activas |
| `GET` | `/api/chats/:number` | Obtiene mensajes de una conversación |
| `POST` | `/api/chats/:number` | Envía un mensaje a un número |

### Socket.io Events

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `qr` | Server → Client | Envía código QR en base64 para escanear |
| `authenticated` | Server → Client | Notifica autenticación exitosa |
| `logout` | Server → Client | Notifica cierre de sesión |
| `logout` | Client → Server | Solicita cerrar sesión |
| `new-message` | Server → Client | Notifica mensaje entrante en tiempo real |

---

## 📚 Recursos Adicionales

- **Documentación oficial de Baileys**: [GitHub - WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)
- **Electron Documentation**: [Electron Docs](https://www.electronjs.org/docs/latest/)
- **Límites de WhatsApp**: [WhatsApp Business API Limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- **Socket.io Docs**: [Socket.io Documentation](https://socket.io/docs/v4/)
- **React Docs**: [React Documentation](https://react.dev/)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## ⚠️ **Recomendaciones**:

- Usar con cuentas de prueba primero
- Respetar los límites de WhatsApp
- No hacer spam
- Usar para propósitos legítimos

---

## 📄 Licencia

Este proyecto es de código abierto y fue realizado por **Cristian David Ramirez Callejas**.
