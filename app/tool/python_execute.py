import multiprocessing
import sys
from io import StringIO
from typing import Dict

from app.tool.base import BaseTool


class PythonExecute(BaseTool):
    """A tool for executing Python code with timeout and safety restrictions."""

    name: str = "python_execute"
    description: str = "Executes Python code string. Note: Only print outputs are visible, function return values are not captured. Use print statements to see results."
    parameters: dict = {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "The Python code to execute.",
            },
        },
        "required": ["code"],
    }

    def _run_code(self, code: str, result_dict: dict, safe_globals: dict) -> None:
        original_stdout = sys.stdout
        try:
            output_buffer = StringIO()
            sys.stdout = output_buffer
            exec(code, safe_globals, safe_globals)
            result_dict["observation"] = output_buffer.getvalue()
            result_dict["success"] = True
        except Exception as e:
            result_dict["observation"] = str(e)
            result_dict["success"] = False
        finally:
            sys.stdout = original_stdout

    async def execute(
        self,
        code: str,
        timeout: int = 5,
    ) -> Dict:
        """
        Executes the provided Python code with a timeout and sends the result to the frontend.
        """
        # --- INIZIO MODIFICA 1: Invia l'evento 'action' al frontend ---
        # Annuncia l'azione nel flusso di eventi prima di eseguirla.
        if self.callback_handler:
            # Tronca il codice se è troppo lungo per una visualizzazione pulita
            content_preview = (code[:70] + '...') if len(code) > 70 else code
            await self.callback_handler(
                "action",
                title="🐍 Python: Esecuzione Script",
                content=content_preview.replace('\n', ' ')
            )
        # --- FINE MODIFICA 1 ---

        with multiprocessing.Manager() as manager:
            result_proxy = manager.dict({"observation": "", "success": False})
            if isinstance(__builtins__, dict):
                safe_globals = {"__builtins__": __builtins__}
            else:
                safe_globals = {"__builtins__": __builtins__.__dict__.copy()}

            proc = multiprocessing.Process(
                target=self._run_code, args=(code, result_proxy, safe_globals)
            )
            proc.start()
            proc.join(timeout)

            if proc.is_alive():
                proc.terminate()
                proc.join(1)
                final_result = {
                    "observation": f"Execution timeout after {timeout} seconds",
                    "success": False,
                }
            else:
                final_result = dict(result_proxy)

        # --- INIZIO MODIFICA 2: Invia l'output del terminale al frontend ---
        if self.callback_handler:
            terminal_content = (
                f">>> # Esecuzione del codice Python:\n"
                f">>> {code}\n"
                f"{final_result['observation']}"
            )

            await self.callback_handler(
                "terminal_output",
                content=terminal_content.strip()
            )
        # --- FINE MODIFICA 2 ---

        return final_result



