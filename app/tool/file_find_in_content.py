import os
import re
from app.tool.base import BaseTool, ToolResult

class FileFindInContentTool(BaseTool):
    name: str = "file_find_in_content"
    description: str = "Searches for matching text within a file using a regular expression pattern."
    parameters: dict = {
        "type": "object",
        "properties": {
            "file": {
                "type": "string",
                "description": "Absolute path of the file to search within."
            },
            "regex": {
                "type": "string",
                "description": "Regular expression pattern to match."
            }
        },
        "required": ["file", "regex"]
    }

    async def execute(self, file: str, regex: str) -> ToolResult:
        if not os.path.isabs(file):
            return ToolResult(error=f"Path '{file}' is not an absolute path.")
        if not os.path.isfile(file):
            return ToolResult(error=f"File not found at: {file}")

        try:
            pattern = re.compile(regex)
            found_lines = []
            with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                for i, line in enumerate(f, 1):
                    if pattern.search(line):
                        found_lines.append(f"{i:6d}: {line.strip()}")
            
            if not found_lines:
                return ToolResult(output=f"No matches found for regex '{regex}' in file '{file}'.")
            
            return ToolResult(output="\n".join(found_lines))

        except re.error as e:
            return ToolResult(error=f"Invalid regular expression: {str(e)}")
        except Exception as e:
            return ToolResult(error=f"Failed to search in file '{file}': {str(e)}")