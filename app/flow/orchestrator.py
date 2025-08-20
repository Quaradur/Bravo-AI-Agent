# --- INIZIO MODIFICA: Aggiunta import necessari ---
from typing import Dict, List, Union, Callable, Awaitable
# --- FINE MODIFICA ---

from app.agent.base import BaseAgent
from app.flow.base import BaseFlow
from app.utils.scratchpad import Scratchpad
from app.logger import logger

class OrchestratorFlow(BaseFlow):
    """
    An advanced flow that orchestrates collaboration between multiple agents
    using a shared scratchpad.
    """

    # --- INIZIO MODIFICA: Aggiunta del metodo __init__ ---
    def __init__(self,
                 agents: Dict[str, BaseAgent],
                 primary_agent_name: str,
                 callback_handler: Callable[[str, any], Awaitable[None]] = None):
        """
        Inizializza l'OrchestratorFlow.

        Args:
            agents: Un dizionario di tutti gli agenti disponibili per il flusso.
            primary_agent_name: Il nome dell'agente che funge da orchestratore.
            callback_handler: La funzione asincrona per inviare messaggi al frontend.
        """
        # Chiama il costruttore della classe base per impostare gli agenti
        super().__init__(agents, primary_agent_name)

        self.callback_handler = callback_handler

        # Inietta il callback_handler in OGNI agente gestito da questo flusso.
        # Questo è il passaggio cruciale: ora sia l'agente primario che quelli
        # specialisti possono comunicare con il frontend.
        if self.callback_handler:
            for agent_name, agent_instance in self.agents.items():
                agent_instance.callback_handler = self.callback_handler
                logger.info(f"Callback handler injected into agent: {agent_name}")
    # --- FINE MODIFICA ---


    async def execute(self, input_text: str) -> str:
        """
        Executes the orchestration flow.

        1.  The primary agent (Manus) acts as the orchestrator.
        2.  It receives the user request and creates a plan.
        3.  It delegates tasks to specialist agents, passing them the shared scratchpad.
        4.  Agents write their results to the scratchpad.
        5.  The orchestrator reviews the scratchpad and decides the next step until the goal is met.
        """
        if not self.primary_agent:
            raise ValueError("OrchestratorFlow requires a primary agent (e.g., Manus).")

        # Initialize the shared memory for this execution run
        scratchpad = Scratchpad(initial_data={"user_request": input_text})

        # The primary agent receives the initial request and the scratchpad
        # Its goal is to manage the entire workflow from here.
        logger.info(f"🚀 Orchestrator starting with primary agent: {self.primary_agent.name}")

        # Non c'è bisogno di passare il callback qui, perché l'agente
        # lo ha già ricevuto durante l'inizializzazione.
        final_result = await self.primary_agent.run(
            request=f"User request: '{input_text}'. Formulate a plan and orchestrate the specialist agents to fulfill it. Use the provided scratchpad for inter-agent communication.",
            scratchpad=scratchpad
        )

        logger.info("✅ Orchestration complete.")
        logger.info(f"Final Scratchpad state:\n{scratchpad}")

        return final_result


