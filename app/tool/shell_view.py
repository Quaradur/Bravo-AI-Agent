from app.tool.base import BaseTool, ToolResult
from app.tool.shell_manager import shell_manager

class ShellViewTool(BaseTool):
    name: str = "shell_view"
    description: str = "Views the output of a running or completed shell session."
    parameters: dict = {
        "type": "object",
        "properties": {
            "id": { "type": "string", "description": "The unique identifier of the target shell session." }
        },
        "required": ["id"]
    }

    async def execute(self, id: str) -> ToolResult:
        # --- INIZIO MODIFICA: Invia l'evento 'action' al frontend ---
        if self.callback_handler:
            await self.callback_handler(
                "action",
                title=">_ Terminale: Visualizza Output",
                content=f"session_id='{id}'"
            )
        # --- FINE MODIFICA ---

        session = shell_manager.get_session(id)
        if not session:
            error_msg = f"Session with ID '{id}' not found."
            if self.callback_handler:
                await self.callback_handler("summary", content=f"⚠️ Errore Terminale: {error_msg}")
            return ToolResult(error=error_msg)

        try:
            await session.read_outputs()

            status = f"Running (PID: {session.process.pid})"
            if session.return_code is not None:
                status = f"Finished with code {session.return_code}"
                shell_manager.remove_session(id)

            # Prepara l'output per il frontend e per l'agente
            output_for_agent = f"SESSION ID: {id}\nSTATUS: {status}\n--- STDOUT ---\n{session.output}\n--- STDERR ---\n{session.error}\n"
            output_for_frontend = f"root@agent:~$ view_session {id}\n{session.output or ''}\n{session.error or ''}"

            # Invia l'output del terminale al pannello di destra
            if self.callback_handler:
                await self.callback_handler(
                    "terminal_output",
                    content=output_for_frontend.strip()
                )

            return ToolResult(output=output_for_agent)

        except Exception as e:
            error_message = f"Failed to read session '{id}': {str(e)}"
            if self.callback_handler:
                 await self.callback_handler("summary", content=f"⚠️ Errore Terminale: {error_message}")
            return ToolResult(error=error_message)

