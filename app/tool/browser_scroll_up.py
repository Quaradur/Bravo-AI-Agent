import asyncio
from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserScrollUpTool(BaseTool):
    name: str = "browser_scroll_up"
    description: str = "Scrolls the current browser page upward, one viewport at a time."
    parameters: dict = {"type": "object", "properties": {}}

    async def execute(self) -> ToolResult:
        try:
            page = await browser_manager.get_current_page()
            # Esegue uno script JS per scorrere in su dell'altezza della finestra
            await page.evaluate("window.scrollBy(0, -window.innerHeight)")
            await asyncio.sleep(1) # Attendi che lo scrolling si completi
            
            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=f"Scrolled up one page.\n{state}")
        except Exception as e:
            return ToolResult(error=f"Failed to scroll up: {str(e)}")