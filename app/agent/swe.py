from typing import List
from pydantic import Field

from app.agent.toolcall import ToolCallAgent
from app.prompt.swe import SYSTEM_PROMPT
# Importiamo la suite completa di strumenti per lo sviluppo
from app.tool import (
    ToolCollection, IdleTool, PythonExecute,
    FileReadTool, FileWriteTool, FileStrReplaceTool, FileFindInContentTool, FileFindByNameTool,
    ShellExecTool, ShellViewTool, ShellKillProcessTool, ShellWaitTool, ShellWriteToProcessTool
)

class SWEAgent(ToolCallAgent):
    """
    An agent that implements the SWEAgent paradigm for executing code and natural conversations.
    It acts as a specialist for software development tasks.
    """

    name: str = "SWEAgent"
    description: str = "A specialist agent for software development tasks, including writing, testing, and debugging code."

    system_prompt: str = SYSTEM_PROMPT
    next_step_prompt: str = "Based on the manager's request, what is the next coding or file system action to take?"

    # Set di strumenti specializzato per lo sviluppo software
    available_tools: ToolCollection = Field(
        default_factory=lambda: ToolCollection(
            PythonExecute(),
            FileReadTool(),
            FileWriteTool(),
            FileStrReplaceTool(),
            FileFindInContentTool(),
            FileFindByNameTool(),
            ShellExecTool(),
            ShellViewTool(),
            ShellKillProcessTool(),
            ShellWaitTool(),
            ShellWriteToProcessTool(),
            IdleTool()
        )
    )
    
    special_tool_names: List[str] = Field(default_factory=lambda: [IdleTool().name])
    max_steps: int = 20