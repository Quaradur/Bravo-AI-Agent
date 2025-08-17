from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserClickTool(BaseTool):
    name: str = "browser_click"
    description: str = "Simulates a click on an element on the current browser page by its index."
    parameters: dict = {
        "type": "object",
        "properties": {
            "index": { "type": "integer", "description": "Index number of the element to click." }
        },
        "required": ["index"]
    }

    async def execute(self, index: int) -> ToolResult:
        try:
            context = await browser_manager.get_context()
            element = await browser_manager.get_dom_element_by_index(index)
            if not element:
                return ToolResult(error=f"Element with index {index} not found.")
            
            # La libreria sottostante gestisce il click
            await context._click_element_node(element)
            
            # Aspetta un po' per il caricamento della pagina
            await asyncio.sleep(2) 
            
            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=f"Clicked element with index {index}.\n{state}")
        except Exception as e:
            return ToolResult(error=f"Failed to click element {index}: {str(e)}")