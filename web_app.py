import asyncio
import os
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any
# --- INIZIO MODIFICA: Aggiunta di CORSMiddleware ---
from fastapi.middleware.cors import CORSMiddleware
# --- FINE MODIFICA ---

from app.agent.manus import Manus
from app.logger import logger, define_log_level
from app.config import WORKSPACE_ROOT

# --- 1. Setup dell'Applicazione FastAPI ---
app = FastAPI()

# --- INIZIO MODIFICA: Configurazione di CORS ---
# Permetti al frontend React (che girerà su un'altra porta, es. 3000 o 5173)
# di fare richieste a questo backend.
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- FINE MODIFICA ---


# --- 2. Gestione delle Connessioni WebSocket ---
class ConnectionManager:
    """Gestisce le connessioni WebSocket attive."""
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connection established for session: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket connection closed for session: {session_id}")

    async def send_json(self, session_id: str, data: Dict[str, Any]):
        """Invia dati JSON a un client specifico."""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(data)

manager = ConnectionManager()

# --- 3. Gestione delle Sessioni Agente ---
class AgentSessionManager:
    """Gestisce le istanze degli agenti per ogni sessione."""
    def __init__(self):
        self.sessions: Dict[str, Manus] = {}
        self.locks: Dict[str, asyncio.Lock] = {}

    async def get_agent(self, session_id: str) -> Manus:
        """Ottiene o crea un'istanza dell'agente per una data sessione."""
        if session_id not in self.locks:
            self.locks[session_id] = asyncio.Lock()
        
        async with self.locks[session_id]:
            if session_id not in self.sessions:
                logger.info(f"Creating new agent for session: {session_id}")
                agent_logger = self._create_agent_logger(session_id)
                agent = await Manus.create() # Non passiamo più il logger direttamente
                self.sessions[session_id] = agent
            return self.sessions[session_id]

    def _create_agent_logger(self, session_id: str):
        """Crea un logger che invia i messaggi al frontend tramite WebSocket."""
        def websocket_sink(message):
            asyncio.create_task(manager.send_json(session_id, {
                "type": "log",
                "content": message.strip()
            }))
        
        return define_log_level(print_level="INFO", logfile_level="DEBUG", name=f"agent_{session_id}")


agent_manager = AgentSessionManager()


# --- 4. Modelli di Dati per le Richieste API ---
class ChatRequest(BaseModel):
    prompt: str
    session_id: str

# --- 5. Endpoint API ---

@app.get("/")
async def read_root():
    """Endpoint di benvenuto per l'API."""
    return {"message": "Bravo AI Agent Backend is running."}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Endpoint per la comunicazione in tempo reale."""
    await manager.connect(websocket, session_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Riceve un prompt, avvia l'agente in background."""
    session_id = request.session_id
    prompt = request.prompt
    
    await manager.send_json(session_id, {"type": "user_message", "content": prompt})
    asyncio.create_task(run_agent_task(session_id, prompt))
    
    return {"status": "Agent task started. Results will be streamed via WebSocket."}

async def run_agent_task(session_id: str, prompt: str):
    """Task asincrona per eseguire l'agente e inviare i risultati."""
    try:
        agent = await agent_manager.get_agent(session_id)
        response = await agent.run(prompt)
        await manager.send_json(session_id, {
            "type": "agent_response",
            "content": response
        })
    except Exception as e:
        logger.error(f"Error during agent execution for session {session_id}: {e}", exc_info=True)
        await manager.send_json(session_id, {
            "type": "error",
            "content": f"An error occurred: {str(e)}"
        })

@app.get("/api/workspace/files")
async def list_workspace_files():
    """Restituisce la struttura ad albero della cartella workspace."""
    if not os.path.exists(WORKSPACE_ROOT):
        return {"error": "Workspace directory not found."}
    
    tree = []
    for root, dirs, files in os.walk(WORKSPACE_ROOT):
        relative_path = os.path.relpath(root, WORKSPACE_ROOT)
        if relative_path == ".":
            relative_path = ""

        for d in sorted(dirs):
            tree.append({"id": os.path.join(relative_path, d), "parent": relative_path or "#", "text": d, "type": "folder"})
        
        for f in sorted(files):
            tree.append({"id": os.path.join(relative_path, f), "parent": relative_path or "#", "text": f, "type": "file"})
            
    return tree

@app.get("/api/workspace/files/{file_path:path}")
async def read_workspace_file(file_path: str):
    """Legge e restituisce il contenuto di un file specifico nella workspace."""
    try:
        secure_path = os.path.abspath(os.path.join(WORKSPACE_ROOT, file_path))
        if not secure_path.startswith(os.path.abspath(WORKSPACE_ROOT)):
            return {"error": "Access denied."}

        if not os.path.exists(secure_path) or not os.path.isfile(secure_path):
            return {"error": "File not found."}
            
        with open(secure_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        return {"error": str(e)}

# Comando per avviare: uvicorn web_app:app --reload
