import { useState } from 'react';
import { X, Check, Edit2 } from 'lucide-react';

interface Proposal {
  type: string;
  title: string;
  content?: string;
  start_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  priority: string;
  tags: string[];
  needs_confirmation: boolean;
  missing_fields: string[];
  reasoning?: string;
  original_text: string;
}

interface Props {
  proposals: Proposal[];
  onConfirm: (proposal: Proposal) => void;
  onCancel: () => void;
}

const typeLabels: Record<string, string> = {
  activity: 'Attività',
  appointment: 'Appuntamento',
  idea: 'Idea',
  note: 'Appunto',
  todo_organize: 'Da organizzare'
};

export default function ClassificationModal({ proposals, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState(0);
  const [editing, setEditing] = useState<Proposal>(proposals[0]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">Classificazione proposta</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-slate-700 p-3 rounded text-sm">
            <p className="text-slate-400 mb-1">Testo originale:</p>
            <p className="text-white">{editing.original_text}</p>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Categoria</label>
            <select
              value={editing.type}
              onChange={(e) => setEditing({...editing, type: e.target.value})}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
            >
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Titolo</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing({...editing, title: e.target.value})}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
            />
          </div>
          
          {editing.type === 'appointment' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Data</label>
                <input
                  type="date"
                  value={editing.start_date || ''}
                  onChange={(e) => setEditing({...editing, start_date: e.target.value})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Ora</label>
                <input
                  type="time"
                  value={editing.start_time || ''}
                  onChange={(e) => setEditing({...editing, start_time: e.target.value})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                />
              </div>
            </div>
          )}
          
          {editing.missing_fields.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700 p-2 rounded text-sm text-yellow-400">
              Campi mancanti: {editing.missing_fields.join(', ')}
            </div>
          )}
          
          {editing.reasoning && (
            <div className="bg-slate-700 p-2 rounded text-sm text-slate-300">
              {editing.reasoning}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 p-4 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
          >
            Annulla
          </button>
          <button
            onClick={() => onConfirm(editing)}
            className="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Conferma e salva
          </button>
        </div>
      </div>
    </div>
  );
}
