from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserConsoleExecTool(BaseTool):
    name: str = "browser_console_exec"
    description: str = "Executes custom JavaScript code in the browser console."
    parameters: dict = {
        "type": "object",
        "properties": {
            "javascript": {
                "type": "string",
                "description": "The JavaScript code to execute."
            }
        },
        "required": ["javascript"]
    }

    async def execute(self, javascript: str) -> ToolResult:
        try:
            page = await browser_manager.get_current_page()
            result = await page.evaluate(javascript)
            return ToolResult(output=f"JavaScript executed successfully. Return value: {result}")
        except Exception as e:
            return ToolResult(error=f"Failed to execute JavaScript in console: {str(e)}")