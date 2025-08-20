from app.tool.base import BaseTool, ToolResult
from app.tool.browser_manager import browser_manager

class BrowserViewTool(BaseTool):
    name: str = "browser_view"
    description: str = "Displays the content of the current browser page."
    parameters: dict = {"type": "object", "properties": {}}

    async def execute(self) -> ToolResult:
        try:
            # 1. Ottieni lo stato del browser. Questo metodo probabilmente restituisce
            #    sia il contenuto testuale per l'agente, sia lo screenshot.
            #    Assumiamo che restituisca un dizionario.
            state = await browser_manager.get_current_state_for_agent()

            # --- INIZIO MODIFICA: Invia lo stato visuale al frontend ---
            if self.callback_handler:
                # 2. Estrai lo screenshot e l'URL.
                #    Assumiamo che 'state' contenga queste chiavi.
                screenshot_b64 = state.get("screenshot")
                current_url = state.get("url", "N/D")

                if screenshot_b64:
                    # 3. Prepara il Data URI per l'immagine, che è il formato
                    #    che il tag <img> del browser può leggere direttamente.
                    screenshot_data_uri = f"data:image/png;base64,{screenshot_b64}"

                    # 4. Invia il messaggio al frontend.
                    await self.callback_handler(
                        "browser_view",
                        content=screenshot_data_uri,
                        url=current_url
                    )
            # --- FINE MODIFICA ---

            # 5. Restituisci l'intero stato all'agente per la sua logica interna.
            #    L'agente ha bisogno del testo, non dell'immagine.
            return ToolResult(output=state)

        except Exception as e:
            error_message = f"Failed to view browser page: {str(e)}"
            # Invia un messaggio di errore anche al frontend, se possibile
            if self.callback_handler:
                 await self.callback_handler("chat", content=f"⚠️ Errore Browser: {error_message}")
            return ToolResult(error=error_message)

