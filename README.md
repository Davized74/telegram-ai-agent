# Agenda Intelligente Personale

Un'agenda personale calendarizzata con raccolta di idee da sviluppare/approfondire. 
Supporta input testuale e vocale (PWA installabile su Android).

## Caratteristiche
- **Input unificato**: Messaggi testuali o vocali direttamente nell'app
- **Classificazione intelligente**: L'IA classifica automaticamente in Attività/Appuntamenti/Idee/Appunti
- **Agenda calendarizzata**: Vista giorno/settimana/mese
- **Raccolta idee**: Per progetti da sviluppare/approfondire con stati e tag
- **Ricerca globale**: Trova rapidamente qualsiasi elemento salvato
- **PWA**: Installabile su smartphone come app nativa
- **Conferma prima di salvare**: L'IA propone sempre elementi da confermare/modificare
- **Tutto personale**: Funziona interamente in locale o sul tuo hosting

## Stack
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Bot Telegram** (opzionale): python-telegram-bot
- **IA**: OpenRouter/Groq (modelli gratuiti disponibili)
- **Trascrizione vocale**: Web Speech API (gratis) o Whisper

## Avvio rapido

### 1. Configurazione
```bash
cp .env.example .env
# Modifica .env con le tue configurazioni
```

### 2. Backend
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn api.main:app --reload
```

### 3. Frontend
```bash
cd web
npm install
npm run dev
```

### 4. Bot Telegram (opzionale)
```bash
python -m bot.main
```

## Note
- Per uso personale e sperimentale
- Puoi usare solo webapp senza bot
- Web Speech API funziona su Chrome/Edge
