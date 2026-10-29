import OpenAI from 'openai';
import { parseItalianDate, parseItalianTime } from './dates.js';

let client: OpenAI | null = null;

function getClient() {
  if (client) return client;
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  
  const provider = process.env.AI_PROVIDER || 'openrouter';
  if (provider === 'openrouter') {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    });
  } else if (provider === 'groq') {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    });
  } else {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function classifyText(text: string) {
  const client = getClient();
  
  if (!client) {
    return fallbackClassify(text);
  }
  
  const systemPrompt = `Sei un classificatore intelligente per un'agenda personale italiana.
Analizza il messaggio e classificalo in una delle categorie: activity, appointment, idea, note, todo_organize.

REGOLE CRITICHE:
- NON INVENTARE date, orari, luoghi. Usa solo ciò che è esplicitamente scritto.
- Per appuntamenti servono generalmente data/ora. Se mancanti e indispensabili, chiedi chiarimenti.
- "idea" = qualcosa da sviluppare/approfondire, NON trasformarla in attività automaticamente
- "note/appunto" = informazione da conservare/recuperare
- "activity/attività" = cosa da fare
- Se ambiguo, metti in todo_organize e chiedi chiarimenti
- Estrai SOLO informazioni presenti nel testo
- Rispondi SOLO con JSON valido

Formato risposta:
{
  "proposals": [{
    "type": "activity|appointment|idea|note|todo_organize",
    "title": "titolo sintetico",
    "content": "descrizione completa se presente",
    "start_date": "YYYY-MM-DD o null",
    "start_time": "HH:MM o null",
    "end_time": "HH:MM o null",
    "location": "luogo o null",
    "status": "todo|new|to_evaluate|null",
    "priority": "low|medium|high",
    "tags": ["tag1"],
    "confidence": 0.0-1.0,
    "needs_confirmation": true,
    "missing_fields": ["campo mancante"],
    "reasoning": "breve spiegazione"
  }],
  "needs_clarification": false,
  "clarification_question": "domanda se ambiguo"
}

Usa fuso orario Europe/Rome per interpretare date relative.`;
  
  try {
    const model = process.env.AI_MODEL || 'google/gemini-2.5-flash-lite-preview-06-17';
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Messaggio: ${text}\n\nData/ora attuale: ${new Date().toISOString()}` }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    const proposals = (result.proposals || []).map((p: any) => {
      let startDate = p.start_date || parseItalianDate(text);
      let startTime = p.start_time || parseItalianTime(text);
      
      return {
        type: p.type,
        title: p.title,
        content: p.content,
        start_date: startDate,
        start_time: startTime,
        end_time: p.end_time,
        location: p.location,
        status: p.status,
        priority: p.priority || 'medium',
        tags: p.tags || [],
        confidence: p.confidence || 0.7,
        needs_confirmation: p.needs_confirmation !== false,
        missing_fields: p.missing_fields || [],
        reasoning: p.reasoning,
        original_text: text
      };
    });
    
    return {
      proposals,
      needs_clarification: result.needs_clarification || false,
      clarification_question: result.clarification_question,
      original_text: text
    };
  } catch (e) {
    console.error('Errore classificazione:', e);
    return fallbackClassify(text);
  }
}

function fallbackClassify(text: string) {
  const lower = text.toLowerCase();
  
  if (/\bappuntamento|incontro|visita|domani alle|alle \d/.test(lower)) {
    const parsedDate = parseItalianDate(text);
    const parsedTime = parseItalianTime(text);
    
    return {
      proposals: [{
        type: 'appointment',
        title: text.slice(0, 60),
        start_date: parsedDate,
        start_time: parsedTime,
        priority: 'medium',
        tags: [],
        confidence: 0.6,
        needs_confirmation: true,
        missing_fields: parsedDate ? [] : ['data'],
        original_text: text
      }],
      needs_clarification: !parsedDate,
      clarification_question: !parsedDate ? 'Per quale data è l\'appuntamento?' : null,
      original_text: text
    };
  }
  
  if (/\bidea|potrei|sarebbe bello|voglio provare|da sviluppare|da approfondire/.test(lower)) {
    return {
      proposals: [{
        type: 'idea',
        title: text.slice(0, 60),
        status: 'new',
        priority: 'medium',
        tags: [],
        confidence: 0.6,
        needs_confirmation: true,
        original_text: text
      }],
      original_text: text
    };
  }
  
  if (/\bappunto|informazione|codice|indirizzo|nota/.test(lower)) {
    return {
      proposals: [{
        type: 'note',
        title: text.slice(0, 60),
        priority: 'medium',
        tags: [],
        confidence: 0.6,
        needs_confirmation: true,
        original_text: text
      }],
      original_text: text
    };
  }
  
  if (/\bdevo|fare|comprare|chiamare|pagare/.test(lower)) {
    const parsedDate = parseItalianDate(text);
    return {
      proposals: [{
        type: 'activity',
        title: text.slice(0, 60),
        start_date: parsedDate,
        priority: 'medium',
        tags: [],
        confidence: 0.6,
        needs_confirmation: true,
        original_text: text
      }],
      original_text: text
    };
  }
  
  return {
    proposals: [{
      type: 'todo_organize',
      title: text.slice(0, 60),
      priority: 'medium',
      tags: [],
      confidence: 0.4,
      needs_confirmation: true,
      reasoning: 'Non riesco a classificare automaticamente, decidimi tu',
      original_text: text
    }],
    needs_clarification: true,
    clarification_question: 'Come vuoi classificare questo elemento? (Attività/Appuntamento/Idea/Appunto)',
    original_text: text
  };
}
