import re
from datetime import datetime, timedelta
import pytz
from dateutil import parser

ROME_TZ = pytz.timezone('Europe/Rome')

def parse_italian_date(text: str, base_date: datetime = None):
    """Parse date relative in italiano"""
    if base_date is None:
        base_date = datetime.now(ROME_TZ)
    
    text_lower = text.lower()
    
    # Oggi
    if re.search(r'\boggi\b', text_lower):
        return base_date.date()
    
    # Domani
    if re.search(r'\bdomani\b', text_lower):
        return (base_date + timedelta(days=1)).date()
    
    # Dopodomani
    if re.search(r'\bdopodomani\b', text_lower):
        return (base_date + timedelta(days=2)).date()
    
    # Ieri
    if re.search(r'\bieri\b', text_lower):
        return (base_date - timedelta(days=1)).date()
    
    # Fra X giorni
    m = re.search(r'fra (\d+) giorni', text_lower)
    if m:
        days = int(m.group(1))
        return (base_date + timedelta(days=days)).date()
    
    # Tra X giorni
    m = re.search(r'tra (\d+) giorni', text_lower)
    if m:
        days = int(m.group(1))
        return (base_date + timedelta(days=days)).date()
    
    # Prossima settimana
    if re.search(r'prossima settimana', text_lower):
        return (base_date + timedelta(days=7)).date()
    
    # Giorni della settimana
    weekdays = {
        'lunedì': 0, 'lunedi': 0,
        'martedì': 1, 'martedi': 1,
        'mercoledì': 2, 'mercoledi': 2,
        'giovedì': 3, 'giovedi': 3,
        'venerdì': 4, 'venerdi': 4,
        'sabato': 5,
        'domenica': 6
    }
    
    for day_name, day_num in weekdays.items():
        if day_name in text_lower:
            days_ahead = day_num - base_date.weekday()
            if 'prossim' in text_lower:
                if days_ahead <= 0:
                    days_ahead += 7
            elif days_ahead < 0:
                days_ahead += 7
            return (base_date + timedelta(days=days_ahead)).date()
    
    # Prova parsing generico
    try:
        parsed = parser.parse(text, languages=['it'], fuzzy=True)
        if parsed:
            return parsed.date()
    except:
        pass
    
    return None

def parse_italian_time(text: str):
    """Parse time in italiano"""
    text_lower = text.lower()
    
    # HH:MM o H:MM
    m = re.search(r'(\d{1,2}):(\d{2})', text)
    if m:
        hour = int(m.group(1))
        minute = int(m.group(2))
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return f"{hour:02d}:{minute:02d}"
    
    # alle X
    m = re.search(r'alle (\d{1,2})', text_lower)
    if m:
        hour = int(m.group(1))
        if 0 <= hour <= 23:
            return f"{hour:02d}:00"
    
    # ore X
    m = re.search(r'ore (\d{1,2})', text_lower)
    if m:
        hour = int(m.group(1))
        if 0 <= hour <= 23:
            return f"{hour:02d}:00"
    
    return None
