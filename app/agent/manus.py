from typing import Dict, List, Optional

from pydantic import Field, model_validator

from app.agent.browser import BrowserContextHelper
from app.agent.toolcall import ToolCallAgent
from app.config import config
from app.logger import logger
from app.prompt.manus import NEXT_STEP_PROMPT, SYSTEM_PROMPT
from app.tool import ToolCollection
from app.tool.mcp import MCPClients, MCPClientTool
from app.tool.python_execute import PythonExecute

# Importiamo la nostra suite di strumenti completa e aggiornata
from app.tool.file_read import FileReadTool
from app.tool.file_write import FileWriteTool
from app.tool.file_str_replace import FileStrReplaceTool
from app.tool.file_find_in_content import FileFindInContentTool
from app.tool.file_find_by_name import FileFindByNameTool
from app.tool.shell_exec import ShellExecTool
from app.tool.shell_view import ShellViewTool
from app.tool.shell_kill_process import ShellKillProcessTool
from app.tool.browser_navigate import BrowserNavigateTool
from app.tool.browser_view import BrowserViewTool
from app.tool.browser_click import BrowserClickTool
from app.tool.browser_input import BrowserInputTool
from app.tool.browser_scroll_up import BrowserScrollUpTool
from app.tool.browser_scroll_down import BrowserScrollDownTool
from app.tool.browser_press_key import BrowserPressKeyTool
from app.tool.browser_select_option import BrowserSelectOptionTool
from app.tool.browser_restart import BrowserRestartTool
from app.tool.browser_move_mouse import BrowserMoveMouseTool
from app.tool.info_search_web import InfoSearchWebTool
from app.tool.deploy_expose_port import DeployExposePortTool
from app.tool.idle import IdleTool
from app.tool.shell_wait import ShellWaitTool
from app.tool.shell_write_to_process import ShellWriteToProcessTool
from app.tool.browser_console_exec import BrowserConsoleExecTool
from app.tool.browser_console_view import BrowserConsoleViewTool
from app.tool.deploy_apply_deployment import DeployApplyDeploymentTool
from app.tool.make_manus_page import MakeManusPageTool
from app.tool.message_notify_user import MessageNotifyUserTool
from app.tool.message_ask_user import MessageAskUserTool


class Manus(ToolCallAgent):
    """A versatile general-purpose agent with support for both local and MCP tools."""

    name: str = "Manus"
    description: str = "A versatile agent that can solve various tasks using multiple tools including MCP-based tools"

    system_prompt: str = SYSTEM_PROMPT.format(directory=config.workspace_root)
    next_step_prompt: str = NEXT_STEP_PROMPT

    max_observe: int = 10000
    max_steps: int = 20

    mcp_clients: MCPClients = Field(default_factory=MCPClients)

    # La lista completa di tutti gli strumenti che abbiamo implementato
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
            DeployExposePortTool(),
            IdleTool(),
            ShellWaitTool(),
            ShellWriteToProcessTool(),
            BrowserConsoleExecTool(),
            BrowserConsoleViewTool(),
            DeployApplyDeploymentTool(),
            MakeManusPageTool(),
            MessageNotifyUserTool(),
            MessageAskUserTool(),
        )
    )

    special_tool_names: list[str] = Field(default_factory=lambda: [IdleTool().name])
    browser_context_helper: Optional[BrowserContextHelper] = None

    connected_servers: Dict[str, str] = Field(default_factory=dict)
    _initialized: bool = False

    @model_validator(mode="after")
    def initialize_helper(self) -> "Manus":
        """Initialize basic components synchronously."""
        self.browser_context_helper = BrowserContextHelper(self)
        return self

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
                if server_config.type == "sse":
                    if server_config.url:
                        await self.connect_mcp_server(server_config.url, server_id)
                        logger.info(
                            f"Connected to MCP server {server_id} at {server_config.url}"
                        )
                elif server_config.type == "stdio":
                    if server_config.command:
                        await self.connect_mcp_server(
                            server_config.command,
                            server_id,
                            use_stdio=True,
                            stdio_args=server_config.args,
                        )
                        logger.info(
                            f"Connected to MCP server {server_id} using command {server_config.command}"
                        )
            except Exception as e:
                logger.error(f"Failed to connect to MCP server {server_id}: {e}")

    async def connect_mcp_server(
        self,
        server_url: str,
        server_id: str = "",
        use_stdio: bool = False,
        stdio_args: List[str] = None,
    ) -> None:
        """Connect to an MCP server and add its tools."""
        if use_stdio:
            await self.mcp_clients.connect_stdio(
                server_url, stdio_args or [], server_id
            )
            self.connected_servers[server_id or server_url] = server_url
        else:
            await self.mcp_clients.connect_sse(server_url, server_id)
            self.connected_servers[server_id or server_url] = server_url

        new_tools = [
            tool for tool in self.mcp_clients.tools if tool.server_id == server_id
        ]
        self.available_tools.add_tools(*new_tools)

    async def disconnect_mcp_server(self, server_id: str = "") -> None:
        """Disconnect from an MCP server and remove its tools."""
        await self.mcp_clients.disconnect(server_id)
        if server_id:
            self.connected_servers.pop(server_id, None)
        else:
            self.connected_servers.clear()

        base_tools = [
            tool
            for tool in self.available_tools.tools
            if not isinstance(tool, MCPClientTool)
        ]
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
            self.next_step_prompt = (
                await self.browser_context_helper.format_next_step_prompt()
            )

        result = await super().think()

        self.next_step_prompt = original_prompt
        return result