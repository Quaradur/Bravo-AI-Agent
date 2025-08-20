import os
from app.tool.base import BaseTool, ToolResult

class FileStrReplaceTool(BaseTool):
    name: str = "file_str_replace"
    description: str = "Replace specified string in a file. Use for updating specific content in files or fixing errors in code."
    parameters: dict = {
        "type": "object",
        "properties": {
            "file": {
                "type": "string",
                "description": "Absolute path of the file to perform replacement on"
            },
            "old_str": {
                "type": "string",
                "description": "Original string to be replaced"
            },
            "new_str": {
                "type": "string",
                "description": "New string to replace with"
            }
        },
        "required": ["file", "old_str", "new_str"]
    }

    async def execute(self, file: str, old_str: str, new_str: str) -> ToolResult:
        if not os.path.isabs(file):
            return ToolResult(error=f"Path '{file}' is not an absolute path.")
        if not os.path.exists(file):
            return ToolResult(error=f"File not found at: {file}")

        try:
            # 1. Leggi, modifica e riscrivi il file
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content.replace(old_str, new_str)

            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)

            # --- INIZIO MODIFICA: Invia il contenuto aggiornato al frontend ---
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

                # Invia il nuovo contenuto del file all'editor
                await self.callback_handler(
                    "code_editor",
                    content=new_content,
                    language=language
                )
            # --- FINE MODIFICA ---

            return ToolResult(output=f"Successfully replaced string in file: {file}")

        except Exception as e:
            error_message = f"Failed to perform string replacement in '{file}': {str(e)}"
            if self.callback_handler:
                 await self.callback_handler("chat", content=f"⚠️ Errore File: {error_message}")
            return ToolResult(error=error_message)
