import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Project } from '../types';

interface Props {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const ProjectDeleteModal: React.FC<Props> = ({
  isOpen,
  project,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'OK';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmed) {
      onConfirmDelete();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      id="project-delete-modal-overlay"
    >
      <div 
        className="w-full max-w-[390px] bg-[#121627] border border-[#212844] rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200"
        id="project-delete-modal"
      >
        {/* Header with red shield alert */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white">
            <ShieldAlert className="w-5 h-5 text-[#f87171] shrink-0 stroke-[2]" />
            <h3 className="text-[17px] font-bold text-white leading-tight">
              ¿Eliminar "{project.name}"?
            </h3>
          </div>
          <p className="text-[12.5px] text-[#8e9bb0] leading-relaxed">
            Esta acción no se puede deshacer. Se perderán todas las pantallas, flujos y documentos del proyecto.
          </p>
        </div>

        {/* Input prompt */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-2">
              Para confirmar, escribe <span className="text-[#f87171] font-bold">OK</span>:
            </label>
            <input
              type="text"
              id="delete-project-input"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="OK"
              className="w-full bg-[#0b0e19] border border-[#242d4c] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all font-mono"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              id="btn-cancel-project-delete"
              className="px-4 py-2 text-xs font-semibold text-[#8e9bb0] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isConfirmed}
              id="btn-confirm-project-delete"
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isConfirmed
                  ? 'bg-[#dc2626] hover:bg-[#ef4444] text-white shadow-lg shadow-red-950/50'
                  : 'bg-[#181d30] text-slate-500 border border-[#232a48] cursor-not-allowed opacity-60'
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
