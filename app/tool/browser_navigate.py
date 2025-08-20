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
            # 1. Esegui la navigazione come prima
            page = await browser_manager.get_current_page()
            await page.goto(url)
            await page.wait_for_load_state()

            # 2. Ottieni lo stato aggiornato della pagina
            state = await browser_manager.get_current_state_for_agent()

            # --- INIZIO MODIFICA: Invia lo stato visuale al frontend ---
            if self.callback_handler:
                screenshot_b64 = state.get("screenshot")
                current_url = state.get("url", url) # Usa l'URL di destinazione come fallback

                if screenshot_b64:
                    screenshot_data_uri = f"data:image/png;base64,{screenshot_b64}"

                    # Invia il messaggio al frontend per aggiornare la tab "Browser"
                    await self.callback_handler(
                        "browser_view",
                        content=screenshot_data_uri,
                        url=current_url
                    )
            # --- FINE MODIFICA ---

            # 3. Restituisci il risultato testuale all'agente
            return ToolResult(output=f"Navigated to {url}.\n{state}")

        except Exception as e:
            error_message = f"Failed to navigate to {url}: {str(e)}"
            if self.callback_handler:
                 await self.callback_handler("chat", content=f"⚠️ Errore Browser: {error_message}")
            return ToolResult(error=error_message)

