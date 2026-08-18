import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { AttachedDocument } from '../types';

interface Props {
  isOpen: boolean;
  document: AttachedDocument | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  isOpen,
  document,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmText, setConfirmText] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen || !document) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'OK';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmed) {
      onConfirmDelete();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      id="delete-confirm-overlay"
    >
      <div 
        className="w-full max-w-sm bg-[#121627] border border-[#212844] rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200"
        id="delete-confirm-modal"
      >
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-[16px] font-bold text-white leading-snug">
            ¿Eliminar "{document.name.length > 35 ? document.name.slice(0, 32) + '...' : document.name}" permanentemente?
          </h3>
          <p className="text-xs text-[#8e9bb0] leading-relaxed">
            Se borrará el archivo, todo el contenido extraído y su glosario. Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Input prompt */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-2">
              Para confirmar, escribe <span className="text-[#f87171] font-bold">OK</span>:
            </label>
            <input
              type="text"
              id="delete-confirm-input"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="OK"
              className="w-full bg-[#0b0e19] border border-[#262f50] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              id="btn-cancel-delete"
              className="px-4 py-2 text-xs font-semibold text-[#8e9bb0] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isConfirmed}
              id="btn-confirm-delete"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isConfirmed
                  ? 'bg-[#dc2626] hover:bg-[#ef4444] text-white shadow-lg shadow-red-950/50'
                  : 'bg-[#1e2338] text-slate-500 border border-[#272f4e] cursor-not-allowed opacity-60'
              }`}
            >
              Eliminar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
