from typing import Dict, List, Union
from app.agent.base import BaseAgent
from app.flow.base import BaseFlow
from app.utils.scratchpad import Scratchpad
from app.logger import logger

class OrchestratorFlow(BaseFlow):
    """
    An advanced flow that orchestrates collaboration between multiple agents
    using a shared scratchpad.
    """

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
        
        # The primary agent will internally loop, call other agents, and use the scratchpad
        # until it decides the task is complete.
        final_result = await self.primary_agent.run(
            request=f"User request: '{input_text}'. Formulate a plan and orchestrate the specialist agents to fulfill it. Use the provided scratchpad for inter-agent communication.",
            scratchpad=scratchpad
        )
        
        logger.info("✅ Orchestration complete.")
        logger.info(f"Final Scratchpad state:\n{scratchpad}")
        
        return final_result
