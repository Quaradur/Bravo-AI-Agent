import os
from app.tool.base import BaseTool, ToolResult
from app.config import config

class FileWriteTool(BaseTool):
    name: str = "file_write"
    description: str = "Overwrite or append content to a file. Use for creating new files, appending content, or modifying existing files."
    parameters: dict = {
        "type": "object",
        "properties": {
            "file": {
                "type": "string",
                "description": "Absolute or relative path of the file to write to. Relative paths are resolved from the workspace root."
            },
            "content": {
                "type": "string",
                "description": "Text content to write"
            },
            "append": {
                "type": "boolean",
                "description": "(Optional) Whether to use append mode. Defaults to false (overwrite).",
                "default": False
            }
        },
        "required": ["file", "content"]
    }

    async def execute(self, file: str, content: str, append: bool = False) -> ToolResult:
        # --- START MODIFICATION ---
        # Converte i percorsi relativi in percorsi assoluti basati sulla workspace
        if not os.path.isabs(file):
            file_path = os.path.join(config.workspace_root, file)
        else:
            file_path = file
        # --- END MODIFICATION ---

        try:
            # Assicura che la directory esista
            directory = os.path.dirname(file_path)
            if not os.path.exists(directory):
                os.makedirs(directory)

            mode = 'a' if append else 'w'
            with open(file_path, mode, encoding='utf-8') as f:
                f.write(content)
            
            action = "appended to" if append else "written to"
            return ToolResult(output=f"Successfully {action} file: {file_path}")

        except Exception as e:
            return ToolResult(error=f"Failed to write to file '{file_path}': {str(e)}")
