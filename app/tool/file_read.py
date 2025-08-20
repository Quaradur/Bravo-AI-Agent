import os
from app.tool.base import BaseTool, ToolResult

class FileReadTool(BaseTool):
    name: str = "file_read"
    description: str = "Read file content. Use for checking file contents, analyzing logs, or reading configuration files."
    parameters: dict = {
        "type": "object",
        "properties": {
            "file": {
                "type": "string",
                "description": "Absolute path of the file to read"
            },
            "start_line": {
                "type": "integer",
                "description": "(Optional) Starting line to read from, 1-based"
            },
            "end_line": {
                "type": "integer",
                "description": "(Optional) Ending line number (inclusive)"
            }
        },
        "required": ["file"]
    }

    async def execute(self, file: str, start_line: int = None, end_line: int = None) -> ToolResult:
        if not os.path.isabs(file):
            return ToolResult(error=f"Path '{file}' is not an absolute path.")
        if not os.path.exists(file):
            return ToolResult(error=f"File not found at: {file}")
        if not os.path.isfile(file):
             return ToolResult(error=f"Path is a directory, not a file: {file}")

        try:
            with open(file, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            # Salva il contenuto completo prima di qualsiasi slicing
            full_content = "".join(lines)

            if start_line is not None and end_line is not None:
                if start_line > end_line:
                    return ToolResult(error="start_line cannot be greater than end_line.")
                # Adjust for 1-based indexing from user
                lines = lines[start_line-1:end_line]
            elif start_line is not None:
                lines = lines[start_line-1:]

            # --- INIZIO MODIFICA: Invia il contenuto del file al frontend ---
            if self.callback_handler:
                # Determina il linguaggio per la sintassi evidenziata
                language = "plaintext"
                if "." in file:
                    ext = file.split('.')[-1]
                    lang_map = {
                        "py": "python", "js": "javascript", "ts": "typescript",
                        "html": "html", "css": "css", "json": "json",
                        "md": "markdown", "sh": "shell", "tsx": "typescript"
                    }
                    language = lang_map.get(ext, "plaintext")

                # Invia il contenuto COMPLETO del file all'editor, non solo la porzione letta.
                # Questo dà all'utente il contesto completo.
                await self.callback_handler(
                    "code_editor",
                    content=full_content,
                    language=language
                )
            # --- FINE MODIFICA ---

            # Add line numbers for readability for the agent
            line_numbered_content = []
            start = start_line if start_line is not None else 1
            for i, line in enumerate(lines):
                line_numbered_content.append(f"{start + i:6d}\t{line.rstrip()}")

            return ToolResult(output="\n".join(line_numbered_content))

        except Exception as e:
            error_message = f"Failed to read file '{file}': {str(e)}"
            if self.callback_handler:
                 await self.callback_handler("chat", content=f"⚠️ Errore File: {error_message}")
            return ToolResult(error=error_message)
