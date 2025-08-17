from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserNavigateTool(BaseTool):
    name: str = "browser_navigate"
    description: str = "Navigates the browser to a specified URL."
    parameters: dict = {
        "type": "object",
        "properties": {
            "url": { "type": "string", "description": "The complete URL to visit." }
        },
        "required": ["url"]
    }

    async def execute(self, url: str) -> ToolResult:
        try:
            page = await browser_manager.get_current_page()
            await page.goto(url)
            await page.wait_for_load_state()
            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=f"Navigated to {url}.\n{state}")
        except Exception as e:
            return ToolResult(error=f"Failed to navigate to {url}: {str(e)}")