# in: app/tool/__init__.py

# Strumenti di base e core
from app.tool.base import BaseTool
from app.tool.tool_collection import ToolCollection
from app.tool.create_chat_completion import CreateChatCompletion
from app.tool.python_execute import PythonExecute
from app.tool.terminate import Terminate
from app.tool.idle import IdleTool
from app.tool.planning import PlanningTool

# La nostra suite di strumenti personalizzati, fedeli a Manus
from app.tool.file_read import FileReadTool
from app.tool.file_write import FileWriteTool
from app.tool.file_str_replace import FileStrReplaceTool
from app.tool.file_find_in_content import FileFindInContentTool
from app.tool.file_find_by_name import FileFindByNameTool

from app.tool.shell_exec import ShellExecTool
from app.tool.shell_view import ShellViewTool
from app.tool.shell_kill_process import ShellKillProcessTool
from app.tool.shell_wait import ShellWaitTool
from app.tool.shell_write_to_process import ShellWriteToProcessTool

from app.tool.info_search_web import InfoSearchWebTool

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
from app.tool.browser_console_exec import BrowserConsoleExecTool
from app.tool.browser_console_view import BrowserConsoleViewTool

from app.tool.deploy_expose_port import DeployExposePortTool
from app.tool.deploy_apply_deployment import DeployApplyDeploymentTool
from app.tool.make_manus_page import MakeManusPageTool

from app.tool.message_notify_user import MessageNotifyUserTool
from app.tool.message_ask_user import MessageAskUserTool


# La lista __all__ definisce quali strumenti sono "pubblici" per il resto dell'applicazione
__all__ = [
    "BaseTool", "ToolCollection", "CreateChatCompletion", "PythonExecute", "Terminate", "IdleTool", "PlanningTool",
    "FileReadTool", "FileWriteTool", "FileStrReplaceTool", "FileFindInContentTool", "FileFindByNameTool",
    "ShellExecTool", "ShellViewTool", "ShellKillProcessTool", "ShellWaitTool", "ShellWriteToProcessTool",
    "InfoSearchWebTool",
    "BrowserNavigateTool", "BrowserViewTool", "BrowserClickTool", "BrowserInputTool",
    "BrowserScrollUpTool", "BrowserScrollDownTool", "BrowserPressKeyTool", "BrowserSelectOptionTool",
    "BrowserRestartTool", "BrowserMoveMouseTool", "BrowserConsoleExecTool", "BrowserConsoleViewTool",
    "DeployExposePortTool", "DeployApplyDeploymentTool", "MakeManusPageTool",
    "MessageNotifyUserTool", "MessageAskUserTool",
]