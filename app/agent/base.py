# app/agent/base.py

from abc import ABC, abstractmethod
from contextlib import asynccontextmanager
# --- INIZIO MODIFICA: Aggiunta import per il type hinting del callback ---
from typing import List, Optional, Any, Callable, Awaitable
# --- FINE MODIFICA ---

from pydantic import BaseModel, Field, model_validator

from app.llm import LLM
from app.logger import logger
from app.sandbox.client import SANDBOX_CLIENT
from app.schema import ROLE_TYPE, AgentState, Memory, Message
from app.utils.scratchpad import Scratchpad


class BaseAgent(BaseModel, ABC):
    """Abstract base class for managing agent state and execution.

    Provides foundational functionality for state transitions, memory management,
    and a step-based execution loop. Subclasses must implement the `step` method.
    """

    # Core attributes
    name: str = Field(..., description="Unique name of the agent")
    description: Optional[str] = Field(None, description="Optional agent description")

    # Prompts
    system_prompt: Optional[str] = Field(
        None, description="System-level instruction prompt"
    )
    next_step_prompt: Optional[str] = Field(
        None, description="Prompt for determining next action"
    )

    # Dependencies
    llm: LLM = Field(default_factory=LLM, description="Language model instance")
    memory: Memory = Field(default_factory=Memory, description="Agent's memory store")
    state: AgentState = Field(
        default=AgentState.IDLE, description="Current agent state"
    )

    # Execution control
    max_steps: int = Field(default=10, description="Maximum steps before termination")
    current_step: int = Field(default=0, description="Current step in execution")
    duplicate_threshold: int = 2

    # Shared memory/data stores
    scratchpad: Optional[Scratchpad] = None

    # --- INIZIO MODIFICA: Aggiunta del callback_handler ---
    # Questo campo conterrà la funzione per inviare messaggi al frontend.
    # Sarà None di default e verrà "iniettato" dal Flow o dal Session Manager.
    callback_handler: Optional[Callable[[str, Any], Awaitable[None]]] = None
    # --- FINE MODIFICA ---


    class Config:
        arbitrary_types_allowed = True
        extra = "allow"  # Allow extra fields for flexibility in subclasses

    @model_validator(mode="after")
    def initialize_agent(self) -> "BaseAgent":
        """Initialize agent with default settings if not provided."""
        if self.llm is None or not isinstance(self.llm, LLM):
            self.llm = LLM(config_name=self.name.lower())
        if not isinstance(self.memory, Memory):
            self.memory = Memory()
        return self

    @asynccontextmanager
    async def state_context(self, new_state: AgentState):
        """Context manager for safe agent state transitions."""
        if not isinstance(new_state, AgentState):
            raise ValueError(f"Invalid state: {new_state}")

        previous_state = self.state
        self.state = new_state
        try:
            yield
        except Exception as e:
            self.state = AgentState.ERROR
            raise e
        finally:
            self.state = previous_state

    def update_memory(
        self,
        role: ROLE_TYPE,  # type: ignore
        content: str,
        base64_image: Optional[str] = None,
        **kwargs,
    ) -> None:
        """Add a message to the agent's memory."""
        message_map = {
            "user": Message.user_message,
            "system": Message.system_message,
            "assistant": Message.assistant_message,
            "tool": lambda content, **kw: Message.tool_message(content, **kw),
        }

        if role not in message_map:
            raise ValueError(f"Unsupported message role: {role}")

        kwargs = {"base64_image": base64_image, **(kwargs if role == "tool" else {})}
        self.memory.add_message(message_map[role](content, **kwargs))

    async def run(self, request: Optional[str] = None, scratchpad: Optional[Scratchpad] = None) -> str:
        """Execute the agent's main loop asynchronously."""
        if self.state not in [AgentState.IDLE, AgentState.AWAITING_USER_INPUT]:
            raise RuntimeError(f"Cannot run agent from state: {self.state}")

        # Assegna lo scratchpad all'agente per questa esecuzione
        self.scratchpad = scratchpad

        if request:
            self.update_memory("user", request)

        results: List[str] = []
        async with self.state_context(AgentState.RUNNING):
            while (
                self.current_step < self.max_steps and self.state != AgentState.FINISHED
            ):
                self.current_step += 1
                logger.info(f"Executing step {self.current_step}/{self.max_steps}")

                # --- INIZIO MODIFICA: Invia un messaggio di "pensiero" al frontend ---
                # Prima di eseguire un passo, l'agente può comunicare cosa sta per fare.
                if self.callback_handler:
                    await self.callback_handler("thought", f"Inizio lo step {self.current_step}: sto decidendo la prossima azione...")
                # --- FINE MODIFICA ---

                step_result = await self.step()

                if hasattr(step_result, "system") and step_result.system == "AWAITING_USER_INPUT":
                    self.state = AgentState.AWAITING_USER_INPUT
                    logger.info("Agent is now awaiting user input.")
                    results.append(step_result.output)
                    break

                if self.is_stuck():
                    self.handle_stuck_state()

                results.append(f"Step {self.current_step}: {str(step_result)}")

            if self.current_step >= self.max_steps:
                self.current_step = 0
                self.state = AgentState.IDLE
                results.append(f"Terminated: Reached max steps ({self.max_steps})")

        if self.state != AgentState.AWAITING_USER_INPUT:
            await SANDBOX_CLIENT.cleanup()

        return "\n".join(results) if results else "No steps executed"

    @abstractmethod
    async def step(self) -> Any:
        """Execute a single step in the agent's workflow."""

    def handle_stuck_state(self):
        """Handle stuck state by adding a prompt to change strategy"""
        stuck_prompt = "\
        Observed duplicate responses. Consider new strategies and avoid repeating ineffective paths already attempted."
        self.next_step_prompt = f"{stuck_prompt}\n{self.next_step_prompt}"
        logger.warning(f"Agent detected stuck state. Added prompt: {stuck_prompt}")

    def is_stuck(self) -> bool:
        """Check if the agent is stuck in a loop by detecting duplicate content"""
        if len(self.memory.messages) < 2:
            return False

        last_message = self.memory.messages[-1]
        if not last_message.content:
            return False

        duplicate_count = sum(
            1
            for msg in reversed(self.memory.messages[:-1])
            if msg.role == "assistant" and msg.content == last_message.content
        )

        return duplicate_count >= self.duplicate_threshold

    @property
    def messages(self) -> List[Message]:
        """Retrieve a list of messages from the agent's memory."""
        return self.memory.messages

    @messages.setter
    def messages(self, value: List[Message]):
        """Set the list of messages in the agent's memory."""
        self.memory.messages = value


