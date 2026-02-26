import { useState } from 'react';
import { Play, BookOpen, Clock, ChevronRight, MessageCircle, UserPlus } from 'lucide-react';
import { useAppTour } from '../hooks/useAppTour';
import Modal from '../components/Modal';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  steps: number;
  icon: React.ReactNode;
  onStart: () => void;
}

// ─── Card individual ──────────────────────────────────────────────────────────
function TutorialCard({ tutorial, onSelect }: { tutorial: Tutorial; onSelect: (t: Tutorial) => void }) {
  return (
    <button
      onClick={() => onSelect(tutorial)}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
          {tutorial.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
            {tutorial.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{tutorial.description}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock size={12} />{tutorial.duration}</span>
            <span className="flex items-center gap-1"><BookOpen size={12} />{tutorial.steps} pasos</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── Página Tutoriales ────────────────────────────────────────────────────────
export default function Tutorials() {
  const { startTour, startMessageTour, startAddToGroupTour } = useAppTour();
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  const tutorials: Tutorial[] = [
    {
      id: 'main-tour',
      title: 'Primer Tour',
      description: 'Conoce la app completa junto a sus funciones. Un recorrido guiado por todas las secciones de Wappy.',
      duration: '~1 min',
      steps: 11,
      icon: <Play size={22} className="text-blue-600" />,
      onStart: startTour,
    },
    {
      id: 'message-tour',
      title: 'Cómo enviar mensajes masivos',
      description: 'Aprende a preparar tu CSV, personalizar mensajes con etiquetas y configurar el envío masivo paso a paso.',
      duration: '~2 min',
      steps: 8,
      icon: <MessageCircle size={22} className="text-blue-600" />,
      onStart: startMessageTour,
    },
    {
      id: 'add-to-group-tour',
      title: 'Cómo agregar contactos a un grupo',
      description: 'Aprende a seleccionar un grupo, preparar el CSV y agregar contactos masivamente, incluyendo la opción de promoverlos como admins.',
      duration: '~2 min',
      steps: 8,
      icon: <UserPlus size={22} className="text-blue-600" />,
      onStart: startAddToGroupTour,
    },
    // Agrega más tutoriales aquí en el futuro
  ];

  const handleConfirmTour = () => {
    if (!selectedTutorial) return;
    const tour = selectedTutorial;
    setSelectedTutorial(null);
    setTimeout(() => tour.onStart(), 150);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen size={22} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tutoriales</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Guías interactivas para aprender a usar todas las funciones de Wappy.
        </p>
      </div>

      {/* ── Lista ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {tutorials.map((t) => (
          <TutorialCard key={t.id} tutorial={t} onSelect={setSelectedTutorial} />
        ))}
      </div>

      {tutorials.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay tutoriales disponibles</p>
          <p className="text-sm mt-1">Próximamente se agregarán nuevas guías.</p>
        </div>
      )}

      {/* ── Modal de confirmación ──────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
        icon={selectedTutorial?.icon ?? <Play size={32} className="text-blue-600" />}
        title={selectedTutorial?.title ?? ''}
        description={selectedTutorial?.description}
        buttons={[
          { label: 'Cancelar',     onClick: () => setSelectedTutorial(null), variant: 'secondary' },
          { label: 'Iniciar Tour', onClick: handleConfirmTour,               variant: 'primary', icon: <Play size={18} /> },
        ]}
      >
        {selectedTutorial && (
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Clock size={15} />{selectedTutorial.duration}</span>
            <span className="flex items-center gap-1.5"><BookOpen size={15} />{selectedTutorial.steps} pasos</span>
          </div>
        )}
      </Modal>
    </div>
  );
}