import { Routes, Route, Link } from 'react-router-dom'
import { Home, Calendar, Lightbulb, FileText, Inbox, Search, Settings } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import CalendarPage from './pages/CalendarPage'
import IdeasPage from './pages/IdeasPage'
import NotesPage from './pages/NotesPage'
import InboxPage from './pages/InboxPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-white">Agenda</h1>
            <div className="flex gap-4">
              <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-2">
                <Home size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/calendar" className="text-slate-300 hover:text-white flex items-center gap-2">
                <Calendar size={18} />
                <span className="hidden sm:inline">Calendario</span>
              </Link>
              <Link to="/ideas" className="text-slate-300 hover:text-white flex items-center gap-2">
                <Lightbulb size={18} />
                <span className="hidden sm:inline">Idee</span>
              </Link>
              <Link to="/notes" className="text-slate-300 hover:text-white flex items-center gap-2">
                <FileText size={18} />
                <span className="hidden sm:inline">Appunti</span>
              </Link>
              <Link to="/inbox" className="text-slate-300 hover:text-white flex items-center gap-2">
                <Inbox size={18} />
                <span className="hidden sm:inline">Da organizzare</span>
              </Link>
              <Link to="/search" className="text-slate-300 hover:text-white flex items-center gap-2">
                <Search size={18} />
                <span className="hidden sm:inline">Cerca</span>
              </Link>
              <Link to="/settings" className="text-slate-300 hover:text-white flex items-center gap-2">
                <Settings size={18} />
                <span className="hidden sm:inline">Impostazioni</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
