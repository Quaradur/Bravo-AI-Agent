import os
import glob
from app.tool.base import BaseTool, ToolResult

class FileFindByNameTool(BaseTool):
    name: str = "file_find_by_name"
    description: str = "Finds files by a filename pattern (using glob syntax) within a specified directory."
    parameters: dict = {
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "Absolute path of the directory to search in."
            },
            "glob": {
                "type": "string",
                "description": "Filename pattern using glob syntax wildcards (e.g., '*.txt', '**/*.py')."
            }
        },
        "required": ["path", "glob"]
    }

    async def execute(self, path: str, glob_pattern: str) -> ToolResult:
        if not os.path.isabs(path):
            return ToolResult(error=f"Path '{path}' is not an absolute path.")
        if not os.path.isdir(path):
            return ToolResult(error=f"Directory not found at: {path}")

        try:
            # Crea il percorso completo per la ricerca glob
            full_pattern = os.path.join(path, glob_pattern)
            
            # Esegui la ricerca, ricorsiva se il pattern include '**'
            recursive = '**' in glob_pattern
            results = glob.glob(full_pattern, recursive=recursive)
            
            if not results:
                return ToolResult(output=f"No files found matching '{glob_pattern}' in '{path}'.")

            return ToolResult(output="\n".join(results))

        except Exception as e:
            return ToolResult(error=f"Failed to find files in '{path}' with pattern '{glob_pattern}': {str(e)}")