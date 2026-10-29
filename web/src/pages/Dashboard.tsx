import { useState } from 'react'
import { Mic, Send } from 'lucide-react'

export default function Dashboard() {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)

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
      alert('Web Speech API non supportato in questo browser')
    }
  }

  const handleSubmit = async () => {
    if (!input.trim()) return
    // TODO: classificazione
    console.log('Submit:', input)
    setInput('')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold mb-3">Aggiungi qualcosa</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi o parla... es. 'Domani alle 15 appuntamento dal dentista'"
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={startVoice}
            className={`px-4 py-2 rounded-lg ${isListening ? 'bg-red-600' : 'bg-slate-700'} hover:opacity-90`}
            title="Registra vocale"
          >
            <Mic size={20} />
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            title="Invia"
          >
            <Send size={20} />
          </button>
        </div>
        {isListening && <p className="text-sm text-red-400 mt-2">In ascolto...</p>}
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
      </div>
    </div>
  )
}
