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

            if start_line is not None and end_line is not None:
                if start_line > end_line:
                    return ToolResult(error="start_line cannot be greater than end_line.")
                # Adjust for 1-based indexing from user
                lines = lines[start_line-1:end_line]
            elif start_line is not None:
                lines = lines[start_line-1:]
            
            content = "".join(lines)
            
            # Add line numbers for readability
            line_numbered_content = []
            start = start_line if start_line is not None else 1
            for i, line in enumerate(lines):
                line_numbered_content.append(f"{start + i:6d}\t{line.rstrip()}")

            return ToolResult(output="\n".join(line_numbered_content))

        except Exception as e:
            return ToolResult(error=f"Failed to read file '{file}': {str(e)}")