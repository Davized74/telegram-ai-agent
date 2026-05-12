from duckduckgo_search import DDGS
import json
import os
from datetime import datetime
from dotenv import load_dotenv

from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters

from openai import OpenAI

# =========================
# MEMORIA FILE
# =========================
MEMORY_FILE = "memory.json"

def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return {}
    with open(MEMORY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_memory(data):
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# carica variabili .env
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

SYSTEM_PROMPT = "Sei un assistente AI utile, veloce e rispondi sempre in italiano."

# =========================
# ADMIN CONFIG
# =========================
ADMIN_IDS = [959408270]

def is_admin(user_id):
    return user_id in ADMIN_IDS

# =========================
# WEB SEARCH TOOL
# =========================
def search_web(query):
    with DDGS() as ddgs:
        results = ddgs.text(query, max_results=3)

        output = []
        for r in results:
            output.append(f"{r['title']}\n{r['href']}\n")

        return "\n".join(output)

# =========================
# TOOL ROUTER
# =========================

def detect_intent(text):
    text = text.lower()

    # ⏰ TIME
    if "che ore" in text or "ora" in text:
        return "TIME"

    # 🌐 SEARCH
    if text.startswith("cerca:"):
        return "SEARCH"

    # 🌦 WEATHER
    if "meteo" in text or "temperatura" in text:
        return "WEATHER"

    # 🧠 MEMORY
    if "ricordati" in text:
        return "MEMORY"

    # 🤖 FALLBACK AI
    return "AI"        

# =========================
# MEMORIA
# =========================
user_memory = load_memory()

# =========================
# COMMANDS
# =========================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Ciao 👋 sono il tuo AI bot!")

async def myid(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id
    await update.message.reply_text(f"Il tuo ID è: {user_id}")

async def reset(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id

    if not is_admin(user_id):
        await update.message.reply_text("⛔ Non autorizzato")
        return

    user_memory.clear()
    save_memory(user_memory)

    await update.message.reply_text("🧹 Memoria resettata")

async def memory_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id

    if not is_admin(user_id):
        await update.message.reply_text("⛔ Non autorizzato")
        return

    chat_id = str(update.message.chat_id)
    data = user_memory.get(chat_id, [])

    if not data:
        await update.message.reply_text("Memoria vuota")
        return

    text = "\n".join([f"{m['role']}: {m['content']}" for m in data[-10:]])
    await update.message.reply_text(text)

# =========================
# AI HANDLER
# =========================

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text
    intent = detect_intent(user_text)
    print(f"INTENT RILEVATO: {intent}")
    

    # 🕒 ORA
    if intent == "TIME":
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        await update.message.reply_text(f"🕒 Sono le {current_time}")
        return

    # 🌐 WEB SEARCH (FIXATO E CORRETTO)
    if intent == "SEARCH":
        query = user_text.replace("cerca:", "").strip()

        results = search_web(query)

        await update.message.reply_text(
            f"🌐 Risultati per: {query}\n\n{results}"
        )
        return

    # 🌦 WEATHER TOOL
    if intent == "WEATHER":
        results = search_web(f"meteo {user_text}")

        await update.message.reply_text(
          f"🌦 Meteo trovato:\n\n{results}"
        )
        return
    
    # 🧠 MEMORY TOOL
    if intent == "MEMORY":
        chat_id = str(update.message.chat_id)

        if chat_id not in user_memory:
           user_memory[chat_id] = []

        memory_text = user_text.replace("ricordati", "").strip()

        user_memory[chat_id].append(
            {
            "role": "memory",
            "content": memory_text
             }
         )

         save_memory(user_memory)

         await update.message.reply_text(
               f"🧠 Ricorderò: {memory_text}"
         )

         return    

    # 🤖 AI (solo se non è altro comando)
    try:
        chat_id = str(update.message.chat_id)

        if chat_id not in user_memory:
            user_memory[chat_id] = []

        user_memory[chat_id].append(
            {"role": "user", "content": user_text}
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *user_memory[chat_id]
            ],
            temperature=0.7
        )

        answer = response.choices[0].message.content

        user_memory[chat_id].append(
            {"role": "assistant", "content": answer}
        )

        save_memory(user_memory)

        await update.message.reply_text(answer)

    except Exception as e:
        print("ERRORE AI:", e)
        await update.message.reply_text("Errore AI.")

# =========================
# BOT SETUP
# =========================

app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("myid", myid))
app.add_handler(CommandHandler("reset", reset))
app.add_handler(CommandHandler("memory", memory_cmd))

app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

print("Bot avviato 🚀")

app.run_polling()