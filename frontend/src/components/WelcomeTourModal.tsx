import { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { useAppTour } from '../hooks/useAppTour';

const TOUR_STORAGE_KEY = 'wappy-tour-completed';

export default function WelcomeTourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTour } = useAppTour();

  useEffect(() => {
    // Verificar si el usuario ya completó el tour
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    
    if (!tourCompleted) {
      // Mostrar el modal después de 1 segundo
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleStartTour = () => {
    setIsOpen(false);
    startTour();
  };

  const handleSkipTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleSkipTour}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play size={32} className="text-blue-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          ¡Bienvenido a Wappy!
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          ¿Te gustaría hacer un tour rápido por la aplicación? Te mostraremos las funciones principales en menos de un minuto.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkipTour}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            No, gracias
          </button>
          <button
            onClick={handleStartTour}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={18} />
            Iniciar Tour
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Puedes volver a ver el tour en cualquier momento desde el menú de ayuda
        </p>
      </div>
    </div>
  );
}