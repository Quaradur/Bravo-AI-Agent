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
        session = shell_manager.get_session(id)
        if not session:
            return ToolResult(error=f"Session with ID '{id}' not found.")
        
        await session.read_outputs() # Aggiorna output e stato

        status = f"Running (PID: {session.process.pid})"
        if session.return_code is not None:
            status = f"Finished with code {session.return_code}"
            shell_manager.remove_session(id) # Rimuovi la sessione se è finita

        output = f"SESSION ID: {id}\n"
        output += f"COMMAND: {session.command}\n"
        output += f"STATUS: {status}\n\n"
        output += f"--- STDOUT ---\n{session.output}\n"
        output += f"--- STDERR ---\n{session.error}\n"
        
        return ToolResult(output=output)