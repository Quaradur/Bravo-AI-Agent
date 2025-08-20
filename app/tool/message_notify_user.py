from app.tool.base import BaseTool, ToolResult

class MessageNotifyUserTool(BaseTool):
    name: str = "message_notify_user"
    description: str = "Sends an informational message to the user (acknowledgments, progress updates, task completions, etc.). Does not require a response."
    parameters: dict = {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "The message text to display to the user."
            }
        },
        "required": ["text"]
    }

    async def execute(self, text: str) -> ToolResult:
        # --- INIZIO MODIFICA: Invia il messaggio al frontend ---
        if self.callback_handler:
            # Invia il messaggio direttamente alla chat del frontend.
            await self.callback_handler("chat", content=text)
        # --- FINE MODIFICA ---

        # Il vecchio print non è più necessario in un'app web.
        # formatted_message = f"\n--- AGENT NOTIFICATION ---\n{text}\n--------------------------\n"
        # print(formatted_message)

        # Questo strumento non interrompe il flusso, quindi restituisce un semplice output di successo.
        return ToolResult(output="Notification sent to user.")

