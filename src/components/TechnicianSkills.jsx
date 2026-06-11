import React from 'react';
import { Award, Briefcase, Globe } from 'lucide-react';

// ============================================================================
// 🧩 KOMPONENT: UMIEJĘTNOŚCI I JĘZYKI (KAFELEK LISTY)
// ============================================================================
export const SkillsListWidget = ({ tech, preview, setPreview }) => {
  const skillsData = { 
    skills: tech?.skills || [], 
    languages: tech?.languages || [] 
  };

  const isActive = preview?.type === 'skills';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
        <h3 className="font-black text-slate-800 flex items-center gap-2.5">
          <div className="bg-rose-100 text-rose-600 p-1.5 rounded-lg"><Award size={16} /></div>
          Kompetencje i Języki
        </h3>
      </div>
      <div className="p-4 space-y-2">
         <div 
            onMouseEnter={() => setPreview({ type: 'skills', data: skillsData })}
            onClick={() => setPreview({ type: 'skills', data: skillsData })}
            className={`p-3 border rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
              isActive ? 'bg-rose-50 border-rose-200 shadow-sm ring-1 ring-rose-500' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-rose-200'
            }`}
         >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase px-2 py-1 rounded border bg-white text-slate-500 border-slate-200">
                {skillsData.skills.length} FACHÓW
              </span>
              <p className="text-sm font-bold text-slate-700">Weryfikacja kompetencji</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Języki</p>
              <p className="text-xs font-bold text-slate-600">{skillsData.languages.length}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

// ============================================================================
// 🧩 KOMPONENT: UMIEJĘTNOŚCI I JĘZYKI (SZCZEGÓŁOWY PODGLĄD)
// ============================================================================
export const SkillsPreviewPane = ({ data }) => {
  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm border border-rose-100 shrink-0">
          <Award size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kwalifikacje Pracownika</p>
          <h2 className="text-2xl font-black text-slate-800 leading-tight">Kompetencje i Języki</h2>
        </div>
      </div>

      <div className="space-y-8">
        {/* Sekcja: Wyuczone Fachy */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Briefcase size={14} /> Wyuczone Fachy
          </h3>
          {!data.skills || data.skills.length === 0 ? (
            <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">Brak przypisanych umiejętności w bazie.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">{skill.name}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div key={dot} className={`w-3 h-3 rounded-full ${dot <= parseInt(skill.level) ? 'bg-rose-500 shadow-sm shadow-rose-300' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sekcja: Języki Obce */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Globe size={14} /> Języki Obce
          </h3>
          {!data.languages || data.languages.length === 0 ? (
            <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">Brak zadeklarowanych języków.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {data.languages.map((lang, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-700">{lang.name}</span>
                    <span className="text-[10px] font-black px-2 py-1 bg-white text-slate-600 rounded-md border border-slate-200 shadow-sm">
                      {lang.levelCode}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div key={dot} className={`w-3 h-3 rounded-full ${dot <= parseInt(lang.levelScore) ? 'bg-blue-500 shadow-sm shadow-blue-300' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};