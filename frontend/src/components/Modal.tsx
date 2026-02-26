import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
}

interface ModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  /** Callback al cerrar (X o clic en overlay) */
  onClose: () => void;
  /** Ícono centrado debajo del header — cualquier ReactNode */
  icon?: ReactNode;
  /** Título principal */
  title: string;
  /** Descripción o subtítulo */
  description?: string;
  /** Contenido adicional entre la descripción y los botones */
  children?: ReactNode;
  /** Array de botones del footer */
  buttons?: ModalButton[];
  /** Nota pequeña debajo de los botones */
  footerNote?: string;
  /** Ancho máximo del modal (default: max-w-md) */
  maxWidth?: string;
  /** Si es false, el clic en el overlay no cierra el modal */
  closeOnOverlay?: boolean;
}

/**
 * Modal reutilizable.
 *
 * Uso básico:
 * ```tsx
 * <Modal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   icon={<Play size={32} className="text-blue-600" />}
 *   title="¡Bienvenido!"
 *   description="Descripción del modal."
 *   buttons={[
 *     { label: 'Cancelar',  onClick: handleCancel,  variant: 'secondary' },
 *     { label: 'Confirmar', onClick: handleConfirm, variant: 'primary', icon: <Play size={16} /> },
 *   ]}
 * />
 * ```
 */
export default function Modal({
  isOpen,
  onClose,
  icon,
  title,
  description,
  children,
  buttons = [],
  footerNote,
  maxWidth = 'max-w-md',
  closeOnOverlay = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Botón cerrar ─────────────────────────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        {/* ── Ícono ────────────────────────────────────────────────────── */}
        {icon && (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
        )}

        {/* ── Título ───────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h2>

        {/* ── Descripción ──────────────────────────────────────────────── */}
        {description && (
          <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* ── Contenido extra (metadata, listas, etc.) ─────────────────── */}
        {children && <div className="mb-4">{children}</div>}

        {/* ── Botones ──────────────────────────────────────────────────── */}
        {buttons.length > 0 && (
          <div className="flex gap-3">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  btn.variant === 'secondary'
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Nota al pie ──────────────────────────────────────────────── */}
        {footerNote && (
          <p className="text-xs text-gray-500 text-center mt-4">
            {footerNote}
          </p>
        )}
      </div>
    </div>
  );
}