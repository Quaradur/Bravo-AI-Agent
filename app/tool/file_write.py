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
        if not os.path.isabs(file):
            file_path = os.path.join(config.workspace_root, file)
        else:
            file_path = file

        # --- INIZIO MODIFICA 1: Invia l'evento 'action' al frontend ---
        # Annuncia l'azione che sta per essere eseguita nel flusso di eventi.
        if self.callback_handler:
            action_title = "📄 Aggiunta a File" if append else "📄 Scrittura File"
            # Usiamo il percorso 'file' originale perché è quello che l'agente ha specificato.
            await self.callback_handler(
                "action",
                title=action_title,
                content=file
            )
        # --- FINE MODIFICA 1 ---

        try:
            directory = os.path.dirname(file_path)
            if not os.path.exists(directory):
                os.makedirs(directory)

            mode = 'a' if append else 'w'
            with open(file_path, mode, encoding='utf-8') as f:
                f.write(content)

            # --- INIZIO MODIFICA 2: Invia l'aggiornamento all'editor ---
            if self.callback_handler:
                full_content = ""
                try:
                    with open(file_path, 'r', encoding='utf-8') as f_read:
                        full_content = f_read.read()
                except Exception:
                    full_content = content

                language = "plaintext"
                if "." in file:
                    ext = file.split('.')[-1]
                    lang_map = {
                        "py": "python", "js": "javascript", "ts": "typescript",
                        "html": "html", "css": "css", "json": "json",
                        "md": "markdown", "sh": "shell", "tsx": "typescript"
                    }
                    language = lang_map.get(ext, "plaintext")

                await self.callback_handler(
                    "code_editor",
                    content=full_content,
                    language=language
                )
            # --- FINE MODIFICA 2 ---

            action = "appended to" if append else "written to"
            return ToolResult(output=f"Successfully {action} file: {file_path}")

        except Exception as e:
            error_message = f"Failed to write to file '{file_path}': {str(e)}"
            if self.callback_handler:
                 await self.callback_handler("chat", content=f"⚠️ Errore File: {error_message}")
            return ToolResult(error=error_message)


