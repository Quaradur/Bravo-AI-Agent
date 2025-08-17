import asyncio
from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserPressKeyTool(BaseTool):
    name: str = "browser_press_key"
    description: str = "Simulates a key press (or key combination) on the current browser page."
    parameters: dict = {
        "type": "object",
        "properties": {
            "key": {
                "type": "string",
                "description": "Key name to simulate (e.g., 'Enter', 'Tab', 'Escape', 'ArrowUp'). Supports combinations like 'Control+C'."
            }
        },
        "required": ["key"]
    }

    async def execute(self, key: str) -> ToolResult:
        try:
            page = await browser_manager.get_current_page()
            await page.keyboard.press(key)
            await asyncio.sleep(1)  # Attendi un istante per vedere l'effetto

            state = await browser_manager.get_current_state_for_agent()
            return ToolResult(output=f"Pressed key '{key}'.\n{state}")
        except Exception as e:
            return ToolResult(error=f"Failed to press key '{key}': {str(e)}")