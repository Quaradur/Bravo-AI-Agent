import asyncio
from app.tool.base import BaseTool, ToolResult
from app.tool.shell_manager import shell_manager

class ShellWaitTool(BaseTool):
    name: str = "shell_wait"
    description: str = "Waits for a running process in a shell session to complete for a specified duration."
    parameters: dict = {
        "type": "object",
        "properties": {
            "id": {
                "type": "string",
                "description": "The unique identifier of the target shell session."
            },
            "seconds": {
                "type": "integer",
                "description": "The maximum duration to wait in seconds."
            }
        },
        "required": ["id", "seconds"]
    }

    async def execute(self, id: str, seconds: int) -> ToolResult:
        session = shell_manager.get_session(id)
        if not session:
            return ToolResult(error=f"Session with ID '{id}' not found.")

        try:
            # Attendi il completamento del processo con un timeout
            await asyncio.wait_for(session.process.wait(), timeout=seconds)
            
            # Leggi gli output finali dopo che il processo è terminato
            await session.read_outputs()
            
            output = f"Process in session '{id}' finished with return code {session.return_code}.\n"
            output += f"--- STDOUT ---\n{session.output}\n"
            output += f"--- STDERR ---\n{session.error}\n"

            shell_manager.remove_session(id) # Pulisci la sessione
            return ToolResult(output=output)

        except asyncio.TimeoutError:
            return ToolResult(output=f"Process in session '{id}' did not finish within {seconds} seconds. It is still running.")
        except Exception as e:
            return ToolResult(error=f"Error waiting for session '{id}': {str(e)}")