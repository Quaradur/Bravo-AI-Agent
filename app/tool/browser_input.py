import asyncio
from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserInputTool(BaseTool):
    name: str = "browser_input"
    description: str = "Overwrites text in editable elements on the current browser page. Use when filling content in input fields."
    parameters: dict = {
        "type": "object",
        "properties": {
            "index": {
                "type": "integer",
                "description": "Index number of the element to input text into."
            },
            "text": {
                "type": "string",
                "description": "The complete text content to input."
            },
            "press_enter": {
                "type": "boolean",
                "description": "Whether to press Enter key after input. Defaults to false.",
                "default": False
            }
        },
        "required": ["index", "text"]
    }

    async def execute(self, index: int, text: str, press_enter: bool = False) -> ToolResult:
        try:
            # 1. Trova l'elemento e inserisci il testo
            context = await browser_manager.get_context()
            element = await browser_manager.get_dom_element_by_index(index)
            if not element:
                return ToolResult(error=f"Element with index {index} not found.")

            await context._input_text_element_node(element, text)

            # 2. Premi Invio se richiesto e attendi
            if press_enter:
                page = await browser_manager.get_current_page()
                await page.keyboard.press("Enter")
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
            action_receipt = f"Input text '{text}' into element with index {index}."
            if press_enter:
                action_receipt += " Pressed Enter."

            return ToolResult(output=f"{action_receipt}\n{state}")

        except Exception as e:
            error_message = f"Failed to input text into element {index}: {str(e)}"
            if self.callback_handler:
                 await self.callback_handler("chat", content=f"⚠️ Errore Browser: {error_message}")
            return ToolResult(error=error_message)

