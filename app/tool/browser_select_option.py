import asyncio
from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserSelectOptionTool(BaseTool):
    name: str = "browser_select_option"
    description: str = "Selects an option from a dropdown list element on the current browser page by specifying indices."
    parameters: dict = {
        "type": "object",
        "properties": {
            "index": {
                "type": "integer",
                "description": "Index number of the dropdown list element."
            },
            "option_index": {
                "type": "integer",
                "description": "The index of the option to select, starting from 0."
            }
        },
        "required": ["index", "option_index"]
    }

    async def execute(self, index: int, option_index: int) -> ToolResult:
        try:
            page = await browser_manager.get_current_page()
            element = await browser_manager.get_dom_element_by_index(index)
            if not element:
                return ToolResult(error=f"Dropdown element with index {index} not found.")

            # Seleziona l'opzione usando il suo indice
            await page.locator(f"xpath={element.xpath}").select_option(index=option_index)
            await asyncio.sleep(1)

            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=f"Selected option {option_index} from dropdown {index}.\n{state}")
        except Exception as e:
            return ToolResult(error=f"Failed to select option from dropdown {index}: {str(e)}")