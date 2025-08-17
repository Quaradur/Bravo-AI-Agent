from app.tool.base import BaseTool, ToolResult

class MessageAskUserTool(BaseTool):
    name: str = "message_ask_user"
    description: str = "Asks a question to the user and waits for a response (for clarifications, confirmations, or additional information)."
    parameters: dict = {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "The question to ask the user."
            }
        },
        "required": ["text"]
    }

    async def execute(self, text: str) -> ToolResult:
        # --- INIZIO MODIFICA ---
        # Invece di chiamare input() e bloccare, questo strumento ora restituisce
        # un risultato speciale. L'output contiene la domanda per l'utente,
        # e il campo 'system' viene usato come un segnale per l'agente
        # per mettersi in stato di attesa.
        return ToolResult(
            output=f"Question for the user: {text}",
            system="AWAITING_USER_INPUT"
        )
        # --- FINE MODIFICA ---
