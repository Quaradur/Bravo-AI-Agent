from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserViewTool(BaseTool):
    name: str = "browser_view"
    description: str = "Displays the content of the current browser page."
    parameters: dict = {"type": "object", "properties": {}}

    async def execute(self) -> ToolResult:
        try:
            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=state)
        except Exception as e:
            return ToolResult(error=f"Failed to view browser page: {str(e)}")