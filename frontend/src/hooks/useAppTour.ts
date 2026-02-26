import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useNavigate } from 'react-router-dom';

const TOUR_STORAGE_KEY = 'wappy-tour-completed';

export const useAppTour = () => {
  const navigate = useNavigate();

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
      // ─── Guardar en localStorage al cerrar o finalizar el tour ─────────
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        driverObj.destroy();
      },
      onDestroyed: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        navigate('/');
      },
      steps: [
        // Paso 1 — Bienvenida
        {
          popover: {
            title: '¡Bienvenido a Wappy! 👋',
            description:
              'Te mostraré las funciones principales de la aplicación paso a paso.',
          },
        },
        // Paso 2 — Botón toggle del sidebar
        {
          element: '#sidebar-toggle',
          popover: {
            title: 'Menú Lateral',
            description:
              'Puedes expandir o colapsar el menú lateral usando este botón para tener más espacio en pantalla.',
            side: 'right',
            align: 'center',
          },
        },
        // Paso 3 — QR
        {
          element: '[href="/"]',
          popover: {
            title: 'QR Code — Autenticación',
            description:
              'Aquí escaneas el código QR para conectar tu WhatsApp.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => {
            navigate('/');
          },
        },
        // Paso 4 — Mensajes
        {
          element: '[href="/message"]',
          popover: {
            title: 'Envío de Mensajes',
            description:
              'Desde aquí puedes enviar mensajes masivos a múltiples contactos.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => {
            navigate('/message');
          },
        },
        // Paso 5 — Grupos
        {
          element: '[href="/group"]',
          popover: {
            title: 'Gestión de Grupos',
            description:
              'Crea y administra grupos de WhatsApp de forma masiva.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => {
            navigate('/group');
          },
        },
        // Paso 6 — Agregar a grupo
        {
          element: '[href="/add-to-group"]',
          popover: {
            title: 'Agregar a Grupos',
            description:
              'Agrega contactos a grupos existentes de manera rápida.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => {
            navigate('/add-to-group');
          },
        },
        // Paso 7 — Chats
        {
          element: '[href="/chats"]',
          popover: {
            title: 'Chats',
            description:
              'Visualiza y responde los chats de WhatsApp en tiempo real.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => {
            navigate('/chats');
          },
        },
        // Paso 8 — Ayuda
        {
          element: '[href="/troubleshooting"]',
          popover: {
            title: 'Centro de Ayuda',
            description:
              '¿Tienes problemas? Aquí encontrarás soluciones a los errores más comunes.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => {
            navigate('/troubleshooting');
          },
        },
        // Paso 9 — Tutoriales
        {
          element: '[href="/tutorials"]',
          popover: {
            title: 'Tutoriales',
            description:
              'Accede a todos los tours y guías interactivas de la aplicación cuando quieras.',
            side: 'right',
            align: 'start',
          },
          onHighlighted: () => {
            navigate('/tutorials');
          },
        },
        // Paso 10 — GitHub
        {
          element: '#github-link',
          popover: {
            title: 'Repositorio en GitHub',
            description:
              'Wappy es código abierto. ¡Puedes contribuir o reportar errores aquí!',
            side: 'top',
            align: 'center',
          },
        },
        // Paso 11 — Fin
        {
          popover: {
            title: '¡Tour Completado! 🎉',
            description:
              'Ya conoces las funciones principales de Wappy. Puedes volver a ver este tour en cualquier momento desde la sección Tutoriales.',
          },
        },
      ] as DriveStep[],
    });

    driverObj.drive();
  };

  return { startTour };
};