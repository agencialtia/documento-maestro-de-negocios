import React from 'react';
import { FileText, Layers, ArrowRight } from 'lucide-react';
import { MasterDocument, Project } from '../types';

interface Props {
  masterDocument: MasterDocument | null;
  projects: Project[];
  onOpenDocument: () => void;
  onOpenProjects: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  masterDocument,
  projects,
  onOpenDocument,
  onOpenProjects,
}) => {
  return (
    <main 
      className="w-full min-h-screen bg-[#0a0d16] text-white flex flex-col items-center justify-start selection:bg-purple-500 selection:text-white"
      id="screenos-home-root"
    >
      {/* Mobile-first centered container matching the exact mobile viewport layout, with tablet and desktop optimization */}
      <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl px-5 pt-8 pb-12 flex flex-col mx-auto">

        
        {/* Top Logo / Brand Badge */}
        <header className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-md bg-[#22183f] border border-[#3b286d] flex items-center justify-center text-[#9d7bf6]">
            <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold tracking-wider text-[#9d7bf6] uppercase font-sans">
            SCREENOS
          </span>
        </header>

        {/* Main Header */}
        <div className="mb-7">
          <h1 className="text-[32px] font-extrabold tracking-tight text-white mb-2 leading-tight">
            Home
          </h1>
          <p className="text-[#8e9bb0] text-[15px] leading-relaxed font-normal">
            Tu punto de partida para crear y gestionar cualquier negocio.
          </p>
        </div>

        {/* Action Cards Container */}
        <div className="space-y-4">
          
          {/* Card 1: Documento Maestro de Conocimiento */}
          <section 
            id="card-documento-maestro"
            onClick={onOpenDocument}
            className="group bg-[#121626] hover:bg-[#151a2e] border border-[#1e243d] hover:border-[#383268] rounded-2xl p-5 shadow-lg shadow-black/40 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Icon Container */}
              <div 
                className="w-12 h-12 rounded-xl bg-[#1d2138] border border-[#292f4e] flex items-center justify-center shrink-0 text-[#9d7bf6] mt-0.5 group-hover:border-[#443b78] transition-colors"
                aria-hidden="true"
              >
                <FileText className="w-6 h-6 stroke-[1.75]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-[17px] leading-snug mb-1.5 group-hover:text-[#c4b5fd] transition-colors">
                  Documento Maestro de Conocimiento
                </h2>
                <p className="text-[#8e9bb0] text-[13px] leading-relaxed mb-3.5 font-normal">
                  Este es el documento maestro que tiene todas las definiciones necesarias para crear cualquier tipo de negocio.
                </p>
                <button
                  type="button"
                  id="btn-adjuntar-documento"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDocument();
                  }}
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#9d7bf6] group-hover:text-[#bca1ff] transition-colors cursor-pointer"
                >
                  <span>Adjuntar documento</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </section>

          {/* Card 2: Tus proyectos */}
          <section 
            id="card-tus-proyectos"
            onClick={onOpenProjects}
            className="group bg-[#121626] hover:bg-[#151a2e] border border-[#1e243d] hover:border-[#383268] rounded-2xl p-5 shadow-lg shadow-black/40 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Icon Container */}
              <div 
                className="w-12 h-12 rounded-xl bg-[#1d2138] border border-[#292f4e] flex items-center justify-center shrink-0 text-[#9d7bf6] mt-0.5 group-hover:border-[#443b78] transition-colors"
                aria-hidden="true"
              >
                <Layers className="w-6 h-6 stroke-[1.75]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-[17px] leading-snug mb-1.5 group-hover:text-[#c4b5fd] transition-colors">
                  Tus proyectos
                </h2>
                <p className="text-[#8e9bb0] text-[13px] leading-relaxed mb-3.5 font-normal">
                  Selecciona el tipo de proyecto para ver o crear uno nuevo.
                </p>
                <button
                  type="button"
                  id="btn-ver-proyectos"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProjects();
                  }}
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#9d7bf6] group-hover:text-[#bca1ff] transition-colors cursor-pointer"
                >
                  <span>Ver proyectos</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </section>

        </div>

      </div>
    </main>
  );
};
