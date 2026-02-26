import { useState } from 'react';
import { Play, BookOpen, Clock, ChevronRight, X } from 'lucide-react';
import { useAppTour } from '../hooks/useAppTour';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  steps: number;
  onStart: () => void;
}

// ─── Modal de confirmación antes de iniciar un tour ──────────────────────────
interface TourConfirmModalProps {
  tutorial: Tutorial;
  onConfirm: () => void;
  onCancel: () => void;
}

function TourConfirmModal({ tutorial, onConfirm, onCancel }: TourConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={24} />
        </button>

        {/* Ícono */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play size={32} className="text-blue-600" />
        </div>

        {/* Contenido */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
          {tutorial.title}
        </h2>
        <p className="text-gray-500 text-center text-sm mb-4">
          {tutorial.description}
        </p>

        {/* Metadatos */}
        <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock size={15} />
            {tutorial.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} />
            {tutorial.steps} pasos
          </span>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={18} />
            Iniciar Tour
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card individual de tutorial ──────────────────────────────────────────────
interface TutorialCardProps {
  tutorial: Tutorial;
  onSelect: (tutorial: Tutorial) => void;
}

function TutorialCard({ tutorial, onSelect }: TutorialCardProps) {
  return (
    <button
      onClick={() => onSelect(tutorial)}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Ícono */}
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
          <Play size={22} className="text-blue-600" />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
            {tutorial.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {tutorial.description}
          </p>

          {/* Metadatos */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {tutorial.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {tutorial.steps} pasos
            </span>
          </div>
        </div>

        {/* Flecha */}
        <ChevronRight
          size={20}
          className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
        />
      </div>
    </button>
  );
}

// ─── Página principal de Tutoriales ──────────────────────────────────────────
export default function Tutorials() {
  const { startTour } = useAppTour();
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  // ── Lista de tutoriales disponibles ──────────────────────────────────────
  const tutorials: Tutorial[] = [
    {
      id: 'main-tour',
      title: 'Primer Tour',
      description: 'Conoce la app completa junto a sus funciones. Un recorrido guiado por todas las secciones de Wappy.',
      duration: '~1 min',
      steps: 11,
      onStart: () => {
        startTour();
      },
    },
    // Aquí puedes agregar más tutoriales en el futuro:
    // {
    //   id: 'messages-tour',
    //   title: 'Cómo enviar mensajes masivos',
    //   description: 'Aprende paso a paso a enviar mensajes personalizados con CSV.',
    //   duration: '~2 min',
    //   steps: 6,
    //   onStart: () => { /* tour específico de mensajes */ },
    // },
  ];

  const handleSelectTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
  };

  const handleConfirmTour = () => {
    if (!selectedTutorial) return;
    setSelectedTutorial(null);
    // Pequeño delay para que el modal cierre antes de que inicie el tour
    setTimeout(() => {
      selectedTutorial.onStart();
    }, 150);
  };

  const handleCancelModal = () => {
    setSelectedTutorial(null);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
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

      {/* ── Grid de tutoriales ────────────────────────────────────────────── */}
      <div className="space-y-3">
        {tutorials.map((tutorial) => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
            onSelect={handleSelectTutorial}
          />
        ))}
      </div>

      {/* ── Estado vacío (solo si no hay tutoriales) ─────────────────────── */}
      {tutorials.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay tutoriales disponibles</p>
          <p className="text-sm mt-1">Próximamente se agregarán nuevas guías.</p>
        </div>
      )}

      {/* ── Modal de confirmación ─────────────────────────────────────────── */}
      {selectedTutorial && (
        <TourConfirmModal
          tutorial={selectedTutorial}
          onConfirm={handleConfirmTour}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
}