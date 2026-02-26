import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useNavigate } from 'react-router-dom';

const TOUR_STORAGE_KEY = 'wappy-tour-completed';

export const useAppTour = () => {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────────────
  // Tour 1 — Recorrido general de la app
  // ─────────────────────────────────────────────────────────────────────────
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      popoverClass: 'driverjs-theme',
      animate: true,
      smoothScroll: true,
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        driverObj.destroy();
      },
      onDestroyed: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        navigate('/');
      },
      steps: [
        {
          popover: {
            title: '¡Bienvenido a Wappy! 👋',
            description: 'Te mostraré las funciones principales de la aplicación paso a paso.',
          },
        },
        {
          element: '#sidebar-toggle',
          popover: {
            title: 'Menú Lateral',
            description: 'Puedes expandir o colapsar el menú lateral usando este botón para tener más espacio en pantalla.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '[href="/"]',
          popover: {
            title: 'QR Code — Autenticación',
            description: 'Aquí escaneas el código QR para conectar tu WhatsApp.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => navigate('/'),
        },
        {
          element: '[href="/message"]',
          popover: {
            title: 'Envío de Mensajes',
            description: 'Desde aquí puedes enviar mensajes masivos a múltiples contactos.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => navigate('/message'),
        },
        {
          element: '[href="/group"]',
          popover: {
            title: 'Gestión de Grupos',
            description: 'Crea y administra grupos de WhatsApp de forma masiva.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => navigate('/group'),
        },
        {
          element: '[href="/add-to-group"]',
          popover: {
            title: 'Agregar a Grupos',
            description: 'Agrega contactos a grupos existentes de manera rápida.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => navigate('/add-to-group'),
        },
        {
          element: '[href="/chats"]',
          popover: {
            title: 'Chats',
            description: 'Visualiza y responde los chats de WhatsApp en tiempo real.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => navigate('/chats'),
        },
        {
          element: '[href="/troubleshooting"]',
          popover: {
            title: 'Centro de Ayuda',
            description: '¿Tienes problemas? Aquí encontrarás soluciones a los errores más comunes.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => navigate('/troubleshooting'),
        },
        {
          element: '[href="/tutorials"]',
          popover: {
            title: 'Tutoriales',
            description: 'Accede a todos los tours y guías interactivas de la aplicación cuando quieras.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => navigate('/tutorials'),
        },
        {
          element: '#github-link',
          popover: {
            title: 'Repositorio en GitHub',
            description: 'Wappy es código abierto. ¡Puedes contribuir o reportar errores aquí!',
            side: 'top',
            align: 'center',
          },
        },
        {
          popover: {
            title: '¡Tour Completado! 🎉',
            description: 'Ya conoces las funciones principales de Wappy. Puedes volver a ver este tour en cualquier momento desde la sección Tutoriales.',
          },
        },
      ] as DriveStep[],
    });

    driverObj.drive();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Tour 2 — Cómo enviar mensajes masivos
  // ─────────────────────────────────────────────────────────────────────────
  const startMessageTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      popoverClass: 'driverjs-theme',
      animate: true,
      smoothScroll: true,
      onDestroyStarted: () => { driverObj.destroy(); },
      onDestroyed:      () => { navigate('/tutorials'); },
      steps: [
        // Paso 1 — Intro
        {
          popover: {
            title: '📨 Envío de Mensajes Masivos',
            description: 'Te enseñaré paso a paso cómo enviar mensajes personalizados a múltiples contactos usando un archivo CSV.',
          },
          onHighlighted: () => navigate('/message'),
        },
        // Paso 2 — Título de la página
        {
          element: '#msg-title',
          popover: {
            title: 'Sección de Mensajes',
            description: 'Desde aquí controlas todo el proceso de envío masivo: multimedia, texto, CSV y tiempo de espera.',
            side: 'bottom',
            align: 'start',
          },
          onHighlighted: () => navigate('/message'),
        },
        // Paso 3 — Multimedia
        {
          element: '#msg-media-section',
          popover: {
            title: '📎 Archivo Multimedia (opcional)',
            description: 'Puedes adjuntar una imagen, video o audio. Si adjuntas un archivo, el mensaje se enviará como descripción (caption). Para audios, el texto no aplica como caption.',
            side: 'bottom',
            align: 'start',
          },
        },
        // Paso 4 — Textarea
        {
          element: '#msg-textarea',
          popover: {
            title: '✏️ Escribe tu Mensaje',
            description: 'Redacta aquí tu mensaje. Para personalizar cada mensaje usa el símbolo @ seguido del nombre de una columna de tu CSV. Por ejemplo: "Hola @nombre, tu código es @codigo".',
            side: 'bottom',
            align: 'start',
          },
        },
        // Paso 5 — Tiempo de espera
        {
          element: '#msg-wait-time',
          popover: {
            title: '⏱️ Tiempo de Espera',
            description: 'Establece los segundos de pausa entre cada mensaje. El mínimo recomendado es 25 segundos para evitar que WhatsApp bloquee tu número por envíos muy rápidos.',
            side: 'top',
            align: 'start',
          },
        },
        // Paso 6 — CSV upload
        {
          element: '#msg-csv-upload',
          popover: {
            title: '📂 Sube tu Archivo CSV',
            description: 'Arrastra o selecciona tu archivo CSV. Debe tener al menos una columna llamada "telefono" con los números de destino. Ejemplo de fila: 59175057788,Juan,Perez',
            side: 'top',
            align: 'start',
          },
        },
        // Paso 7 — Formato CSV
        {
          popover: {
            title: '📋 Formato del CSV',
            description: 'El CSV debe tener encabezados en la primera fila. Columna obligatoria: "telefono" (número con código de país, sin +). Las demás columnas son opcionales y sirven para personalizar el mensaje con @nombre_columna.',
          },
        },
        // Paso 8 — Todo listo
        {
          popover: {
            title: '🚀 ¡Listo para Enviar!',
            description: 'Una vez cargado el CSV y escrito el mensaje, aparecerá el botón "Enviar mensajes". Durante el envío podrás ver el progreso en la notificación y detener el proceso en cualquier momento.',
          },
        },
      ] as DriveStep[],
    });

    driverObj.drive();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Tour 3 — Cómo agregar contactos a un grupo
  // ─────────────────────────────────────────────────────────────────────────
  const startAddToGroupTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      popoverClass: 'driverjs-theme',
      animate: true,
      smoothScroll: true,
      onDestroyStarted: () => { driverObj.destroy(); },
      onDestroyed:      () => { navigate('/tutorials'); },
      steps: [
        {
          popover: {
            title: '👥 Agregar Contactos a un Grupo',
            description: 'Te enseñaré cómo agregar múltiples contactos a un grupo de WhatsApp existente, con la opción de promoverlos como administradores.',
          },
          onHighlighted: () => navigate('/add-to-group'),
        },
        {
          element: '#atg-title',
          popover: {
            title: 'Sección Agregar a Grupo',
            description: 'Desde aquí seleccionas el grupo destino, cargas el CSV con los contactos y configuras el tiempo de espera entre cada adición.',
            side: 'bottom',
            align: 'start',
          },
          onHighlighted: () => navigate('/add-to-group'),
        },
        {
          element: '#atg-group-selector',
          popover: {
            title: '🔍 Selecciona el Grupo',
            description: 'Elige el grupo al que deseas agregar los contactos. Solo aparecen los grupos en los que eres administrador. Si no ves tu grupo, haz clic en "Actualizar".',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#atg-csv-info',
          popover: {
            title: '📋 Columnas del CSV',
            description: 'Tu CSV necesita la columna "telefono" con el número incluyendo código de país (ej: 59175057788). La columna "admin" es opcional: ponla en "true" para promover a ese contacto como administrador del grupo.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#atg-csv-upload',
          popover: {
            title: '📂 Sube tu Archivo CSV',
            description: 'Arrastra o selecciona el CSV con los contactos a agregar. Cada fila representa un contacto. El proceso se ejecuta uno por uno respetando el tiempo de espera.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#atg-wait-time',
          popover: {
            title: '⏱️ Tiempo de Espera',
            description: 'El mínimo recomendado es 25 segundos entre cada adición. Agregar contactos muy rápido puede provocar que WhatsApp bloquee temporalmente tu cuenta.',
            side: 'top',
            align: 'start',
          },
        },
        {
          popover: {
            title: '🛡️ Columna Admin (opcional)',
            description: 'Si incluyes la columna "admin" en tu CSV, puedes promover contactos específicos. Ejemplo: si la fila tiene admin=true, ese contacto será agregado y luego promovido a administrador del grupo automáticamente.',
          },
        },
        {
          popover: {
            title: '🚀 ¡Listo para Agregar!',
            description: 'Una vez seleccionado el grupo y cargado el CSV, aparecerá el botón de acción. Podrás ver el progreso en tiempo real y detener el proceso cuando quieras desde la notificación.',
          },
        },
      ] as DriveStep[],
    });

    driverObj.drive();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Tour 4 — Cómo crear grupos masivamente
  // ─────────────────────────────────────────────────────────────────────────
  const startGroupTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      popoverClass: 'driverjs-theme',
      animate: true,
      smoothScroll: true,
      onDestroyStarted: () => { driverObj.destroy(); },
      onDestroyed:      () => { navigate('/tutorials'); },
      steps: [
        {
          popover: {
            title: '🏗️ Crear Grupos Masivamente',
            description: 'Te enseñaré cómo crear múltiples grupos de WhatsApp a la vez usando un CSV. Cada fila del CSV genera un grupo distinto con su propio nombre y participantes.',
          },
          onHighlighted: () => navigate('/group'),
        },
        {
          element: '#grp-title',
          popover: {
            title: 'Sección Crear Grupos',
            description: 'Desde aquí configuras todo: el CSV con los datos, el nombre de cada grupo, descripción, administrador y el tiempo entre creaciones.',
            side: 'bottom',
            align: 'start',
          },
          onHighlighted: () => navigate('/group'),
        },
        {
          element: '#grp-csv-upload',
          popover: {
            title: '📂 Sube tu Archivo CSV',
            description: 'El CSV es la base de todo. Cada fila crea un grupo diferente. Debe incluir columnas con los teléfonos de los participantes (columnas que contengan "tel", "num", "fono" o "cel" se detectan automáticamente).',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#grp-title-input',
          popover: {
            title: '✏️ Nombre del Grupo',
            description: 'Define el nombre para todos los grupos. Puedes usar etiquetas @columna para personalizarlo con los datos de cada fila del CSV. Ejemplo: "Equipo @ciudad - @empresa" generará nombres únicos por fila.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#grp-desc',
          popover: {
            title: '📝 Descripción (opcional)',
            description: 'Activa el checkbox para agregar una descripción a todos los grupos. También soporta etiquetas @columna para personalizar el texto con los datos de cada fila.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#grp-admin',
          popover: {
            title: '🛡️ Administrador Fijo (opcional)',
            description: 'Si activas esta opción, ese número será agregado como administrador en todos los grupos creados. Útil para mantener control centralizado.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#grp-columns',
          popover: {
            title: '📊 Columnas del Excel de Resultados',
            description: 'Indica qué columnas del CSV quieres incluir en el archivo Excel de resultados. Usa etiquetas @columna separadas por coma. El enlace de invitación se agrega automáticamente.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#grp-wait-time',
          popover: {
            title: '⏱️ Tiempo de Espera',
            description: 'Segundos de pausa entre la creación de cada grupo. Mínimo 25 segundos recomendados para evitar bloqueos de WhatsApp.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#grp-create-btn',
          popover: {
            title: '🚀 Crear los Grupos',
            description: 'Cuando todo esté listo, haz clic aquí. Se mostrará el progreso en tiempo real. Al finalizar podrás descargar un Excel con los enlaces de invitación de todos los grupos creados.',
            side: 'top',
            align: 'center',
          },
        },
        {
          popover: {
            title: '✅ ¡Ya sabes crear grupos!',
            description: 'Recuerda: el overlay gris que bloquea la página mientras se crean los grupos es normal. Puedes detener el proceso en cualquier momento desde la notificación azul en la esquina inferior derecha.',
          },
        },
      ] as DriveStep[],
    });

    driverObj.drive();
  };

  return { startTour, startMessageTour, startAddToGroupTour, startGroupTour };
};