import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Music, 
  Video, 
  FileSpreadsheet, 
  CheckCircle2, 
  Copy,
  Check,
  HelpCircle,
  Tag,
  Search,
  CheckCheck,
  FileCode,
  FileType,
  ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AttachedDocument, ExtractedConceptItem } from '../types';
import { extractDocumentConcepts } from '../utils/conceptExtractor';

interface Props {
  isOpen: boolean;
  document: AttachedDocument | null;
  onClose: () => void;
  onDownload: (doc: AttachedDocument) => void;
}

export const DocumentViewerModal: React.FC<Props> = ({
  isOpen,
  document,
  onClose,
  onDownload,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedConceptId, setCopiedConceptId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<'md' | 'pdf' | null>(null);

  // Fallback to extraction if concepts array not present (calculated safely)
  const allConcepts: ExtractedConceptItem[] = useMemo(() => {
    if (!document) return [];
    if (document.concepts && document.concepts.length > 0) {
      return document.concepts;
    }
    return extractDocumentConcepts(document.name, document.extension, document.size, document.content || '').concepts;
  }, [document]);

  // Extract unique sections for filter pills
  const availableSections = useMemo(() => {
    const sections = new Set<string>();
    allConcepts.forEach(c => {
      if (c.sectionTag) {
        const primary = c.sectionTag.split('•')[0].trim();
        sections.add(primary);
      }
    });
    return Array.from(sections);
  }, [allConcepts]);

  // Filtered concepts based on search and section
  const displayConcepts = useMemo(() => {
    return allConcepts.filter(concept => {
      const matchesSearch = 
        !searchTerm.trim() ||
        concept.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (concept.question && concept.question.toLowerCase().includes(searchTerm.toLowerCase())) ||
        concept.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (concept.sectionTag && concept.sectionTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (concept.examplesByAuthor && concept.examplesByAuthor.some(a => 
          a.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.items.some(it => it.toLowerCase().includes(searchTerm.toLowerCase()))
        ));

      const matchesSection = 
        selectedSection === 'all' || 
        (concept.sectionTag && concept.sectionTag.startsWith(selectedSection));

      return matchesSearch && matchesSection;
    });
  }, [allConcepts, searchTerm, selectedSection]);

  if (!isOpen || !document) return null;

  const isAudio = document.fileType.includes('audio') || ['mp3', 'wav', 'ogg', 'm4a'].includes(document.extension.toLowerCase());
  const isVideo = document.fileType.includes('video') || ['mp4', 'webm', 'mov'].includes(document.extension.toLowerCase());
  const isImage = document.fileType.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(document.extension.toLowerCase());

  // Format single concept for markdown string
  const formatConceptForMarkdown = (c: ExtractedConceptItem, index?: number): string => {
    let out = index !== undefined ? `## ${index + 1}. ${c.title}\n\n` : `### ${c.title}\n\n`;
    if (c.sectionTag) out += `> **Sección:** ${c.sectionTag}\n\n`;
    if (c.question) out += `**¿A qué pregunta responde?**\n*${c.question}*\n\n`;
    out += `**Definición y justificación estratégica:**\n${c.definition}\n\n`;
    if (c.typicalOptions) out += `**Formato / Opciones típicas:**\n\`${c.typicalOptions}\`\n\n`;
    
    if (c.examplesByAuthor && c.examplesByAuthor.length > 0) {
      out += `**Ejemplos Prácticos por Metodología:**\n\n`;
      c.examplesByAuthor.forEach(grp => {
        out += `#### Ejemplos inspirados en ${grp.author}:\n`;
        grp.items.forEach(it => {
          out += `- ${it}\n`;
        });
        out += `\n`;
      });
    }

    if (c.generalExamples && c.generalExamples.length > 0) {
      out += `**Casos y Ejemplos:**\n\n`;
      c.generalExamples.forEach(it => {
        out += `- ${it}\n`;
      });
      out += `\n`;
    }

    return out;
  };

  // Download all concepts as Markdown file
  const handleDownloadMarkdown = () => {
    setDownloadingFormat('md');
    try {
      const header = `# DOCUMENTO MAESTRO CONCEPTUAL (1.1 - 12.7)\n\n` +
        `**Documento de origen:** ${document.name}\n` +
        `**Total de conceptos estructurados:** ${allConcepts.length}\n` +
        `**Fecha de exportación:** ${new Date().toLocaleDateString()}\n\n` +
        `---\n\n`;

      const body = allConcepts.map((c, i) => formatConceptForMarkdown(c, i)).join('\n---\n\n');
      const fullMd = header + body;

      const blob = new Blob([fullMd], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      const cleanFileName = document.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.href = url;
      link.download = `${cleanFileName}_conceptos.md`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading Markdown:', err);
    } finally {
      setTimeout(() => {
        setDownloadingFormat(null);
        setDownloadMenuOpen(false);
      }, 600);
    }
  };

  // Download all concepts as clean, professional PDF
  const handleDownloadPDF = () => {
    setDownloadingFormat('pdf');
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const maxWidth = pageWidth - margin * 2;
      let y = 18;

      // Header Brand bar
      doc.setFillColor(17, 21, 38);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('DOCUMENTO MAESTRO CONCEPTUAL (1.1 - 12.7)', margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(165, 180, 252);
      doc.text(`Origen: ${document.name} | Total conceptos: ${allConcepts.length} | Exportado: ${new Date().toLocaleDateString()}`, margin, 20);

      y = 35;

      allConcepts.forEach((c, idx) => {
        // Need new page check
        if (y > pageHeight - 32) {
          doc.addPage();
          y = 18;
        }

        // Section Tag Pill
        if (c.sectionTag) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(99, 102, 241); // Indigo
          doc.text(c.sectionTag.toUpperCase(), margin, y);
          y += 5;
        }

        // Concept Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // Slate 900
        const titleLines = doc.splitTextToSize(`${idx + 1}. ${c.title}`, maxWidth);
        doc.text(titleLines, margin, y);
        y += titleLines.length * 4.5 + 2;

        // Prompt Question that it answers
        if (c.question) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(109, 40, 217); // Purple 700
          const questionLines = doc.splitTextToSize(`Responde a: ${c.question}`, maxWidth);
          doc.text(questionLines, margin, y);
          y += questionLines.length * 4 + 2;
        }

        // Definition
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85); // Slate 700
        const defLines = doc.splitTextToSize(c.definition, maxWidth);
        defLines.forEach((line: string) => {
          if (y > pageHeight - 16) {
            doc.addPage();
            y = 18;
          }
          doc.text(line, margin, y);
          y += 4;
        });
        y += 1.5;

        // Typical Options / Format
        if (c.typicalOptions) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 18;
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text('Formato u opciones típicas:', margin, y);
          y += 3.5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          const optLines = doc.splitTextToSize(c.typicalOptions, maxWidth);
          optLines.forEach((line: string) => {
            if (y > pageHeight - 16) {
              doc.addPage();
              y = 18;
            }
            doc.text(line, margin, y);
            y += 3.8;
          });
          y += 1.5;
        }

        // Examples by Author
        if (c.examplesByAuthor && c.examplesByAuthor.length > 0) {
          c.examplesByAuthor.forEach((grp) => {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = 18;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(180, 83, 9); // Amber 700
            doc.text(`Ejemplos inspirados en ${grp.author}:`, margin, y);
            y += 3.5;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            grp.items.forEach((item) => {
              const itemLines = doc.splitTextToSize(`• ${item}`, maxWidth - 4);
              itemLines.forEach((line: string) => {
                if (y > pageHeight - 16) {
                  doc.addPage();
                  y = 18;
                }
                doc.text(line, margin + 3, y);
                y += 3.6;
              });
            });
            y += 1.5;
          });
        }

        // Divider between concepts
        y += 3;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      });

      const cleanFileName = document.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`${cleanFileName}_conceptos.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setTimeout(() => {
        setDownloadingFormat(null);
        setDownloadMenuOpen(false);
      }, 600);
    }
  };

  // Copy ALL concepts formatted
  const handleCopyAllConcepts = () => {
    const formatted = allConcepts.map((c, i) => `${i + 1}. ${formatConceptForMarkdown(c)}`).join('\n\n---\n\n');
    const header = `# CONCEPTOS EXTRAÍDOS DEL DOCUMENTO: ${document.name}\nTotal de conceptos: ${allConcepts.length}\n\n`;
    navigator.clipboard.writeText(header + formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy single concept
  const handleCopySingleConcept = (concept: ExtractedConceptItem) => {
    const text = formatConceptForMarkdown(concept);
    navigator.clipboard.writeText(text);
    setCopiedConceptId(concept.id);
    setTimeout(() => setCopiedConceptId(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      id="document-viewer-overlay"
    >
      <div 
        className="w-full max-w-3xl bg-[#0d101d] border border-[#1f2641] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden"
        id="document-viewer-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b2138] flex items-center justify-between bg-[#111526]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#1c223d] border border-[#272e50] flex items-center justify-center text-[#9d7bf6] shrink-0">
              {isAudio ? (
                <Music className="w-5 h-5" />
              ) : isVideo ? (
                <Video className="w-5 h-5" />
              ) : document.extension.toLowerCase().includes('xls') || document.extension.toLowerCase() === 'csv' ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm sm:text-base leading-tight truncate">
                {document.name}
              </h3>
              <div className="text-[11px] text-[#8e9bb0] flex items-center flex-wrap gap-2 mt-0.5">
                <span>{document.extension.toUpperCase()}</span>
                <span>•</span>
                <span>{document.size}</span>
                <span>•</span>
                {document.status === 'Completado' ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 inline" /> Completado (100%)
                  </span>
                ) : (
                  <span className="text-purple-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block" />
                    Cargando ({document.progress || 0}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-viewer"
            className="w-8 h-8 rounded-lg bg-[#1a1f35] hover:bg-[#222845] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media player preview if audio or video */}
        {isAudio && (
          <div className="p-4 bg-[#141829] border-b border-[#1f2641]">
            <p className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <Music className="w-3.5 h-3.5" /> Reproductor de Audio
            </p>
            <audio 
              controls 
              className="w-full h-10 rounded-lg accent-purple-500"
              src={document.dataUrl || undefined}
            >
              Tu navegador no soporta reproducción de audio.
            </audio>
          </div>
        )}

        {isVideo && (
          <div className="p-4 bg-[#141829] border-b border-[#1f2641]">
            <p className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <Video className="w-3.5 h-3.5" /> Reproductor de Video
            </p>
            <video 
              controls 
              className="w-full max-h-48 rounded-xl bg-black"
              src={document.dataUrl || undefined}
            >
              Tu navegador no soporta reproducción de video.
            </video>
          </div>
        )}

        {isImage && document.dataUrl && (
          <div className="p-4 bg-[#141829] border-b border-[#1f2641] flex justify-center">
            <img 
              src={document.dataUrl} 
              alt={document.name} 
              className="max-h-48 rounded-xl object-contain border border-[#272f4e]"
            />
          </div>
        )}

        {/* Body content: ONLY Extracted Concepts Generated */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-[#0a0d18]">
          
          {/* Actions Bar: Total Concepts badge + Descargar (MD / PDF) + Copiar Todos */}
          <div className="p-3.5 bg-[#12162a] border border-[#202747] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#818cf8] bg-[#1a213e] px-2.5 py-1 rounded-lg text-xs border border-[#2c3766]">
                {allConcepts.length} Conceptos Extraídos
              </span>
              <span className="text-xs text-[#9eb0d0] hidden md:inline">
                Estructura canónica 1.1 al 12.7
              </span>
            </div>

            {/* ACTION BUTTONS GROUP */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              
              {/* DESCARGAR DROPDOWN BUTTON */}
              <div className="relative flex-1 sm:flex-initial">
                <button
                  onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                  id="btn-download-concepts-dropdown"
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1b223d] hover:bg-[#252f55] border border-[#2f3c6e] text-[#a5b4fc] hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  title="Descargar todos los conceptos"
                >
                  <Download className="w-4 h-4 text-[#818cf8]" />
                  <span>Descargar</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {/* Dropdown Menu */}
                {downloadMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-1.5 w-56 bg-[#131728] border border-[#273259] rounded-xl shadow-2xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    id="menu-download-formats"
                  >
                    <button
                      onClick={handleDownloadMarkdown}
                      disabled={downloadingFormat !== null}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:bg-[#1f2746] hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                      id="btn-download-format-md"
                    >
                      <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Descargar en Markdown (.md)</div>
                        <div className="text-[10.5px] text-slate-400">Texto estructurado listo para editar</div>
                      </div>
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloadingFormat !== null}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:bg-[#1f2746] hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer border-t border-[#1e2540]"
                      id="btn-download-format-pdf"
                    >
                      <FileType className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Descargar en PDF (.pdf)</div>
                        <div className="text-[10.5px] text-slate-400">Documento profesional para imprimir</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* COPIAR TODOS BUTTON */}
              <button
                onClick={handleCopyAllConcepts}
                id="btn-copy-all-concepts"
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  copiedAll
                    ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
                }`}
                title="Copiar todos los conceptos al portapapeles"
              >
                {copiedAll ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-white" />
                    <span>¡Copiados!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar todos</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search and Module Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar entre los conceptos (ej. Identificación, Mecanismo, Todd Brown, Hormozi, Precio...)"
                className="w-full bg-[#111526] border border-[#1e2540] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#818cf8]"
                id="input-search-concepts"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {availableSections.length > 0 && (
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-[#111526] border border-[#1e2540] rounded-xl px-3 py-2 text-xs text-[#9eb0d0] focus:outline-none focus:border-[#818cf8] cursor-pointer"
                id="select-concept-section"
              >
                <option value="all">Todas las secciones ({allConcepts.length})</option>
                {availableSections.map((sec, idx) => (
                  <option key={idx} value={sec}>{sec}</option>
                ))}
              </select>
            )}
          </div>

          {/* Filter result notice */}
          {displayConcepts.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs bg-[#111526] border border-[#1e2540] rounded-2xl">
              No se encontraron conceptos que coincidan con &quot;{searchTerm}&quot;.
            </div>
          )}

          {/* List of Concepts (Each in its own clean separated card) */}
          {displayConcepts.map((concept, idx) => {
            const isSingleCopied = copiedConceptId === concept.id;

            return (
              <div 
                key={concept.id || idx}
                id={`concept-card-${concept.id || idx}`}
                className="bg-[#111526] border border-[#1e2540] hover:border-[#313c66] transition-colors rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/40 space-y-3.5 relative group"
              >
                {/* Top Row: Section Badge + Individual Copy Button */}
                <div className="flex items-center justify-between gap-2">
                  {concept.sectionTag ? (
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-[#818cf8]" />
                      <span className="text-[10.5px] font-bold tracking-wider text-[#818cf8] uppercase">
                        {concept.sectionTag}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                      Concepto {idx + 1}
                    </span>
                  )}

                  {/* INDIVIDUAL COPY BUTTON */}
                  <button
                    onClick={() => handleCopySingleConcept(concept)}
                    id={`btn-copy-concept-${concept.id || idx}`}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSingleCopied
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                        : 'bg-[#171c33] hover:bg-[#1e2544] border-[#29335a] text-[#a5b4fc] hover:text-white'
                    }`}
                    title="Copiar este concepto individual"
                  >
                    {isSingleCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar concepto</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Concept Title */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 justify-between">
                  <h4 className="text-white font-extrabold text-base sm:text-[17px] leading-snug">
                    {concept.title}
                  </h4>
                </div>

                {/* Prompt Question that it answers */}
                {concept.question && (
                  <div className="bg-[#171c33] border border-[#27315a] rounded-xl px-3.5 py-2 flex items-start gap-2 text-purple-200 text-xs sm:text-[12.5px] font-medium leading-snug">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      <span className="text-[#a5b4fc] font-semibold">Responde a la pregunta:</span>{' '}
                      {concept.question}
                    </span>
                  </div>
                )}

                {/* Main Definition & Strategic Rationale */}
                <div className="text-slate-300 text-xs sm:text-[13px] leading-relaxed space-y-2">
                  <p className="whitespace-pre-line font-normal">{concept.definition}</p>
                </div>

                {/* Typical Options / Format if applicable */}
                {concept.typicalOptions && (
                  <div className="bg-[#141b30] border border-[#243156] rounded-xl p-3 text-xs sm:text-[12px] text-indigo-300">
                    <span className="font-bold text-white block mb-0.5">Formato u Opciones típicas:</span>
                    <p className="text-indigo-200">{concept.typicalOptions}</p>
                  </div>
                )}

                {/* Author-Grouped Examples (Todd Brown, Alex Hormozi, Russell Brunson, etc.) */}
                {concept.examplesByAuthor && concept.examplesByAuthor.length > 0 && (
                  <div className="pt-2 border-t border-[#1a2038] space-y-3">
                    <span className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-wider block">
                      Ejemplos Prácticos por Metodología:
                    </span>

                    {concept.examplesByAuthor.map((authorGrp, aIdx) => (
                      <div 
                        key={aIdx} 
                        className="bg-[#141829] border border-[#212742] rounded-xl p-3 space-y-2"
                      >
                        <span className="text-xs font-bold text-amber-300/90 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Ejemplos inspirados en {authorGrp.author}
                        </span>

                        <ul className="space-y-1.5 pl-1">
                          {authorGrp.items.map((item, itIdx) => (
                            <li 
                              key={itIdx} 
                              className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                            >
                              <span className="text-purple-400 font-bold shrink-0 mt-0.5">●</span>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* General Examples fallback if no author breakdown */}
                {concept.generalExamples && concept.generalExamples.length > 0 && (
                  <div className="pt-2 border-t border-[#1a2038] space-y-2">
                    <span className="text-[11px] font-bold text-[#8e9bb0] uppercase tracking-wider block">
                      Casos y Ejemplos:
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {concept.generalExamples.map((item, gIdx) => (
                        <li 
                          key={gIdx} 
                          className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-purple-400 font-bold shrink-0 mt-0.5">●</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#1b2138] bg-[#0d101d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={handleDownloadMarkdown}
              id="btn-footer-download-md"
              className="py-2.5 px-3 rounded-xl bg-[#181d30] hover:bg-[#202742] border border-[#272e4e] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar en formato Markdown (.md)"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar .MD</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              id="btn-footer-download-pdf"
              className="py-2.5 px-3 rounded-xl bg-[#181d30] hover:bg-[#202742] border border-[#272e4e] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar en formato PDF (.pdf)"
            >
              <FileType className="w-3.5 h-3.5 text-rose-400" />
              <span>Descargar .PDF</span>
            </button>
            <button
              onClick={() => onDownload(document)}
              id="btn-viewer-download-orig"
              className="hidden sm:flex py-2.5 px-3 rounded-xl bg-[#141829] hover:bg-[#1b2038] border border-[#232a48] text-slate-300 text-xs font-medium items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar archivo original"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Archivo Original</span>
            </button>
          </div>
          <button
            onClick={onClose}
            id="btn-viewer-close"
            className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
