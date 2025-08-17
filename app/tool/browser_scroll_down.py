import asyncio
from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserScrollDownTool(BaseTool):
    name: str = "browser_scroll_down"
    description: str = "Scrolls the current browser page downward, one viewport at a time."
    parameters: dict = {"type": "object", "properties": {}}

    async def execute(self) -> ToolResult:
        try:
            page = await browser_manager.get_current_page()
            # Esegue uno script JS per scorrere in giù dell'altezza della finestra
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await asyncio.sleep(1) # Attendi che lo scrolling si completi

            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=f"Scrolled down one page.\n{state}")
        except Exception as e:
            return ToolResult(error=f"Failed to scroll down: {str(e)}")