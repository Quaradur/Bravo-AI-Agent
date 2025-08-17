import asyncio
import time

# Importiamo tutti gli agenti che compongono il nostro team
from app.agent.manus import Manus
from app.agent.browser import BrowserAgent
from app.agent.swe import SWEAgent
from app.agent.data_analysis import DataAnalysis
from app.agent.code_writer_agent import CodeWriterAgent

from app.config import config
from app.flow.flow_factory import FlowFactory, FlowType
from app.logger import logger


async def run_flow():
    """
    Esegue il flusso di orchestrazione principale, assemblando il team di agenti
    e passando il controllo all'agente Manager (Manus).
    """
    
    # Definiamo il team completo di agenti specialisti.
    # 'manus' è il nostro manager/orchestratore.
    agents = {
        "manus": Manus(),
        "browser": BrowserAgent(),
        "swe": SWEAgent(),
        "data_analysis": DataAnalysis(),
        "code_writer": CodeWriterAgent(), 
    }
    
    try:
        prompt = input("Enter your prompt: ")

        if not prompt.strip():
            logger.warning("Empty prompt provided.")
            return

        # Il FlowFactory crea il flusso di pianificazione, passando l'intero team di agenti.
        # 'manus' è impostato come agente primario di default.
        flow = FlowFactory.create_flow(
            flow_type=FlowType.PLANNING,
            agents=agents,
        )
        
        logger.warning("Processing your request with the multi-agent team...")

        try:
            start_time = time.time()
            result = await asyncio.wait_for(
                flow.execute(prompt),
                timeout=3600,  # 60 minuti di timeout per l'intera esecuzione
            )
            elapsed_time = time.time() - start_time
            logger.info(f"Request processed in {elapsed_time:.2f} seconds")
            logger.info(f"Final Result:\n{result}")
        except asyncio.TimeoutError:
            logger.error("Request processing timed out after 1 hour")
            logger.info(
                "Operation terminated due to timeout. Please try a simpler request."
            )

    except KeyboardInterrupt:
        logger.info("Operation cancelled by user.")
    except Exception as e:
        logger.error(f"An error occurred in the flow: {str(e)}", exc_info=True)


if __name__ == "__main__":
    # Assicurati di eseguire questo script per usare l'architettura multi-agente
    asyncio.run(run_flow())