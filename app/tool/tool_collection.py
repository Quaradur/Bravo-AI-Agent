# app/tool/tool_collection.py

"""Collection classes for managing multiple tools."""
from typing import Any, Dict, List

from app.exceptions import ToolError
from app.logger import logger
from app.tool.base import BaseTool, ToolFailure, ToolResult


class ToolCollection:
    """A collection of defined tools."""

    class Config:
        arbitrary_types_allowed = True

    def __init__(self, *tools: BaseTool):
        self.tools = tools
        self.tool_map = {tool.name: tool for tool in tools}

    def __iter__(self):
        return iter(self.tools)

    def to_params(self) -> List[Dict[str, Any]]:
        return [tool.to_param() for tool in self.tools]

    # --- INIZIO BLOCCO MODIFICATO ---
    async def execute(
        self, *, name: str, tool_input: Dict[str, Any] = None
    ) -> ToolResult:
        """
        Executes a tool and ensures the output is always a ToolResult object.
        """
        tool = self.tool_map.get(name)
        if not tool:
            return ToolFailure(error=f"Tool {name} is invalid")

        try:
            # Assicuriamoci che tool_input non sia None per evitare errori
            args = tool_input or {}
            result = await tool(**args)

            # --- QUESTA È LA CORREZIONE FONDAMENTALE ---
            # Se il risultato NON è già un ToolResult (es. è una stringa),
            # lo incapsuliamo in un ToolResult prima di restituirlo.
            if not isinstance(result, ToolResult):
                return ToolResult(output=result)

            # Altrimenti, il risultato è già un oggetto corretto, quindi lo restituiamo.
            return result

        except ToolError as e:
            return ToolFailure(error=e.message)
        except Exception as e:
            # Aggiungiamo una gestione più generica per errori imprevisti
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Unexpected error executing tool {name}: {error_details}")
            return ToolFailure(error=f"Unexpected error in tool {name}: {str(e)}")
    # --- FINE BLOCCO MODIFICATO ---

    async def execute_all(self) -> List[ToolResult]:
        """Execute all tools in the collection sequentially."""
        results = []
        for tool in self.tools:
            try:
                result = await tool()
                results.append(result)
            except ToolError as e:
                results.append(ToolFailure(error=e.message))
        return results

    def get_tool(self, name: str) -> BaseTool:
        return self.tool_map.get(name)

    def add_tool(self, tool: BaseTool):
        """Add a single tool to the collection."""
        if tool.name in self.tool_map:
            logger.warning(f"Tool {tool.name} already exists in collection, skipping")
            return self

        self.tools += (tool,)
        self.tool_map[tool.name] = tool
        return self

    def add_tools(self, *tools: BaseTool):
        """Add multiple tools to the collection."""
        for tool in tools:
            self.add_tool(tool)
        return self

