from pydantic import Field
from app.agent.toolcall import ToolCallAgent
from app.tool import ToolCollection, PythonExecute, FileWriteTool, IdleTool

class CodeWriterAgent(ToolCallAgent):
    """
    An agent specialized ONLY in writing Python code to files.
    It receives a clear instruction and executes it.
    """
    name: str = "CodeWriterAgent"
    description: str = "A specialist agent for writing Python code to a specified file. It does not browse or analyze, it only writes."

    system_prompt: str = """
    You are a specialized AI agent. Your ONLY purpose is to write the provided Python code into a specified file.
    1. Use the `file_write` tool.
    2. Use the exact file path and content you are given.
    3. Once the file is written, your task is complete. Use the `idle` tool to finish.
    Do not perform any other actions.
    """

    # Questo agente ha accesso solo agli strumenti per scrivere file ed eseguire codice
    available_tools: ToolCollection = Field(
        default_factory=lambda: ToolCollection(
            FileWriteTool(),
            PythonExecute(),
            IdleTool()
        )
    )