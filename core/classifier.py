from openai import AsyncOpenAI
from core.config import settings
from core.schemas import ClassificationRequest, ClassificationResponse, ClassificationProposal
from core.models import ItemType, ItemStatus, Priority
from core.dates import parse_italian_date, parse_italian_time
from datetime import datetime
import json
import pytz

ROME_TZ = pytz.timezone('Europe/Rome')

class Classifier:
    def __init__(self):
        self.client = None
        if settings.AI_API_KEY:
            if settings.AI_PROVIDER == "openrouter":
                self.client = AsyncOpenAI(
                    api_key=settings.AI_API_KEY,
                    base_url="https://openrouter.ai/api/v1"
                )
            elif settings.AI_PROVIDER == "groq":
                self.client = AsyncOpenAI(
                    api_key=settings.AI_API_KEY,
                    base_url="https://api.groq.com/openai/v1"
                )
            else:
                self.client = AsyncOpenAI(api_key=settings.AI_API_KEY)
    
    async def classify(self, request: ClassificationRequest) -> ClassificationResponse:
        text = request.text.strip()
        
        if not self.client:
            # Fallback senza IA
            return await self._fallback_classify(text)
        
        system_prompt = """Sei un classificatore intelligente per un'agenda personale italiana.
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

Usa fuso orario Europe/Rome per interpretare date relative."""
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Messaggio: {text}\n\nData/ora attuale: {datetime.now(ROME_TZ).strftime('%Y-%m-%d %H:%M %Z')}"}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            proposals = []
            
            for p in result.get('proposals', []):
                # Parse date/time con parser italiano
                start_date = None
                if p.get('start_date'):
                    try:
                        start_date = datetime.fromisoformat(p['start_date'].replace('Z', '+00:00'))
                    except:
                        parsed = parse_italian_date(text)
                        if parsed:
                            start_date = ROME_TZ.localize(datetime.combine(parsed, datetime.min.time()))
                else:
                    parsed = parse_italian_date(text)
                    if parsed:
                        start_date = ROME_TZ.localize(datetime.combine(parsed, datetime.min.time()))
                
                start_time = p.get('start_time') or parse_italian_time(text)
                
                proposals.append(ClassificationProposal(
                    type=ItemType(p['type']),
                    title=p['title'],
                    content=p.get('content'),
                    start_date=start_date,
                    start_time=start_time,
                    end_time=p.get('end_time'),
                    location=p.get('location'),
                    status=ItemStatus(p['status']) if p.get('status') else None,
                    priority=Priority(p.get('priority', 'medium')),
                    tags=p.get('tags', []),
                    confidence=p.get('confidence', 0.7),
                    needs_confirmation=p.get('needs_confirmation', True),
                    missing_fields=p.get('missing_fields', []),
                    reasoning=p.get('reasoning'),
                    original_text=text
                ))
            
            return ClassificationResponse(
                proposals=proposals,
                needs_clarification=result.get('needs_clarification', False),
                clarification_question=result.get('clarification_question'),
                original_text=text
            )
        except Exception as e:
            print(f"Errore classificazione IA: {e}")
            return await self._fallback_classify(text)
    
    async def _fallback_classify(self, text: str) -> ClassificationResponse:
        """Fallback senza IA - regole base"""
        text_lower = text.lower()
        
        # Prova a individuare tipo
        if any(word in text_lower for word in ['appuntamento', 'incontro', 'visita', 'domani alle', 'alle ']):
            parsed_date = parse_italian_date(text)
            parsed_time = parse_italian_time(text)
            start_date = None
            if parsed_date:
                start_date = ROME_TZ.localize(datetime.combine(parsed_date, datetime.min.time()))
            
            return ClassificationResponse(
                proposals=[ClassificationProposal(
                    type=ItemType.APPOINTMENT,
                    title=text[:60],
                    start_date=start_date,
                    start_time=parsed_time,
                    confidence=0.6,
                    needs_confirmation=True,
                    missing_fields=['data'] if not parsed_date else [],
                    original_text=text
                )],
                needs_clarification=not parsed_date,
                clarification_question="Per quale data e ora è l'appuntamento?" if not parsed_date else None,
                original_text=text
            )
        
        if any(word in text_lower for word in ['idea', 'potrei', 'sarebbe bello', 'voglio provare']):
            return ClassificationResponse(
                proposals=[ClassificationProposal(
                    type=ItemType.IDEA,
                    title=text[:60],
                    status=ItemStatus.NEW,
                    confidence=0.6,
                    needs_confirmation=True,
                    original_text=text
                )],
                original_text=text
            )
        
        # Default: todo_organize
        return ClassificationResponse(
            proposals=[ClassificationProposal(
                type=ItemType.TODO_ORGANIZE,
                title=text[:60],
                confidence=0.4,
                needs_confirmation=True,
                reasoning="Non riesco a classificare automaticamente, decidimi tu",
                original_text=text
            )],
            needs_clarification=True,
            clarification_question="Come vuoi classificare questo elemento? (Attività/Appuntamento/Idea/Appunto)",
            original_text=text
        )

classifier = Classifier()
