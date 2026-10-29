import { useState } from 'react'
import { Mic, Send } from 'lucide-react'
import { classifyText, createItem } from '../lib/api'
import ClassificationModal from '../components/ClassificationModal'

export default function Dashboard() {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [classification, setClassification] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const startVoice = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'it-IT'
      recognition.continuous = false
      recognition.interimResults = false
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }
      
      recognition.start()
    } else {
      alert('Web Speech API non supportato in questo browser. Usa Chrome/Edge.')
    }
  }

  const handleSubmit = async () => {
    if (!input.trim()) return
    setLoading(true)
    try {
      const result = await classifyText(input)
      setClassification(result)
    } catch (e) {
      alert('Errore nella classificazione')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (proposal: any) => {
    try {
      await createItem({
        type: proposal.type,
        title: proposal.title,
        content: proposal.content,
        start_date: proposal.start_date,
        start_time: proposal.start_time,
        end_time: proposal.end_time,
        location: proposal.location,
        status: proposal.status || (proposal.type === 'idea' ? 'new' : proposal.type === 'activity' ? 'todo' : null),
        priority: proposal.priority,
        tags: proposal.tags,
        original_text: proposal.original_text,
        source: 'web'
      })
      setClassification(null)
      setInput('')
      alert('Elemento salvato!')
    } catch (e) {
      alert('Errore nel salvataggio')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold mb-3">Aggiungi qualcosa</h3>
        <p className="text-sm text-slate-400 mb-3">Scrivi o parla: appuntamenti, attività, idee da sviluppare, appunti...</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Es: 'Domani alle 16 devo portare la macchina dal meccanico'"
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
          />
          <button
            onClick={startVoice}
            className={`px-4 py-2 rounded-lg ${isListening ? 'bg-red-600' : 'bg-slate-700'} hover:opacity-90`}
            title="Registra vocale"
            disabled={loading}
          >
            <Mic size={20} />
          </button          >
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            title="Invia"
            disabled={loading || !input.trim()}
          >
            <Send size={20} />
          </button>
        </div>
        {isListening && <p className="text-sm text-red-400 mt-2">In ascolto...</p>}
        {loading && <p className="text-sm text-blue-400 mt-2">Classificazione in corso...</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-2">Prossimi appuntamenti</h3>
          <p className="text-slate-400 text-sm">Nessun appuntamento</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-2">Attività da fare</h3>
          <p className="text-slate-400 text-sm">Nessuna attività</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-2">Idee da sviluppare</h3>
          <p className="text-slate-400 text-sm">Nessuna idea</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold mb-2">Da organizzare</h3>
          <p className="text-slate-400 text-sm">Nessun elemento</p>
        </div>
      </div>

      {classification && (
        <ClassificationModal
          proposals={classification.proposals}
          onConfirm={handleConfirm}
          onCancel={() => setClassification(null)}
        />
      )}
    </div>
  )
}
