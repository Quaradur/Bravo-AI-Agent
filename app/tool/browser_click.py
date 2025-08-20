import asyncio
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
            # 1. Trova ed esegui il click sull'elemento
            context = await browser_manager.get_context()
            element = await browser_manager.get_dom_element_by_index(index)
            if not element:
                return ToolResult(error=f"Element with index {index} not found.")

            await context._click_element_node(element)

            # 2. Attendi che la pagina reagisca al click
            await asyncio.sleep(2)

            # 3. Ottieni lo stato aggiornato della pagina
            state = await browser_manager.get_current_state_for_agent()

            # --- INIZIO MODIFICA: Invia lo stato visuale al frontend ---
            if self.callback_handler:
                screenshot_b64 = state.get("screenshot")
                current_url = state.get("url", "N/D")

                if screenshot_b64:
                    screenshot_data_uri = f"data:image/png;base64,{screenshot_b64}"

                    # Invia il messaggio per aggiornare la tab "Browser"
                    await self.callback_handler(
                        "browser_view",
                        content=screenshot_data_uri,
                        url=current_url
                    )
            # --- FINE MODIFICA ---

            # 4. Restituisci il risultato testuale all'agente
            return ToolResult(output=f"Clicked element with index {index}.\n{state}")

        except Exception as e:
            error_message = f"Failed to click element {index}: {str(e)}"
            if self.callback_handler:
                 await self.callback_handler("chat", content=f"⚠️ Errore Browser: {error_message}")
            return ToolResult(error=error_message)

