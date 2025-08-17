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
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content.replace(old_str, new_str)

            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)

            return ToolResult(output=f"Successfully replaced string in file: {file}")
        except Exception as e:
            return ToolResult(error=f"Failed to perform string replacement in '{file}': {str(e)}")