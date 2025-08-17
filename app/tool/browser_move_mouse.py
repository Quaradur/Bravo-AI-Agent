from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserMoveMouseTool(BaseTool):
    name: str = "browser_move_mouse"
    description: str = "Moves the mouse cursor to specified X and Y coordinates on the browser page."
    parameters: dict = {
        "type": "object",
        "properties": {
            "coordinate_x": {
                "type": "number",
                "description": "The target X coordinate for the cursor."
            },
            "coordinate_y": {
                "type": "number",
                "description": "The target Y coordinate for the cursor."
            }
        },
        "required": ["coordinate_x", "coordinate_y"]
    }

    async def execute(self, coordinate_x: float, coordinate_y: float) -> ToolResult:
        try:
            page = await browser_manager.get_current_page()
            await page.mouse.move(coordinate_x, coordinate_y)
            return ToolResult(output=f"Mouse moved to coordinates ({coordinate_x}, {coordinate_y}).")
        except Exception as e:
            return ToolResult(error=f"Failed to move mouse: {str(e)}")