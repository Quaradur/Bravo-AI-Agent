from app.tool.base import BaseTool, ToolResult

_TERMINATE_DESCRIPTION = """Terminate the interaction when the request is met OR if the assistant cannot proceed further with the task.
When you have finished all the tasks, call this tool to end the work."""


class Terminate(BaseTool):
    name: str = "terminate"
    description: str = _TERMINATE_DESCRIPTION
    parameters: dict = {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "description": "The finish status of the interaction.",
                "enum": ["success", "failure"],
            }
        },
        "required": ["status"],
    }

    async def execute(self, status: str) -> ToolResult:
        """Finish the current execution and notify the user."""

        # --- INIZIO MODIFICA: Invia eventi strutturati al frontend ---
        if self.callback_handler:
            # 1. Annuncia l'azione di terminazione nel flusso di eventi.
            await self.callback_handler(
                "action",
                title="🏁 Termina Esecuzione",
                content=f"status='{status}'"
            )

            # 2. Invia il messaggio di riepilogo finale.
            if status == "success":
                summary_message = "✅ **Compito completato con successo!** Sono pronto per il prossimo task."
            else:
                summary_message = "❌ **Compito terminato con fallimento.** Non sono riuscito a completare la richiesta."

            await self.callback_handler("summary", content=summary_message)
        # --- FINE MODIFICA ---

        # Restituisce un risultato standard per la logica interna dell'agente.
        return ToolResult(output=f"The interaction has been completed with status: {status}")



