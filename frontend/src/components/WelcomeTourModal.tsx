import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useAppTour } from '../hooks/useAppTour';
import Modal from './Modal';

const TOUR_STORAGE_KEY = 'wappy-tour-completed';

export default function WelcomeTourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTour } = useAppTour();

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleStart = () => {
    setIsOpen(false);
    startTour();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      icon={<Play size={32} className="text-blue-600" />}
      title="¡Bienvenido a Wappy!"
      description="¿Te gustaría hacer un tour rápido por la aplicación? Te mostraremos las funciones principales en menos de un minuto."
      buttons={[
        { label: 'No, gracias', onClick: handleSkip,  variant: 'secondary' },
        { label: 'Iniciar Tour', onClick: handleStart, variant: 'primary', icon: <Play size={18} /> },
      ]}
      footerNote="Puedes volver a ver el tour en cualquier momento desde Tutoriales."
    />
  );
}