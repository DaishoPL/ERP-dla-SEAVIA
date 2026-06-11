import React from 'react';
import { Briefcase, Calendar, Users } from 'lucide-react';

// ============================================================================
// 🧩 KOMPONENT: PROJEKTY I UMOWY (KAFELEK LISTY)
// ============================================================================
export const ProjectsListWidget = ({ projectsList, isLoading, preview, setPreview }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
        <h3 className="font-black text-slate-800 flex items-center gap-2.5">
          <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg"><Briefcase size={16} /></div>
          Projekty i Umowy
        </h3>
      </div>
      <div className="p-4 space-y-2">
        {projectsList?.length === 0 && !isLoading ? (
          <p className="text-xs text-slate-400 font-medium text-center py-4">Brak historii projektowej</p>
        ) : (
          projectsList?.map((project) => {
            const isActive = preview?.data?.id === project.id;
            return (
              <div 
                key={project.id}
                onMouseEnter={() => setPreview({ type: 'project', data: project })}
                onClick={() => setPreview({ type: 'project', data: project })}
                className={`p-3 border rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                  isActive ? 'bg-purple-50 border-purple-200 shadow-sm ring-1 ring-purple-500' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded border bg-white text-slate-500 border-slate-200">
                    {project.status || 'ACT'}
                  </span>
                  <p className={`text-sm font-bold truncate max-w-[150px] ${isActive ? 'text-purple-900' : 'text-slate-700'}`}>
                    {project.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Koniec</p>
                  <p className={`text-xs font-bold ${isActive ? 'text-purple-800' : 'text-slate-600'}`}>{project.end || '-'}</p>
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
// 🧩 KOMPONENT: PROJEKTY I UMOWY (SZCZEGÓŁOWY PODGLĄD)
// ============================================================================
export const ProjectPreviewPane = ({ data }) => {
  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm border border-purple-100 shrink-0">
          <Briefcase size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Historia Projektowa</p>
          <h2 className="text-2xl font-black text-slate-800 leading-tight">{data.name}</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><Calendar size={12}/> Oddelegowanie Od</p>
            <p className="text-sm font-bold text-slate-800">{data.start}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><Calendar size={12}/> Oddelegowanie Do</p>
            <p className="text-sm font-bold text-slate-800">{data.end}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Users size={14}/> Nadzór Projektu</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <span className="text-sm font-medium text-slate-600">Project Manager:</span>
              <span className="text-sm font-black text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                {data.pm || 'Brak danych'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Foreman Brygady:</span>
              <div className="flex gap-2">
                {data.foremen && data.foremen.length > 0 ? (
                  data.foremen.map((f, idx) => (
                    <span key={idx} className="text-sm font-black text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{f}</span>
                  ))
                ) : (
                  <span className="text-sm font-medium text-slate-400">Brak przypisania</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};