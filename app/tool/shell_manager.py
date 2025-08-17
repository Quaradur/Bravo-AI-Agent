import asyncio
import uuid
from typing import Dict

# Questa classe rappresenta un singolo processo/sessione di terminale
class ShellSession:
    def __init__(self, command: str, process: asyncio.subprocess.Process):
        self.command = command
        self.process = process
        self.output = ""
        self.error = ""
        self.return_code = None

    async def read_outputs(self):
        """Legge stdout e stderr senza bloccare."""
        try:
            stdout, stderr = await asyncio.wait_for(self.process.communicate(), timeout=0.1)
            self.output += stdout.decode(errors='ignore')
            self.error += stderr.decode(errors='ignore')
            self.return_code = self.process.returncode
        except asyncio.TimeoutError:
            # Il processo è ancora in esecuzione, va bene
            pass
        except Exception:
            pass # Ignora altri errori di lettura se il processo è terminato

# Questa classe gestisce tutte le sessioni aperte
class ShellManager:
    _instance = None
    _sessions: Dict[str, ShellSession] = {}

    # Singleton Pattern: assicura che ci sia una sola istanza di ShellManager
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ShellManager, cls).__new__(cls)
            cls._sessions = {}
        return cls._instance

    def create_session(self, command: str, process: asyncio.subprocess.Process) -> str:
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = ShellSession(command, process)
        return session_id

    def get_session(self, session_id: str) -> ShellSession | None:
        return self._sessions.get(session_id)

    def remove_session(self, session_id: str):
        if session_id in self._sessions:
            del self._sessions[session_id]

# Creiamo un'istanza globale che i nostri strumenti potranno usare
shell_manager = ShellManager()