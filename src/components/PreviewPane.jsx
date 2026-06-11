import React from 'react';
import { Eye } from 'lucide-react';

// Importujemy widoki szczegółowe z Twoich wydzielonych "klocków"
import { DocumentPreviewPane } from './TechnicianDocuments';
import { PPEPreviewPane } from './TechnicianPPE';
import { ProjectPreviewPane } from './TechnicianProjects';
import { LogisticsPreviewPane } from './TechnicianLogistics';
import { SkillsPreviewPane } from './TechnicianSkills';

export default function PreviewPane({ preview }) {
  
  /**
   * Funkcja decydująca o tym, co wyświetlić w środku ramki.
   * Reaguje na zmianę stanu 'preview' przekazanego z góry (TechnicianProfile).
   */
  const renderContent = () => {
    
    // STAN PUSTY: Gdy użytkownik jeszcze na nic nie najechał
    if (!preview) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-10 animate-in fade-in zoom-in-95 duration-300">
          <Eye size={48} className="mb-6 opacity-20 text-amber-500" />
          <h3 className="text-xl font-black text-slate-700 mb-4 tracking-tight">Podgląd Szczegółów</h3>
          <p className="text-sm leading-relaxed max-w-sm">
            Najedź kursorem lub kliknij w element na listach w środkowej kolumnie, aby wyświetlić tutaj wszystkie kluczowe informacje, terminy i dane historyczne.
          </p>
        </div>
      );
    }

    // Wyciągamy typ oraz dane przekazane przez konkretny widget
    const { type, data } = preview;

    // Przekazujemy sterowanie do odpowiedniego komponentu tematycznego
    switch (type) {
      case 'document': 
        return <DocumentPreviewPane data={data} />;
      case 'ppe': 
        return <PPEPreviewPane data={data} />;
      case 'project': 
        return <ProjectPreviewPane data={data} />;
      case 'logistics': 
        return <LogisticsPreviewPane data={data} />;
      case 'skills': 
        return <SkillsPreviewPane data={data} />;
      default: 
        return null;
    }
  };

  /**
   * Główny kontener "Żółtej Ramki".
   * 'h-full' sprawia, że wypełnia ona całą wysokość kolumny.
   * 'overflow-y-auto' dodaje suwak tylko dla podglądu, jeśli danych jest za dużo.
   */
  return (
    <div className="w-full h-full bg-white rounded-[2.5rem] shadow-xl shadow-amber-900/5 border-[3px] border-amber-400 flex flex-col overflow-y-auto transition-all duration-300">
      {renderContent()}
    </div>
  );
}