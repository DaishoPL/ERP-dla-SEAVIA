import React, { useState, useEffect } from 'react';
import { FileText, FileBadge, MapPin, Calendar, Building2, ExternalLink, Eye, Loader2, Image as ImageIcon } from 'lucide-react';

const BRIDGE_URL = 'http://localhost:4000';

// ============================================================================
// 🧩 KOMPONENT: DOKUMENTY KADROWE (KAFELEK LISTY)
// ============================================================================
export const DocumentsListWidget = ({ documents, isLoading, preview, setPreview }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
        <h3 className="font-black text-slate-800 flex items-center gap-2.5">
          <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><FileText size={16} /></div>
          Dokumenty i Certyfikaty
        </h3>
      </div>
      <div className="p-4 space-y-2">
        {documents.length === 0 && !isLoading ? (
          <p className="text-xs text-slate-400 font-medium text-center py-4">Brak dokumentów w bazie</p>
        ) : (
          documents.map(doc => {
            const isActive = preview?.data?.document_id === doc.document_id;
            
            // Bezpieczne pobieranie nazwy dokumentu
            const documentName = doc.doc_type_name || doc.document_types_dictionary?.doc_type_name || doc.doc_type_id;

            return (
              <div 
                key={doc.document_id} 
                onMouseEnter={() => setPreview({ type: 'document', data: doc })}
                onClick={() => setPreview({ type: 'document', data: doc })}
                className={`p-3 border rounded-2xl transition-all cursor-pointer group flex items-center justify-between ${
                  isActive ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                    {doc.doc_type_id}
                  </span>
                  <p className={`text-sm font-bold truncate max-w-[150px] ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                    {documentName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ważne do</p>
                  <p className={`text-xs font-bold ${isActive ? 'text-blue-800' : 'text-slate-600'}`}>{doc.expiry_date || '-'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 🧩 KOMPONENT: DOKUMENTY KADROWE (SZCZEGÓŁOWY PODGLĄD Z PLIKIEM S3)
// ============================================================================
export const DocumentPreviewPane = ({ data }) => {
  const [secureUrl, setSecureUrl] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Efekt pobierający i weryfikujący bezpieczny link
  useEffect(() => {
    if (!data || !data.file_link) {
      setSecureUrl(null);
      setHasError(false);
      return;
    }

    let isMounted = true;
    const fetchFileUrl = async () => {
      setIsLoadingFile(true);
      setHasError(false); 
      
      try {
        const res = await fetch(`${BRIDGE_URL}/api/get-secure-link?filePath=${encodeURIComponent(data.file_link)}`);
        if (res.ok) {
          const result = await res.json();
          if (isMounted && result.secureUrl) {
             
             // 🔥 WERYFIKACJA FIZYCZNEJ OBECNOŚCI PLIKU (Poprawiona)
             // Używamy metody GET (bo podpisane linki S3 często odrzucają HEAD błędem 403),
             // ale przerywamy pobieranie natychmiast po otrzymaniu nagłówków (200 OK).
             const controller = new AbortController();
             try {
               const checkRes = await fetch(result.secureUrl, { 
                 method: 'GET',
                 signal: controller.signal 
               });
               
               if (checkRes.ok) {
                 controller.abort(); // Odcinamy pobieranie ciała pliku (oszczędność transferu)
                 if (isMounted) setSecureUrl(result.secureUrl);
               } else {
                 if (isMounted) setHasError(true); // Faktyczny brak pliku w chmurze
               }
             } catch (e) {
               // Fallback w przypadku wścibskiego CORS z S3
               if (isMounted && e.name !== 'AbortError') {
                 setSecureUrl(result.secureUrl);
               }
             }

          } else {
             if (isMounted) setHasError(true);
          }
        } else {
          if (isMounted) setHasError(true);
        }
      } catch (err) {
        console.error("Błąd pobierania pliku z Mostu:", err);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoadingFile(false);
      }
    };

    fetchFileUrl();

    return () => { isMounted = false; };
  }, [data]);

  if (!data) return null;

  const isExpiring = data.expiry_date && new Date(data.expiry_date) < new Date(new Date().setMonth(new Date().getMonth() + 3));
  const isImage = data.file_link && /\.(jpeg|jpg|gif|png|webp)$/i.test(data.file_link);
  const documentName = data.doc_type_name || data.document_types_dictionary?.doc_type_name || data.doc_type_id || 'Dokument';

  return (
    <div className="p-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      
      {/* 1. NAGŁÓWEK */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 shrink-0">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 shrink-0">
          <FileText size={28} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dokument Kadrowy</p>
          <h2 className="text-xl font-black text-slate-800 leading-tight truncate" title={documentName}>
            {documentName}
          </h2>
        </div>
      </div>
      
      {/* 2. DANE TECHNICZNE */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><FileBadge size={12}/> Numer Dokumentu</p>
           <p className="text-sm font-bold text-slate-800 font-mono tracking-wide truncate" title={data.document_number}>{data.document_number}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><MapPin size={12}/> Kraj Wydania / Docelowy</p>
           <p className="text-sm font-bold text-slate-800 truncate">{data.country_id || 'Brak Danych'}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><Calendar size={12}/> Data Wydania</p>
           <p className="text-sm font-bold text-slate-800">{data.issue_date || 'Brak Danych'}</p>
        </div>
        <div className={`p-4 rounded-2xl border transition-all ${isExpiring ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
           <p className={`text-[10px] font-black uppercase mb-1.5 flex items-center gap-1.5 ${isExpiring ? 'text-red-500' : 'text-slate-400'}`}>
             <Calendar size={12}/> Ważne do
           </p>
           <p className={`text-sm font-bold ${isExpiring ? 'text-red-700' : 'text-slate-800'}`}>
             {data.expiry_date || 'Bezterminowo'}
           </p>
        </div>
      </div>

      {data.issuing_office && (
        <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><Building2 size={12}/> Organ Wydający</p>
           <p className="text-sm font-bold text-slate-800 truncate">{data.issuing_office}</p>
        </div>
      )}

      {/* 3. PODGLĄD PLIKU Z SUPABASE (S3) */}
      <div className="mt-5 border-2 border-slate-200 border-dashed rounded-3xl bg-slate-50 flex flex-col relative h-auto">
         
         {/* Pasek narzędziowy */}
         <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center z-20 shrink-0 sticky top-0 rounded-t-[1.3rem]">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              {isImage ? <ImageIcon size={14} className="text-blue-500" /> : <Eye size={14} className="text-blue-500" />}
              {isImage ? 'Skan Dokumentu (Obraz)' : 'Skan Dokumentu (PDF)'}
            </span>
         </div>

         {/* Przestrzeń wyświetlania */}
         <div className="w-full flex items-center justify-center p-2 relative bg-slate-100/50 h-auto">
            {data.file_link ? (
               isLoadingFile ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 animate-in fade-in duration-300 py-20">
                    <Loader2 className="animate-spin mb-3 text-blue-500" size={32} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Weryfikacja pliku...</p>
                  </div>
               ) : hasError ? (
                  // 🔥 CZYSTY KOMUNIKAT O BRAKU FIZYCZNEGO PLIKU ZAMIAST XML
                  <div className="text-center text-slate-400 py-20 animate-in zoom-in-95 duration-300">
                    <FileText size={32} className="mx-auto mb-3 opacity-30 text-amber-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">Brak pliku w chmurze</p>
                    <p className="text-[10px] font-medium text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                      W bazie znajduje się ścieżka, ale fizyczny plik nie został jeszcze wgrany na serwer.
                    </p>
                  </div>
               ) : secureUrl ? (
                  isImage ? (
                    <img 
                      src={secureUrl} 
                      alt="Skan Dokumentu S3" 
                      className="w-full h-auto block rounded-2xl shadow-xl border border-slate-200 bg-white animate-in zoom-in-95 duration-500"
                      onError={() => setHasError(true)} // Zabezpieczenie dla obrazów
                    />
                  ) : (
                    <div className="w-full aspect-[1/1.414] rounded-2xl border border-slate-200 shadow-xl bg-white animate-in zoom-in-95 duration-500 overflow-hidden relative flex items-center justify-center">
                      <iframe 
                        src={`${secureUrl}#toolbar=0&navpanes=0&view=Fit&scrollbar=0`} 
                        className="absolute inset-0 w-full h-full border-0 scale-[1.02] origin-center"
                        style={{ overflow: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        scrolling="no"
                        title="Podgląd dokumentu S3"
                      />
                    </div>
                  )
               ) : null
            ) : (
               <div className="text-center text-slate-400 py-20">
                  <FileText size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Brak załącznika w bazie</p>
               </div>
            )}
         </div>
         
      </div>

    </div>
  );
};