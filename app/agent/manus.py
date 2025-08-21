import os
import json
from typing import Dict, List, Optional

from pydantic import Field, model_validator

from app.agent.browser import BrowserContextHelper
from app.agent.toolcall import ToolCallAgent
from app.config import config, PROJECT_ROOT
from app.logger import logger
from app.prompt.manus import NEXT_STEP_PROMPT, SYSTEM_PROMPT
from app.tool import ToolCollection
from app.tool.mcp import MCPClients, MCPClientTool
from app.tool.idle import IdleTool
from app.utils.tool_loader import load_tools_from_directory
from app.tool.base import ToolResult
from app.schema import ToolCall


TOOL_DIR = PROJECT_ROOT / "app" / "tool"


class Manus(ToolCallAgent):
    """A versatile general-purpose agent with support for both local and MCP tools."""

    name: str = "Manus"
    description: str = "A versatile agent that can solve various tasks using multiple tools including MCP-based tools"

    system_prompt: str = SYSTEM_PROMPT
    next_step_prompt: str = NEXT_STEP_PROMPT

    max_observe: int = 10000
    max_steps: int = 20

    mcp_clients: MCPClients = Field(default_factory=MCPClients)

    available_tools: ToolCollection = Field(
        default_factory=lambda: ToolCollection(
            *load_tools_from_directory(TOOL_DIR)
        )
    )

    special_tool_names: list[str] = Field(default_factory=lambda: [IdleTool().name])
    browser_context_helper: Optional[BrowserContextHelper] = None

    connected_servers: Dict[str, str] = Field(default_factory=dict)
    _initialized: bool = False

    @model_validator(mode="after")
    def initialize_helper(self) -> "Manus":
        """Initialize components and inject callbacks into tools."""
        self.browser_context_helper = BrowserContextHelper(self)

        if self.callback_handler:
            for tool in self.available_tools.tools:
                tool.callback_handler = self.callback_handler

        return self

    # --- INIZIO BLOCCO MODIFICATO ---
    async def step(self) -> ToolResult:
        """
        Executes one step of the agent's thinking and action loop,
        adding communication for thoughts.
        """
        should_continue = await self.think()
        if not should_continue:
            last_message = self.memory.messages[-1]
            if self.callback_handler and last_message.content:
                await self.callback_handler("summary", content=last_message.content)
            return ToolResult(output="No tool call was made.")

        last_message = self.memory.messages[-1]
        tool_calls = last_message.tool_calls
        thought = last_message.content

        if thought and self.callback_handler:
            await self.callback_handler("thought", content=thought)

        results = await self.execute_tool_calls(tool_calls)

        for res in results:
            # CORREZIONE: Passa la rappresentazione stringa del risultato completo,
            # che gestisce correttamente i casi in cui l'output è nullo.
            # Invece di `res.output`, usiamo `str(res)`.
            self.update_memory("tool", str(res), tool_call_id=res.tool_call_id, name=res.name)

        return sum(results, ToolResult())
    # --- FINE BLOCCO MODIFICATO ---

    async def execute_tool_calls(self, tool_calls: List[ToolCall]) -> List[ToolResult]:
        """
        Executes tool calls sequentially, sending 'action' events to the frontend
        before each execution.
        """
        results = []
        if not tool_calls:
            return results

        for tool_call in tool_calls:
            tool_name = tool_call.function.name

            try:
                tool_args_dict = json.loads(tool_call.function.arguments or '{}')
            except json.JSONDecodeError:
                tool_args_dict = {}

            if self.callback_handler:
                title = f"⚙️ Esecuzione: {tool_name}"
                if "file" in tool_name:
                    title = f"📄 File: {tool_name}"
                elif "browser" in tool_name:
                    title = f"🌐 Browser: {tool_name}"
                elif "shell" in tool_name or "bash" in tool_name:
                    title = f">_ Terminale: {tool_name}"
                elif "python" in tool_name:
                    title = f"🐍 Python: {tool_name}"
                elif "planning" in tool_name:
                    title = f"📝 Planning: {tool_name}"

                content = ", ".join(f"{k}='{v}'" for k, v in tool_args_dict.items())

                await self.callback_handler(
                    "action",
                    title=title,
                    content=content
                )

            result = await self.available_tools.execute(name=tool_name, tool_input=tool_args_dict)

            result.tool_call_id = tool_call.id
            result.name = tool_name
            results.append(result)

        return results

    @classmethod
    async def create(cls, **kwargs) -> "Manus":
        """Factory method to create and properly initialize a Manus instance."""
        instance = cls(**kwargs)
        await instance.initialize_mcp_servers()
        instance._initialized = True
        return instance

    async def initialize_mcp_servers(self) -> None:
        """Initialize connections to configured MCP servers."""
        if not config.mcp_config or not config.mcp_config.servers:
            return
        for server_id, server_config in config.mcp_config.servers.items():
            try:
                if server_config.type == "sse" and server_config.url:
                    await self.connect_mcp_server(server_config.url, server_id)
                    logger.info(f"Connected to MCP server {server_id} at {server_config.url}")
                elif server_config.type == "stdio" and server_config.command:
                    await self.connect_mcp_server(
                        server_config.command, server_id, use_stdio=True, stdio_args=server_config.args
                    )
                    logger.info(f"Connected to MCP server {server_id} using command {server_config.command}")
            except Exception as e:
                logger.error(f"Failed to connect to MCP server {server_id}: {e}")

    async def connect_mcp_server(
        self, server_url: str, server_id: str = "", use_stdio: bool = False, stdio_args: List[str] = None
    ) -> None:
        """Connect to an MCP server and add its tools."""
        if use_stdio:
            await self.mcp_clients.connect_stdio(server_url, stdio_args or [], server_id)
        else:
            await self.mcp_clients.connect_sse(server_url, server_id)
        self.connected_servers[server_id or server_url] = server_url
        new_tools = [tool for tool in self.mcp_clients.tools if tool.server_id == server_id]
        self.available_tools.add_tools(*new_tools)

    async def disconnect_mcp_server(self, server_id: str = "") -> None:
        """Disconnect from an MCP server and remove its tools."""
        await self.mcp_clients.disconnect(server_id)
        if server_id:
            self.connected_servers.pop(server_id, None)
        else:
            self.connected_servers.clear()
        base_tools = [tool for tool in self.available_tools.tools if not isinstance(tool, MCPClientTool)]
        self.available_tools = ToolCollection(*base_tools)
        self.available_tools.add_tools(*self.mcp_clients.tools)

    async def cleanup(self):
        """Clean up Manus agent resources."""
        if self.browser_context_helper:
            await self.browser_context_helper.cleanup_browser()
        if self._initialized:
            await self.disconnect_mcp_server()
            self._initialized = False

    async def think(self) -> bool:
        """Process current state and decide next actions with appropriate context."""
        if not self._initialized:
            await self.initialize_mcp_servers()
            self._initialized = True

        original_prompt = self.next_step_prompt
        recent_messages = self.memory.messages[-3:] if self.memory.messages else []

        browser_in_use = any(
            tc.function.name.startswith("browser_")
            for msg in recent_messages
            if msg.tool_calls
            for tc in msg.tool_calls
        )

        if browser_in_use:
            self.next_step_prompt = await self.browser_context_helper.format_next_step_prompt()

        result = await super().think()
        self.next_step_prompt = original_prompt
        return result




