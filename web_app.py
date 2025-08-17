import asyncio
from fastapi import FastAPI
from pydantic import BaseModel
from app.agent.manus import Manus
from app.logger import logger

# Modello per la richiesta in input
class ChatRequest(BaseModel):
    prompt: str
    session_id: str # Per mantenere la cronologia delle conversazioni

app = FastAPI()

# Manteniamo un dizionario di agenti per ogni sessione utente
sessions = {}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    logger.info(f"Received request for session: {request.session_id}")

    # Se è una nuova sessione, crea un nuovo agente
    if request.session_id not in sessions:
        logger.info(f"Creating new agent for session: {request.session_id}")
        sessions[request.session_id] = await Manus.create()

    agent = sessions[request.session_id]

    try:
        # Esegui l'agente con il prompt dell'utente
        response = await agent.run(request.prompt)
        return {"response": response}
    except Exception as e:
        logger.error(f"Error during agent execution: {e}")
        return {"error": str(e)}

# Comando per avviare il server: uvicorn web_app:app --reload