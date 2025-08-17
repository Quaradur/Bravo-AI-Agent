import asyncio
from typing import Optional
from browser_use import Browser as BrowserUseBrowser, BrowserConfig
from browser_use.browser.context import BrowserContext

class BrowserManager:
    _instance = None
    browser: Optional[BrowserUseBrowser] = None
    context: Optional[BrowserContext] = None
    lock: asyncio.Lock = asyncio.Lock()

    # Singleton Pattern: assicura che ci sia una sola istanza
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BrowserManager, cls).__new__(cls)
        return cls._instance

    async def get_context(self) -> BrowserContext:
        """
        Restituisce il contesto del browser, inizializzandolo se necessario.
        Questo metodo assicura che il browser venga avviato una sola volta.
        """
        async with self.lock:
            if self.context is None:
                # Configurazione di base per il browser
                browser_config = BrowserConfig(headless=False, disable_security=True)
                self.browser = BrowserUseBrowser(browser_config)
                self.context = await self.browser.new_context()
                print("--- Browser avviato e contesto creato ---")
        return self.context

    async def get_current_page(self):
        """Ottiene la pagina attualmente attiva nel browser."""
        context = await self.get_context()
        return await context.get_current_page()

    async def get_dom_element_by_index(self, index: int):
        """Trova un elemento DOM interattivo tramite il suo indice numerico."""
        context = await self.get_context()
        return await context.get_dom_element_by_index(index)

    async def get_current_state_for_agent(self) -> str:
        """
        Fornisce una rappresentazione testuale dello stato attuale della pagina
        per l'agente AI.
        """
        context = await self.get_context()
        if not context:
            return "Browser non inizializzato."
        
        try:
            state = await context.get_state()
            page_title = state.title or "N/A"
            page_url = state.url or "N/A"
            
            elements_str = "Nessun elemento interattivo trovato."
            if state.element_tree:
                elements_str = state.element_tree.clickable_elements_to_string()
            
            return (
                f"Stato attuale del browser:\n"
                f"- Titolo: {page_title}\n"
                f"- URL: {page_url}\n\n"
                f"Elementi interattivi:\n{elements_str}"
            )
        except Exception as e:
            return f"Errore nel recuperare lo stato del browser: {e}"

    # --- NUOVO METODO AGGIUNTO QUI ---
    async def restart_browser(self):
        """Chiude e riapre forzatamente l'istanza del browser e del contesto."""
        async with self.lock:
            if self.browser:
                await self.browser.close()
            
            # Resetta le variabili di stato
            self.browser = None
            self.context = None
            print("--- Browser riavviato ---")
            # Il prossimo get_context() creerà una nuova istanza pulita

    async def cleanup(self):
        """Chiude il browser e tutte le sue risorse."""
        async with self.lock:
            if self.browser:
                await self.browser.close()
                self.browser = None
                self.context = None
                print("--- Browser e contesto chiusi correttamente ---")

# Istanza globale del manager
browser_manager = BrowserManager()