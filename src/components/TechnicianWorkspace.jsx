import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

// ✅ POPRAWNE IMPORTY:
// 1. Nasz nowy widget Dokumentów (ma 'export default', więc nie dajemy klamerek)
import DocumentsListWidget from './DocumentsListWidget';

// 2. TWOJE ORYGINALNE PLIKI (mają 'export const', więc MUSZĄ MIEĆ klamerki, inaczej React wybucha)
import { PPEListWidget } from './TechnicianPPE';
import { ProjectsListWidget } from './TechnicianProjects';
import { LogisticsListWidget } from './TechnicianLogistics';
import { SkillsListWidget } from './TechnicianSkills';

const API_URL = 'http://localhost:3000';

export default function TechnicianWorkspace({ tech, preview, setPreview }) {
  const [documents, setDocuments] = useState([]);
  const [ppeList, setPpeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Symulowana lista projektów
  const mockProjects = [
    {
      id: 'PROJ001',
      name: 'Budowa Statku WOD-01',
      status: 'ACT',
      start: '2025-01-01',
      end: '2025-12-31',
      pm: 'Janina Nowak (PM)',
      foremen: ['Piotr Czwarty', 'Krzysztof Piąty']
    }
  ];

  useEffect(() => {
    if (!tech?.id) return;
    
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [docsRes, ppeRes] = await Promise.all([
          fetch(`${API_URL}/v_document_alerts?technicians_id=eq.${tech.id}`),
          fetch(`${API_URL}/technicians_ppe?technicians_id=eq.${tech.id}&select=*,ppe_dictionary!ppe_type_id(ppe_name)`)
        ]);
        
        if (!docsRes.ok || !ppeRes.ok) {
          throw new Error('Błąd połączenia z serwerem API');
        }

        const docsData = await docsRes.json();
        
        // Zdefiniowany klucz priorytetów dla typów dokumentów (od 1 do 8)
        const docTypePriority = {
          'A1': 1,
          'Pasp': 2,
          'ID': 3,
          'Pass': 4,
          'Vissa': 5,
          'MC': 6,
          'DL': 7,
          'ano': 8
        };

        // ZMIANA: Tylko dokumenty wygasłe mają priorytet 1.
        // Ostrzeżenia i ważne lądują w koszyku nr 2, aby ułożyć się wg klucza.
        const getAlertPriority = (status) => {
          if (status === 'PO WYGAŚNIĘCIU') return 1;
          return 2;
        };

        // Sortowanie dwustopniowe: Najpierw wygasłe, potem klucz dokumentów
        const sortedDocs = [...docsData].sort((a, b) => {
          const alertPriorityA = getAlertPriority(a.status_alertu);
          const alertPriorityB = getAlertPriority(b.status_alertu);

          // 1. Jeśli dokument wygasł, zawsze wypchnij go na samą górę
          if (alertPriorityA !== alertPriorityB) {
            return alertPriorityA - alertPriorityB;
          }

          // 2. Reszta posłusznie układa się według Twojego klucza (1-8)
          // (Wygasłe między sobą również ułożą się wg tego klucza)
          const typePriorityA = docTypePriority[a.doc_type_id] || 99;
          const typePriorityB = docTypePriority[b.doc_type_id] || 99;

          return typePriorityA - typePriorityB;
        });

        setDocuments(sortedDocs);
        setPpeList(await ppeRes.json());
      } catch (err) {
        console.error("Błąd synchronizacji:", err);
        setError("Nie udało się pobrać szczegółowych danych z bazy.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, [tech?.id]);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pr-1 pb-10">
      
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-center gap-3 text-blue-600 shrink-0 shadow-sm">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm font-bold tracking-tight text-slate-600 uppercase">Synchronizacja modułów...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-4 flex items-center gap-3 text-red-600 shrink-0 shadow-sm">
          <AlertCircle size={20} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {/* ✅ POPRAWNE WIDGETY: */}
      <DocumentsListWidget 
        documents={documents} 
        isLoading={isLoading} 
        preview={preview} 
        setPreview={setPreview} 
      />
      
      <ProjectsListWidget 
        projectsList={mockProjects} 
        isLoading={isLoading} 
        preview={preview} 
        setPreview={setPreview} 
      />
      
      <PPEListWidget 
        ppeList={ppeList} 
        isLoading={isLoading} 
        preview={preview} 
        setPreview={setPreview} 
      />
      
      <LogisticsListWidget 
        tech={tech} 
        preview={preview} 
        setPreview={setPreview} 
      />
      
      <SkillsListWidget 
        tech={tech} 
        preview={preview} 
        setPreview={setPreview} 
      />
    </div>
  );
}