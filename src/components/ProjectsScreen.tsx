import React from 'react';
import { 
  ArrowLeft, 
  Layers, 
  Smartphone, 
  BookOpen, 
  Briefcase, 
  Package, 
  ArrowRight 
} from 'lucide-react';
import { BusinessCategory, Project } from '../types';

interface Props {
  projects: Project[];
  onBack: () => void;
  onSelectCategory: (category: BusinessCategory) => void;
}

interface CategoryOption {
  id: BusinessCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  arrowColor: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'Apps',
    name: 'Apps',
    description: 'Aplicación web, móvil o plataforma SaaS.',
    icon: <Smartphone className="w-5 h-5" />,
    iconBg: 'bg-[#181d33] border-[#262f52]',
    iconColor: 'text-[#818cf8]',
    arrowColor: 'text-[#6366f1]',
  },
  {
    id: 'Cursos Digitales',
    name: 'Cursos Digitales',
    description: 'Programa de aprendizaje online, membresía o comunidad.',
    icon: <BookOpen className="w-5 h-5" />,
    iconBg: 'bg-[#261f10] border-[#3f3219]',
    iconColor: 'text-[#eab308]',
    arrowColor: 'text-[#eab308]',
  },
  {
    id: 'Servicios',
    name: 'Servicios',
    description: 'Agencia, freelance o servicio productizado.',
    icon: <Briefcase className="w-5 h-5" />,
    iconBg: 'bg-[#10241b] border-[#1a3d2e]',
    iconColor: 'text-[#10b981]',
    arrowColor: 'text-[#10b981]',
  },
  {
    id: 'Productos Físicos',
    name: 'Productos Físicos',
    description: 'Producto físico, e-commerce o manufactura.',
    icon: <Package className="w-5 h-5" />,
    iconBg: 'bg-[#101e30] border-[#1c3352]',
    iconColor: 'text-[#38bdf8]',
    arrowColor: 'text-[#38bdf8]',
  },
];

export const ProjectsScreen: React.FC<Props> = ({
  projects,
  onBack,
  onSelectCategory,
}) => {
  const getCategoryCount = (catId: BusinessCategory) => {
    return projects.filter((p) => p.category === catId).length;
  };

  return (
    <main 
      className="w-full min-h-screen bg-[#0a0d16] text-white flex flex-col items-center justify-start selection:bg-purple-500 selection:text-white"
      id="projects-categories-root"
    >
      {/* Mobile-first centered container, gracefully responsive for tablets and desktop */}
      <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl px-5 pt-7 pb-12 flex flex-col mx-auto">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            id="btn-back-to-home"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#8e9bb0] hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Volver a Home</span>
          </button>
        </div>

        {/* Brand Tag */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-[#6366f1] flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-[#78859e] uppercase">
            SCREENOS
          </span>
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <h1 className="text-[28px] sm:text-[30px] font-black tracking-tight text-white leading-tight mb-2">
            Tus Proyectos
          </h1>
          <p className="text-[#8e9bb0] text-[13.5px] leading-relaxed font-normal">
            Selecciona el tipo de proyecto para ver o crear uno nuevo.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="space-y-3.5 sm:space-y-4">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);

            return (
              <div
                key={cat.id}
                id={`card-category-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCategory(cat.id)}
                className="bg-[#121626] hover:bg-[#151b2e] border border-[#1e243d] hover:border-[#2f395e] rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/30 flex items-center justify-between gap-4 cursor-pointer transition-all active:scale-[0.99] group"
              >
                {/* Left: Icon & Text Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Icon Box */}
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${cat.iconBg} ${cat.iconColor}`}
                  >
                    {cat.icon}
                  </div>

                  {/* Title & Description */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white font-bold text-[16px] leading-snug">
                      {cat.name}
                    </h2>
                    <p className="text-[#78859e] text-[12.5px] leading-snug mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Right: Counter badge & Arrow */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5">
                  {count > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-[#1c223c] border border-[#2c365c] text-[#818cf8] text-[11px] font-bold flex items-center justify-center">
                      {count}
                    </span>
                  ) : (
                    <span className="w-5 h-5" />
                  )}

                  <span className={`text-[13px] ${cat.arrowColor} font-bold group-hover:translate-x-1 transition-transform`}>
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
};
