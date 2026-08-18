import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Smartphone, 
  BookOpen, 
  Briefcase, 
  Package, 
  Pencil, 
  Trash2, 
  Plus,
  Layers,
  Sparkles
} from 'lucide-react';
import { BusinessCategory, Project } from '../types';
import { NewProjectModal } from './NewProjectModal';

interface Props {
  category: BusinessCategory;
  projects: Project[];
  onBack: () => void;
  onSelectProject: (project: Project) => void;
  onSaveProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const CATEGORY_CONFIG: Record<
  BusinessCategory,
  {
    icon: React.ReactNode;
    emoji: string;
    description: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  Apps: {
    icon: <Smartphone className="w-5 h-5" />,
    emoji: '📱',
    description: 'Aplicación web, móvil o plataforma SaaS.',
    iconBg: 'bg-[#1a203b] border-[#2b3560]',
    iconColor: 'text-[#818cf8]',
  },
  'Cursos Digitales': {
    icon: <BookOpen className="w-5 h-5" />,
    emoji: '📖',
    description: 'Programa de aprendizaje online, membresía o comunidad.',
    iconBg: 'bg-[#292212] border-[#42361d]',
    iconColor: 'text-[#eab308]',
  },
  Servicios: {
    icon: <Briefcase className="w-5 h-5" />,
    emoji: '💼',
    description: 'Agencia, freelance o servicio productizado.',
    iconBg: 'bg-[#12281e] border-[#1d4232]',
    iconColor: 'text-[#10b981]',
  },
  'Productos Físicos': {
    icon: <Package className="w-5 h-5" />,
    emoji: '📦',
    description: 'Producto físico, e-commerce o manufactura.',
    iconBg: 'bg-[#122136] border-[#1e3658]',
    iconColor: 'text-[#38bdf8]',
  },
};

export const CategoryProjectsScreen: React.FC<Props> = ({
  category,
  projects,
  onBack,
  onSelectProject,
  onSaveProject,
  onDeleteProject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Apps;
  const categoryProjects = projects.filter((p) => p.category === category);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <main 
      className="w-full min-h-screen bg-[#0a0d16] text-white flex flex-col items-center justify-start selection:bg-purple-500 selection:text-white"
      id="category-projects-root"
    >
      {/* Mobile-first centered frame responsive to tablets and desktop */}
      <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-xl lg:max-w-2xl px-5 pt-7 pb-12 flex flex-col mx-auto">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            id="btn-back-to-categories"
            className="flex items-center gap-1 text-[13px] font-semibold text-[#8e9bb0] hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Volver</span>
          </button>
        </div>

        {/* Category Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${config.iconBg} ${config.iconColor}`}>
              {config.icon}
            </div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-white leading-tight">
              {category}
            </h1>
          </div>
          <p className="text-[#8e9bb0] text-[13.5px] leading-relaxed font-normal">
            {config.description}
          </p>
        </div>

        {/* Projects List in this category */}
        <div className="space-y-4 mb-4">
          {categoryProjects.map((project) => (
            <div
              key={project.id}
              id={`card-project-${project.id}`}
              onClick={() => onSelectProject(project)}
              className="bg-[#121626] hover:bg-[#151a2e] border border-[#1e243d] hover:border-[#35416c] rounded-2xl p-5 shadow-lg shadow-black/30 transition-all cursor-pointer group"
            >
              {/* Top Row: Category tag and Action Icons */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1d2238] border border-[#272e50] text-[#818cf8] text-[11px] font-bold">
                  <span>{config.emoji}</span>
                  <span>{category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(project, e)}
                    title="Editar proyecto"
                    className="p-1.5 rounded-lg hover:bg-[#1f2742] text-[#78859e] hover:text-white transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOpenDelete(project, e)}
                    title="Eliminar proyecto"
                    className="p-1.5 rounded-lg hover:bg-[#2e1820] text-[#78859e] hover:text-[#f87171] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-[17px] font-bold text-white mb-2 leading-snug group-hover:text-[#a5b4fc] transition-colors flex items-center justify-between">
                <span>{project.name}</span>
                <span className="text-xs text-[#818cf8] opacity-0 group-hover:opacity-100 transition-opacity font-normal">
                  Abrir →
                </span>
              </h2>

              {/* Description */}
              {project.description && (
                <p className="text-[#8e9bb0] text-[13px] leading-relaxed mb-4 font-normal">
                  {project.description}
                </p>
              )}

              {/* Target Platforms Tags */}
              {project.targetPlatforms && project.targetPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.targetPlatforms.map((plat) => (
                    <span
                      key={plat}
                      className="px-2.5 py-0.5 rounded-md bg-[#1d2238] border border-[#283050] text-[#a5b4fc] text-[11px] font-medium"
                    >
                      {plat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Large "+ Nuevo Proyecto" Button */}
        <button
          type="button"
          id="btn-add-new-project-category"
          onClick={handleOpenCreate}
          className="w-full py-4 border border-dashed border-[#262f50] hover:border-[#4f5b8c] bg-[#101423]/60 hover:bg-[#13182b] rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-[14px] transition-all cursor-pointer shadow-sm group"
        >
          <Plus className="w-4 h-4 text-[#818cf8] group-hover:scale-110 transition-transform" />
          <span>Nuevo Proyecto</span>
        </button>

      </div>

      {/* New / Edit Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        category={category}
        projectToEdit={editingProject}
        onClose={() => setIsModalOpen(false)}
        onSaveProject={onSaveProject}
      />

      {/* Delete Confirmation Modal for Project */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121627] border border-[#212844] rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-[16px] font-bold text-white">
              ¿Eliminar "{projectToDelete.name}"?
            </h3>
            <p className="text-xs text-[#8e9bb0]">
              Esta acción eliminará el proyecto y su configuración permanentemente.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#8e9bb0] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#dc2626] hover:bg-[#ef4444] text-white shadow-md cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
