import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { KnowledgeBaseScreen } from './components/KnowledgeBaseScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { CategoryProjectsScreen } from './components/CategoryProjectsScreen';
import { ProjectDetailScreen } from './components/ProjectDetailScreen';
import { ProjectSummaryScreen } from './components/ProjectSummaryScreen';
import { ProjectPromptsScreen } from './components/ProjectPromptsScreen';
import { SocialCommentsScreen } from './components/SocialCommentsScreen';
import { ProjectMasterDocScreen } from './components/ProjectMasterDocScreen';
import { ProjectArchitectureScreen } from './components/ProjectArchitectureScreen';
import { ProjectScreensFlowsScreen } from './components/ProjectScreensFlowsScreen';
import { ProjectAssetsScreen } from './components/ProjectAssetsScreen';
import { ProjectHealthScreen } from './components/ProjectHealthScreen';
import { ProjectAgentsScreen } from './components/ProjectAgentsScreen';
import { ProjectLegalScreen } from './components/ProjectLegalScreen';
import { ProjectQAScreen } from './components/ProjectQAScreen';
import { ProjectAnalyticsScreen } from './components/ProjectAnalyticsScreen';
import { ProjectGTMScreen } from './components/ProjectGTMScreen';
import { MasterDocument, Project, AttachedDocument, BusinessCategory } from './types';
import { initialMasterDocument, initialProjects, initialAttachedDocuments } from './data/initialData';

