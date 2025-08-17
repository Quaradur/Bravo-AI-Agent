from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserRestartTool(BaseTool):
    name: str = "browser_restart"
    description: str = "Restarts the browser and navigates to a specified URL. Use when the browser state needs to be reset."
    parameters: dict = {
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "description": "The complete URL to visit after the restart."
            }
        },
        "required": ["url"]
    }

    async def execute(self, url: str) -> ToolResult:
        try:
            await browser_manager.restart_browser()
            
            # Dopo il riavvio, naviga al nuovo URL
            page = await browser_manager.get_current_page()
            await page.goto(url)
            await page.wait_for_load_state()
            
            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=f"Browser restarted and navigated to {url}.\n{state}")
        except Exception as e:
            return ToolResult(error=f"Failed to restart browser: {str(e)}")