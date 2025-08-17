import asyncio
from app.tool.base import BaseTool, ToolResult
from app.tool.shell_manager import shell_manager
from app.config import config

class ShellExecTool(BaseTool):
    name: str = "shell_exec"
    description: str = "Execute a command in a new shell session. This runs the command in the background. Use 'shell_view' to check the output."
    parameters: dict = {
        "type": "object",
        "properties": {
            "command": {
                "type": "string",
                "description": "The shell command to execute."
            },
            "exec_dir": {
                "type": "string",
                "description": "Working directory for command execution. Defaults to workspace.",
                "default": str(config.workspace_root)
            }
        },
        "required": ["command"]
    }

    async def execute(self, command: str, exec_dir: str = None) -> ToolResult:
        if not exec_dir:
            exec_dir = str(config.workspace_root)
        
        try:
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=exec_dir
            )
            
            session_id = shell_manager.create_session(command, process)
            
            return ToolResult(output=f"Command '{command}' started in background with session ID: {session_id}. Use 'shell_view' to see the output.")

        except Exception as e:
            return ToolResult(error=f"Failed to start command '{command}': {str(e)}")