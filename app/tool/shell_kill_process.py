from app.tool.base import BaseTool, ToolResult
from app.tool.shell_manager import shell_manager

class ShellKillProcessTool(BaseTool):
    name: str = "shell_kill_process"
    description: str = "Terminates a running process in a specified shell session."
    parameters: dict = {
        "type": "object",
        "properties": {
            "id": { "type": "string", "description": "The unique identifier of the target shell session to terminate." }
        },
        "required": ["id"]
    }

    async def execute(self, id: str) -> ToolResult:
        session = shell_manager.get_session(id)
        if not session:
            return ToolResult(error=f"Session with ID '{id}' not found.")
        
        if session.process.returncode is not None:
            return ToolResult(output=f"Process in session '{id}' has already terminated.")

        try:
            session.process.kill()
            await session.process.wait()
            shell_manager.remove_session(id)
            return ToolResult(output=f"Successfully killed process in session '{id}'.")
        except Exception as e:
            return ToolResult(error=f"Failed to kill process in session '{id}': {str(e)}")