type ViewMode = 
  | 'home' 
  | 'knowledge' 
  | 'categories' 
  | 'category-projects' 
  | 'project-detail' 
  | 'project-summary' 
  | 'project-prompts'
  | 'project-comments'
  | 'project-master-doc'
  | 'project-architecture'
  | 'project-screens'
  | 'project-assets'
  | 'project-health'
  | 'project-agents'
  | 'project-legal'
  | 'project-qa'
  | 'project-analytics'
  | 'project-gtm';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Persistent Attached Documents
  const [attachedDocuments, setAttachedDocuments] = useState<AttachedDocument[]>(() => {
    const saved = localStorage.getItem('screenos_attached_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialAttachedDocuments;
      }
    }
    return initialAttachedDocuments;
  });

  // Persistent Master Document info
  const [masterDocument, setMasterDocument] = useState<MasterDocument | null>(() => {
    const saved = localStorage.getItem('screenos_master_doc');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialMasterDocument;
      }
    }
    return initialMasterDocument;
  });

  // Persistent Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('screenos_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProjects;
      }
    }
    return initialProjects;
  });

  useEffect(() => {
    try {
      localStorage.setItem('screenos_attached_docs', JSON.stringify(attachedDocuments));
    } catch (e) {
      console.warn('Could not store attached docs in localStorage:', e);
    }
  }, [attachedDocuments]);

  useEffect(() => {
    if (masterDocument) {
      localStorage.setItem('screenos_master_doc', JSON.stringify(masterDocument));
    }
  }, [masterDocument]);

  useEffect(() => {
    try {
      localStorage.setItem('screenos_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('Could not store projects in localStorage:', e);
    }
  }, [projects]);

  const handleAddAttachedDocument = (newDoc: AttachedDocument) => {
    setAttachedDocuments((prev) => [newDoc, ...prev]);
    if (masterDocument) {
      setMasterDocument({
        ...masterDocument,
        name: newDoc.name,
        size: newDoc.size,
        uploadDate: newDoc.uploadDate,
        fileType: newDoc.fileType,
      });
    }
  };

  const handleUpdateAttachedDocument = (updatedDoc: AttachedDocument) => {
    setAttachedDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  };

  const handleDeleteAttachedDocument = (docId: string) => {
    setAttachedDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSaveProject = (projectToSave: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === projectToSave.id);
      if (exists) {
        return prev.map((p) => (p.id === projectToSave.id ? projectToSave : p));
      }
      return [projectToSave, ...prev];
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleSelectCategory = (category: BusinessCategory) => {
    setSelectedCategory(category);
    setCurrentView('category-projects');
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
  };

  const handleNavigateModule = (mod: string) => {
    if (mod === 'resumen') setCurrentView('project-summary');
    else if (mod === 'prompts') setCurrentView('project-prompts');
    else if (mod === 'comentarios') setCurrentView('project-comments');
    else if (mod === 'maestro') setCurrentView('project-master-doc');
    else if (mod === 'arquitectura') setCurrentView('project-architecture');
    else if (mod === 'pantallas') setCurrentView('project-screens');
    else if (mod === 'activos') setCurrentView('project-assets');
    else if (mod === 'salud') setCurrentView('project-health');
    else if (mod === 'agentes') setCurrentView('project-agents');
    else if (mod === 'legal') setCurrentView('project-legal');
    else if (mod === 'qa') setCurrentView('project-qa');
    else if (mod === 'analitica') setCurrentView('project-analytics');
    else if (mod === 'gtm') setCurrentView('project-gtm');
    else setCurrentView('project-detail');
  };

  return (
    <div className="min-h-screen bg-[#0a0d16] text-white flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* 1. HOME SCREEN */}
      {currentView === 'home' && (
        <HomeScreen
          masterDocument={masterDocument}
          projects={projects}
          onOpenDocument={() => setCurrentView('knowledge')}
          onOpenProjects={() => setCurrentView('categories')}
        />
      )}

      {/* 2. KNOWLEDGE BASE SCREEN */}
      {currentView === 'knowledge' && (
        <KnowledgeBaseScreen
          documents={attachedDocuments}
          onBack={() => setCurrentView('home')}
          onAddDocument={handleAddAttachedDocument}
          onUpdateDocument={handleUpdateAttachedDocument}
          onDeleteDocument={handleDeleteAttachedDocument}
        />
      )}

      {/* 3. BUSINESS CATEGORIES SCREEN (Tus Proyectos) */}
      {currentView === 'categories' && (
        <ProjectsScreen
          projects={projects}
          onBack={() => setCurrentView('home')}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* 4. CATEGORY PROJECTS LIST SCREEN (e.g. Apps, Cursos Digitales) */}
      {currentView === 'category-projects' && selectedCategory && (
        <CategoryProjectsScreen
          category={selectedCategory}
          projects={projects}
          onBack={() => setCurrentView('categories')}
          onSelectProject={handleSelectProject}
          onSaveProject={handleSaveProject}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {/* 5. PROJECT DETAIL SCREEN (Workspace & Hub) */}
      {currentView === 'project-detail' && selectedProject && (
        <ProjectDetailScreen
          project={selectedProject}
          onBack={() => setCurrentView('category-projects')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 6. PROJECT SUMMARY SCREEN (Resumen exact to Screenshot 1) */}
      {currentView === 'project-summary' && selectedProject && (
        <ProjectSummaryScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 7. PROJECT PROMPTS REPOSITORY SCREEN (Prompts exact to Screenshots 2, 3, 4) */}
      {currentView === 'project-prompts' && selectedProject && (
        <ProjectPromptsScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 8. PROJECT SOCIAL COMMENTS SCREEN (Comentarios de Redes Sociales) */}
      {currentView === 'project-comments' && selectedProject && (
        <SocialCommentsScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 9. PROJECT MASTER DOCUMENT SCREEN (Estrategia del Proyecto exact to Screenshots 1-7) */}
      {currentView === 'project-master-doc' && selectedProject && (
        <ProjectMasterDocScreen
          project={selectedProject}
          attachedDocuments={attachedDocuments}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 10. PROJECT ARCHITECTURE SCREEN (Arquitectura del Producto) */}
      {currentView === 'project-architecture' && selectedProject && (
        <ProjectArchitectureScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 11. PROJECT SCREENS AND FLOWS SCREEN (Pantallas y Flujos) */}
      {currentView === 'project-screens' && selectedProject && (
        <ProjectScreensFlowsScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 12. PROJECT ASSETS SCREEN (Activos del Proyecto exact to Screenshots 1-13) */}
      {currentView === 'project-assets' && selectedProject && (
        <ProjectAssetsScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 13. PROJECT HEALTH CENTER SCREEN (Centro de Salud del Proyecto) */}
      {currentView === 'project-health' && selectedProject && (
        <ProjectHealthScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 14. PROJECT AGENTS SCREEN (Agentes Especializados - Paso 10) */}
      {currentView === 'project-agents' && selectedProject && (
        <ProjectAgentsScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 15. PROJECT LEGAL & COMPLIANCE SCREEN */}
      {currentView === 'project-legal' && selectedProject && (
        <ProjectLegalScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 16. PROJECT QA & TESTING SCREEN */}
      {currentView === 'project-qa' && selectedProject && (
        <ProjectQAScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 17. PROJECT ANALYTICS & INSTRUMENTATION SCREEN */}
      {currentView === 'project-analytics' && selectedProject && (
        <ProjectAnalyticsScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}

      {/* 18. PROJECT GO-TO-MARKET SCREEN */}
      {currentView === 'project-gtm' && selectedProject && (
        <ProjectGTMScreen
          project={selectedProject}
          onBack={() => setCurrentView('project-detail')}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateModule={handleNavigateModule}
          onUpdateProject={(updated) => {
            handleSaveProject(updated);
            setSelectedProject(updated);
          }}
        />
      )}
    </div>
  );
}
