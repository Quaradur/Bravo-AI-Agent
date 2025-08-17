from app.tool.base import BaseTool, ToolResult
from app.tool.shell_manager import shell_manager

class ShellWriteToProcessTool(BaseTool):
    name: str = "shell_write_to_process"
    description: str = "Sends input to a running process in a specified shell session, with an option to simulate pressing Enter."
    parameters: dict = {
        "type": "object",
        "properties": {
            "id": {
                "type": "string",
                "description": "The unique identifier of the target shell session."
            },
            "input": {
                "type": "string",
                "description": "The text content to write to the process's STDIN."
            },
            "press_enter": {
                "type": "boolean",
                "description": "Whether to press the Enter key after the input. Defaults to true.",
                "default": True
            }
        },
        "required": ["id", "input"]
    }

    async def execute(self, id: str, input: str, press_enter: bool = True) -> ToolResult:
        session = shell_manager.get_session(id)
        if not session or session.process.returncode is not None:
            return ToolResult(error=f"Session with ID '{id}' is not active or not found.")

        try:
            stdin = session.process.stdin
            if stdin:
                data_to_write = input
                if press_enter:
                    data_to_write += "\\n"
                
                stdin.write(data_to_write.encode())
                await stdin.drain()
                return ToolResult(output=f"Successfully wrote to process in session '{id}'. Use 'shell_view' to see the result.")
            else:
                return ToolResult(error=f"Session '{id}' does not have a STDIN to write to.")
        except Exception as e:
            return ToolResult(error=f"Failed to write to process in session '{id}': {str(e)}")