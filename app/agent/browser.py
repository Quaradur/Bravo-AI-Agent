import json
from typing import TYPE_CHECKING, Optional

from pydantic import Field, model_validator

from app.agent.toolcall import ToolCallAgent
from app.logger import logger
from app.prompt.browser import NEXT_STEP_PROMPT, SYSTEM_PROMPT
from app.schema import Message, ToolChoice
# Importiamo l'intera suite di strumenti per il browser e quelli di base
from app.tool import (
    ToolCollection, IdleTool, InfoSearchWebTool,
    BrowserNavigateTool, BrowserViewTool, BrowserClickTool, BrowserInputTool,
    BrowserScrollUpTool, BrowserScrollDownTool, BrowserPressKeyTool,
    BrowserSelectOptionTool, BrowserRestartTool, BrowserMoveMouseTool,
    BrowserConsoleExecTool, BrowserConsoleViewTool
)
# Importiamo il nostro nuovo manager centralizzato
from app.tool.browser_manager import browser_manager


# Avoid circular import if BrowserAgent needs BrowserContextHelper
if TYPE_CHECKING:
    from app.agent.base import BaseAgent


class BrowserContextHelper:
    def __init__(self, agent: "BaseAgent"):
        self.agent = agent
        self._current_base64_image: Optional[str] = None

    async def get_browser_state(self) -> Optional[dict]:
        # Ora usiamo direttamente il browser_manager
        try:
            state_output = await browser_manager.get_current_state_for_agent()
            # Simuliamo un output simile a prima per compatibilità
            state_dict = {}
            for line in state_output.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip('- ').lower().replace(' ', '_')
                    state_dict[key] = value.strip()
            return state_dict
        except Exception as e:
            logger.debug(f"Failed to get browser state via manager: {str(e)}")
            return None

    async def format_next_step_prompt(self) -> str:
        """Gets browser state and formats the browser prompt."""
        browser_state_text = await browser_manager.get_current_state_for_agent()
        
        return NEXT_STEP_PROMPT.format(
            url_placeholder=browser_state_text,
            tabs_placeholder="",
            content_above_placeholder="",
            content_below_placeholder="",
            results_placeholder="",
        )

    async def cleanup_browser(self):
        # Chiamiamo il cleanup del manager
        await browser_manager.cleanup()


class BrowserAgent(ToolCallAgent):
    """
    A specialist agent for all web browsing tasks. It receives specific instructions 
    from a manager agent and executes them using its suite of browser tools.
    """

    name: str = "BrowserAgent"
    description: str = "A specialist agent for all web browsing tasks. It receives specific instructions and executes them."

    system_prompt: str = """
    You are a specialized web browsing assistant. You are part of a team and receive instructions from a manager agent.
    Your ONLY purpose is to execute the web browsing task you are given.
    1. Analyze the instruction (e.g., 'navigate to a site', 'find a piece of text', 'click a button').
    2. Use your available browser tools to complete the instruction step-by-step.
    3. Once the specific instruction is completed, report the result and finish your task using the `idle` tool.
    Do not perform tasks outside of your given instruction.
    """
    next_step_prompt: str = NEXT_STEP_PROMPT

    max_observe: int = 10000
    max_steps: int = 20

    # Set di strumenti super-specializzato per il browser
    available_tools: ToolCollection = Field(
        default_factory=lambda: ToolCollection(
            InfoSearchWebTool(),
            BrowserNavigateTool(),
            BrowserViewTool(),
            BrowserClickTool(),
            BrowserInputTool(),
            BrowserScrollUpTool(),
            BrowserScrollDownTool(),
            BrowserPressKeyTool(),
            BrowserSelectOptionTool(),
            BrowserRestartTool(),
            BrowserMoveMouseTool(),
            BrowserConsoleExecTool(),
            BrowserConsoleViewTool(),
            IdleTool()
        )
    )

    tool_choices: ToolChoice = ToolChoice.AUTO
    special_tool_names: list[str] = Field(default_factory=lambda: [IdleTool().name])

    browser_context_helper: Optional[BrowserContextHelper] = None

    @model_validator(mode="after")
    def initialize_helper(self) -> "BrowserAgent":
        self.browser_context_helper = BrowserContextHelper(self)
        return self

    async def think(self) -> bool:
        """Process current state and decide next actions using tools, with browser state info added"""
        self.next_step_prompt = (
            await self.browser_context_helper.format_next_step_prompt()
        )
        return await super().think()

    async def cleanup(self):
        """Clean up browser agent resources by calling parent cleanup."""
        await self.browser_context_helper.cleanup_browser()